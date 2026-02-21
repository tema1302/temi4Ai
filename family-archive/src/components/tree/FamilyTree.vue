<script setup lang="ts">
import { onMounted, watch, markRaw, shallowRef, ref } from 'vue'
import { VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import FamilyNode from './FamilyNode.vue'
import type { FamilyMember, FamilyRelation, RelationType } from '@/modules/family/domain/models'

// Node types для VueFlow (используем any для обхода проблемы с типами VueFlow)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const nodeTypes: any = markRaw({ family: FamilyNode })

// Debounce utility
function useDebounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

// Shallow refs for better performance with large arrays
const nodes = shallowRef<any[]>([])
const edges = shallowRef<any[]>([])

// Режим перетаскивания (активируется кнопкой)
const isDragMode = ref(false)

interface Props {
  members: FamilyMember[]
  relations: FamilyRelation[]
  familyName: string
  rootMemberId?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectMember: [memberId: string]
  addRelation: [data: { memberId: string; relationType: RelationType }]
  updatePosition: [data: { memberId: string; position: { x: number; y: number } }]
  resetLayout: []
}>()

const { onNodeClick, fitView } = useVueFlow()

// Кеш для отслеживания изменений (только ID и структура связей)
let lastMembersSignature = ''
let lastRelationsSignature = ''

// Безопасный доступ к данным
const safeMembers = () => props.members || []
const safeRelations = () => props.relations || []

// Calculate generations for layout
// Старшие поколения (родители, дедушки) сверху = поколение 0
// Дети и внуки ниже = поколение 1, 2, ...
const calculateGenerations = () => {
  const generationMap = new Map<string, number>()
  const members = safeMembers()
  const relations = safeRelations()

  if (members.length === 0) return generationMap

  // Строим граф родительских связей
  // parentOf[A] = [B, C] означает A является родителем B и C
  // childOf[A] = [B] означает B является родителем A
  const parentOf = new Map<string, string[]>()
  const childOf = new Map<string, string[]>()

  relations.forEach(r => {
    if (r.relationType === 'parent') {
      // fromMemberId = родитель, toMemberId = ребёнок
      if (!parentOf.has(r.fromMemberId)) parentOf.set(r.fromMemberId, [])
      parentOf.get(r.fromMemberId)!.push(r.toMemberId)

      if (!childOf.has(r.toMemberId)) childOf.set(r.toMemberId, [])
      childOf.get(r.toMemberId)!.push(r.fromMemberId)
    }
  })

  // Находим всех, у кого НЕТ родителей в базе (самые старшие)
  const oldestMembers = members.filter(m => !childOf.has(m.id) || childOf.get(m.id)!.length === 0)

  if (oldestMembers.length === 0 && members.length > 0) {
    oldestMembers.push(members[0])
  }

  // BFS от старших к младшим
  const queue: { id: string; gen: number }[] = oldestMembers.map(m => ({ id: m.id, gen: 0 }))
  const visited = new Set<string>()

  // Строим связи супругов
  const spouseOf = new Map<string, string>()
  relations.forEach(r => {
    if (r.relationType === 'spouse') {
      spouseOf.set(r.fromMemberId, r.toMemberId)
      spouseOf.set(r.toMemberId, r.fromMemberId)
    }
  })

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    generationMap.set(id, gen)

    // Сначала супруги (то же поколение)
    const spouseId = spouseOf.get(id)
    if (spouseId && !visited.has(spouseId)) {
      queue.unshift({ id: spouseId, gen })
    }

    // Дети (поколение + 1)
    const children = parentOf.get(id) || []
    children.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, gen: gen + 1 })
      }
    })
  }

  // Члены без связей
  members.forEach(m => {
    if (!generationMap.has(m.id)) {
      generationMap.set(m.id, 0)
    }
  })

  return generationMap
}

// Layout function - использует сохранённые позиции или вычисляет новые
const layoutNodes = (
  nodesList: any[],
  edgesList: any[],
  generationMap: Map<string, number>,
  members: FamilyMember[]
) => {
  if (nodesList.length === 0) return []

  // Создаём Map сохранённых позиций из members
  const savedPositions = new Map<string, { x: number; y: number }>()
  members.forEach(member => {
    if (member.treePosition) {
      console.log(`[FamilyTree] Found saved position for ${member.name}:`, member.treePosition)
      savedPositions.set(member.id, member.treePosition)
    }
  })

  console.log(`[FamilyTree] Total saved positions: ${savedPositions.size} / ${members.length}`)

  // Если у всех членов есть сохранённые позиции - используем их
  const allHavePositions = nodesList.every(node => savedPositions.has(node.id))
  if (allHavePositions) {
    return nodesList.map(node => {
      const pos = savedPositions.get(node.id)!
      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: pos,
      }
    })
  }

  // Иначе вычисляем позиции автоматически
  // Группируем узлы по поколениям
  const genGroups = new Map<number, string[]>()
  nodesList.forEach(node => {
    const gen = generationMap.get(node.id) ?? 0
    if (!genGroups.has(gen)) genGroups.set(gen, [])
    genGroups.get(gen)!.push(node.id)
  })

  // Находим связи супругов для сортировки
  const spousePairs = new Map<string, string>()
  edgesList.forEach(edge => {
    const isSpouse = edge.style?.stroke === '#ec4899'
    if (isSpouse) {
      spousePairs.set(edge.source, edge.target)
      spousePairs.set(edge.target, edge.source)
    }
  })

  // Сортируем узлы внутри каждого поколения: супруги рядом
  genGroups.forEach((ids, gen) => {
    const sorted: string[] = []
    const used = new Set<string>()

    ids.forEach(id => {
      if (used.has(id)) return

      sorted.push(id)
      used.add(id)

      // Если есть супруг, добавляем сразу после
      const spouseId = spousePairs.get(id)
      if (spouseId && !used.has(spouseId) && ids.includes(spouseId)) {
        sorted.push(spouseId)
        used.add(spouseId)
      }
    })

    genGroups.set(gen, sorted)
  })

  // Вычисляем позиции вручную для полного контроля
  const nodeWidth = 180
  const nodeHeight = 100
  const horizontalGap = 40
  const verticalGap = 80

  const positions = new Map<string, { x: number; y: number }>()

  // Находим максимальную ширину для центрирования
  let maxWidth = 0
  genGroups.forEach(ids => {
    const width = ids.length * nodeWidth + (ids.length - 1) * horizontalGap
    if (width > maxWidth) maxWidth = width
  })

  // Расставляем узлы
  const sortedGens = Array.from(genGroups.keys()).sort((a, b) => a - b)
  sortedGens.forEach((gen, genIndex) => {
    const ids = genGroups.get(gen)!
    const totalWidth = ids.length * nodeWidth + (ids.length - 1) * horizontalGap
    const startX = (maxWidth - totalWidth) / 2
    const y = genIndex * (nodeHeight + verticalGap)

    ids.forEach((id, posIndex) => {
      const x = startX + posIndex * (nodeWidth + horizontalGap)
      positions.set(id, { x, y })
    })
  })

  // Создаём итоговый массив узлов с позициями
  // Используем сохранённые позиции где они есть
  return nodesList.map(node => {
    // Приоритет: сохранённая позиция > вычисленная
    const pos = savedPositions.get(node.id) || positions.get(node.id) || { x: 0, y: 0 }
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: pos,
    }
  })
}

// Build tree from relations
const buildTree = (force = false) => {
  const members = safeMembers()
  const relations = safeRelations()

  // Создаём сигнатуру для определения реальных изменений структуры
  // Включаем только ID и типы связей, игнорируем остальные данные
  const membersSignature = members.map(m => m.id).sort().join(',')
  const relationsSignature = relations.map(r => `${r.fromMemberId}-${r.toMemberId}-${r.relationType}`).sort().join(',')

  // Если структура не изменилась и не принудительный пересчёт - пропускаем
  if (!force && membersSignature === lastMembersSignature && relationsSignature === lastRelationsSignature) {
    return
  }

  lastMembersSignature = membersSignature
  lastRelationsSignature = relationsSignature

  const newNodes: any[] = []
  const newEdges: any[] = []
  const generationMap = calculateGenerations()

  // Create nodes for all members
  members.forEach(member => {
    const gen = generationMap.get(member.id) ?? member.generation ?? 0
    newNodes.push({
      id: member.id,
      type: 'family',
      data: {
        member,
        generation: gen,
        isFilled: true,
        name: member.name,
        years: `${member.birthDate} ${member.deathDate ? '- ' + member.deathDate : ''}`,
        displayRole: member.displayRole || member.relationship || 'Член семьи',
        photoUrl: member.photoUrl
      }
    })
  })

  // Create edges from relations (только если оба члена существуют)
  const memberIds = new Set(members.map(m => m.id))
  relations.forEach(relation => {
    // Пропускаем связи где один из членов не существует
    if (!memberIds.has(relation.fromMemberId) || !memberIds.has(relation.toMemberId)) {
      return
    }

    let edgeStyle: any = { stroke: '#d4af37', strokeWidth: 2 }
    let animated = true

    if (relation.relationType === 'spouse') {
      edgeStyle = { stroke: '#ec4899', strokeWidth: 2 }
      animated = false
    } else if (relation.relationType === 'sibling') {
      edgeStyle = { stroke: '#60a5fa', strokeWidth: 2, strokeDasharray: '5,5' }
      animated = false
    }

    newEdges.push({
      id: `e-${relation.id}`,
      source: relation.fromMemberId,
      target: relation.toMemberId,
      animated,
      style: edgeStyle
    })
  })

  // If no members, show placeholder
  if (members.length === 0) {
    newNodes.push({
      id: 'empty',
      type: 'family',
      data: {
        isFilled: false,
        label: 'Добавьте первого члена семьи',
        displayRole: ''
      }
    })
  }

  // Используем markRaw для узлов чтобы избежать лишней реактивности
  nodes.value = markRaw(layoutNodes(newNodes, newEdges, generationMap, members))
  edges.value = markRaw(newEdges)
}

// Обработчик перетаскивания узла - вызывается из шаблона
const handleNodeDragStop = (event: { node: { id: string; position: { x: number; y: number } } }) => {
  if (!isDragMode.value) return

  const { node } = event
  console.log('[FamilyTree] Node drag stop:', node.id, node.position)

  if (node && node.id && node.position) {
    // Emit synchronously, parent handles async save
    emit('updatePosition', {
      memberId: node.id,
      position: { x: node.position.x, y: node.position.y }
    })
  }
}

// Переключение режима перетаскивания
const toggleDragMode = () => {
  isDragMode.value = !isDragMode.value
}

// Сброс layout к автоматическому
const resetLayout = () => {
  emit('resetLayout')
}

onMounted(() => {
  buildTree(true)
  setTimeout(() => {
    fitView({ padding: 0.2 })
  }, 100)
})

// Debounced build для частых обновлений (50ms debounce)
const debouncedBuildTree = useDebounce(() => buildTree(false), 50)

// Watch без deep: true - проверяем только длину массивов
watch(
  () => ({
    membersLength: props.members?.length ?? 0,
    relationsLength: props.relations?.length ?? 0,
    // Хеш из ID для определения реальных изменений структуры
    membersHash: (props.members ?? []).map(m => m.id).join(','),
    relationsHash: (props.relations ?? []).map(r => `${r.fromMemberId}-${r.toMemberId}`).join(',')
  }),
  (newVal, oldVal) => {
    if (newVal.membersLength !== oldVal?.membersLength ||
        newVal.relationsLength !== oldVal?.relationsLength ||
        newVal.membersHash !== oldVal?.membersHash ||
        newVal.relationsHash !== oldVal?.relationsHash) {
      // Структура изменилась - пересчитываем с debounce
      debouncedBuildTree()
    }
  },
  { immediate: false }
)

onNodeClick(({ node }) => {
  if (node.data.isFilled && node.data.member) {
    emit('selectMember', node.data.member.id)
  }
})
</script>

<template>
  <div class="w-full h-full min-h-[500px] border border-white/5 rounded-3xl overflow-hidden bg-obsidian relative">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :fit-view-on-init="true"
      :default-viewport="{ zoom: 0.8 }"
      :min-zoom="0.1"
      :max-zoom="3"
      :pan-on-drag="!isDragMode"
      :zoom-on-scroll="true"
      :zoom-on-pinch="true"
      :nodes-draggable="isDragMode"
      class="touch-pan-y"
      @node-drag-stop="handleNodeDragStop"
    >
      <Background :pattern-color="'#ffffff'" :gap="24" :size="1" :style="{ opacity: 0.03 }" />
      <Controls position="bottom-right" />
    </VueFlow>

    <!-- Header overlay -->
    <div class="absolute top-4 left-4 right-4 pointer-events-none md:right-auto">
      <div class="flex items-center gap-2">
        <h3 class="text-silk/40 text-[10px] uppercase tracking-widest font-bold">
          {{ familyName }}
        </h3>
        <span class="text-gray-600 text-[10px]">• {{ members.length }} чел.</span>
      </div>
    </div>

    <!-- Drag mode controls -->
    <div class="absolute top-4 right-4 flex gap-2 pointer-events-auto">
      <!-- Drag mode toggle -->
      <button
        @click="toggleDragMode"
        :class="[
          'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
          isDragMode
            ? 'bg-gold text-charcoal shadow-lg shadow-gold/20'
            : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-silk border border-white/10'
        ]"
      >
        {{ isDragMode ? '✓ Режим перетаскивания' : '↔ Переместить' }}
      </button>

      <!-- Reset layout button -->
      <button
        v-if="isDragMode"
        @click="resetLayout"
        class="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-silk border border-white/10 transition-all"
      >
        ↺ Сбросить
      </button>
    </div>

    <!-- Drag mode hint -->
    <div v-if="isDragMode" class="absolute bottom-4 left-4 right-4 pointer-events-none">
      <p class="text-center text-gold text-xs bg-gold/10 rounded-lg py-2 px-4 border border-gold/20">
        Перетащите карточки для изменения позиций • Позиции сохраняются автоматически
      </p>
    </div>

    <!-- Mobile hint (когда не в режиме перетаскивания) -->
    <div v-else class="md:hidden absolute bottom-4 left-4 right-4 pointer-events-none">
      <p class="text-center text-gray-500 text-xs bg-black/50 rounded-lg py-2 px-4">
        Нажмите для редактирования • Разведите пальцы для масштаба
      </p>
    </div>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';

.vue-flow__node-family {
  background: transparent;
  border: none;
  padding: 0;
}

.vue-flow__edge-path {
  stroke-dasharray: 5;
}

.vue-flow__controls {
  background: #24242d;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  overflow: hidden;
}

.vue-flow__controls-button {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  color: #f5f5f7;
  fill: #f5f5f7;
}

.vue-flow__controls-button:hover {
  background: rgba(212,175,55,0.1);
}
</style>
