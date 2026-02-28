<script setup lang="ts">
import { onMounted, watch, markRaw, shallowRef, ref } from 'vue'
import { VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { Maximize, Minimize } from 'lucide-vue-next'
import FamilyNode from './FamilyNode.vue'
import type { FamilyMember, FamilyRelation, RelationType } from '@/modules/family/domain/models'
import { calculateDisplayRole } from '@/modules/family/domain/models'

const treeContainer = ref<HTMLElement | null>(null)
const isFullscreen = ref(false)

const toggleFullscreen = () => {
  if (!treeContainer.value) return
  
  if (!document.fullscreenElement) {
    treeContainer.value.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable full-screen mode: ${err.message}`)
    })
    isFullscreen.value = true
  } else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// Listen for escape key or other ways fullscreen closes
onMounted(() => {
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

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

interface Props {
  members: FamilyMember[]
  relations: FamilyRelation[]
  familyName: string
  rootMemberId?: string
  selectable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selectable: false
})
const emit = defineEmits<{
  selectMember: [memberId: string]
  addRelation: [data: { memberId: string; relationType: RelationType | 'child' | 'sibling'; gender?: 'male' | 'female' }]
  updatePosition: [data: { memberId: string; position: { x: number; y: number } }]
  addMember: []
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

  // Строим связи супругов
  const spouseOf = new Map<string, string>()
  relations.forEach(r => {
    if (r.relationType === 'spouse') {
      spouseOf.set(r.fromMemberId, r.toMemberId)
      spouseOf.set(r.toMemberId, r.fromMemberId)
    }
  })

  // Строим связи сиблингов
  const siblingOf = new Map<string, Set<string>>()
  relations.forEach(r => {
    if (r.relationType === 'sibling') {
      if (!siblingOf.has(r.fromMemberId)) siblingOf.set(r.fromMemberId, new Set())
      if (!siblingOf.has(r.toMemberId)) siblingOf.set(r.toMemberId, new Set())
      siblingOf.get(r.fromMemberId)!.add(r.toMemberId)
      siblingOf.get(r.toMemberId)!.add(r.fromMemberId)
    }
  })

  // Находим всех, у кого НЕТ родителей в базе И НЕТ сиблингов (самые старшие, не связанные с другими)
  // Сиблинги не должны попадать в oldestMembers - они получат поколение от своих братьев/сестёр
  const oldestMembers = members.filter(m => {
    const hasNoParents = !childOf.has(m.id) || childOf.get(m.id)!.length === 0
    const hasNoSiblings = !siblingOf.has(m.id) || siblingOf.get(m.id)!.size === 0
    return hasNoParents && hasNoSiblings
  })

  if (oldestMembers.length === 0 && members.length > 0) {
    // Если нет "чистых" старших, берём тех у кого нет родителей но есть сиблинги
    // Они будут первыми в своём поколении
    const membersWithNoParents = members.filter(m => !childOf.has(m.id) || childOf.get(m.id)!.length === 0)
    if (membersWithNoParents.length > 0) {
      oldestMembers.push(membersWithNoParents[0])
    } else {
      oldestMembers.push(members[0])
    }
  }

  // BFS от старших к младшим
  const queue: { id: string; gen: number }[] = oldestMembers.map(m => ({ id: m.id, gen: 0 }))
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    generationMap.set(id, gen)

    // Сначала супруги (то же поколение) - высокий приоритет
    const spouseId = spouseOf.get(id)
    if (spouseId && !visited.has(spouseId)) {
      queue.unshift({ id: spouseId, gen })
    }

    // Сиблинги (то же поколение) - высокий приоритет
    const siblings = siblingOf.get(id)
    if (siblings) {
      siblings.forEach(siblingId => {
        if (!visited.has(siblingId)) {
          queue.unshift({ id: siblingId, gen })
        }
      })
    }

    // Дети (поколение + 1)
    const children = parentOf.get(id) || []
    children.forEach(childId => {
      if (!visited.has(childId)) {
        queue.push({ id: childId, gen: gen + 1 })
      }
    })
  }

  // Члены без связей - поколение 0
  members.forEach(m => {
    if (!generationMap.has(m.id)) {
      generationMap.set(m.id, 0)
    }
  })

  return generationMap
}

// Layout function - использует сохранённые позиции или вычисляет новые
// Snake layout: поколения идут змейкой (вправо → влево → вправо → ...)
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
      savedPositions.set(member.id, member.treePosition)
    }
  })

  // Константы для snake layout
  const nodeWidth = 180
  const nodeHeight = 100
  const horizontalGap = 50
  const verticalGap = 120
  const diagonalOffset = 80 // Смещение каждого следующего поколения вправо

  // Сначала назначаем сохранённые позиции
  const positions = new Map<string, { x: number; y: number }>()
  const nodesWithSavedPositions = new Set<string>()

  nodesList.forEach(node => {
    if (savedPositions.has(node.id)) {
      positions.set(node.id, savedPositions.get(node.id)!)
      nodesWithSavedPositions.add(node.id)
    }
  })

  // Если у всех есть сохранённые позиции - используем их
  if (nodesWithSavedPositions.size === nodesList.length) {
    return nodesList.map(node => {
      const pos = positions.get(node.id)!
      return {
        ...node,
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        position: pos,
      }
    })
  }

  // Для узлов без сохранённых позиций вычисляем автоматически
  // Группируем по поколениям
  const genGroups = new Map<number, string[]>()
  nodesList.forEach(node => {
    if (!nodesWithSavedPositions.has(node.id)) {
      const gen = generationMap.get(node.id) ?? 0
      if (!genGroups.has(gen)) genGroups.set(gen, [])
      genGroups.get(gen)!.push(node.id)
    }
  })

  // Находим связи супругов для сортировки
  const spousePairs = new Map<string, string>()
  edgesList.forEach(edge => {
    if (edge.data?.relationType === 'spouse') {
      spousePairs.set(edge.source, edge.target)
      spousePairs.set(edge.target, edge.source)
    }
  })

  // Находим связи сиблингов для сортировки
  const siblingPairs = new Map<string, Set<string>>()
  edgesList.forEach(edge => {
    if (edge.data?.relationType === 'sibling') {
      if (!siblingPairs.has(edge.source)) siblingPairs.set(edge.source, new Set())
      if (!siblingPairs.has(edge.target)) siblingPairs.set(edge.target, new Set())
      siblingPairs.get(edge.source)!.add(edge.target)
      siblingPairs.get(edge.target)!.add(edge.source)
    }
  })

  // Находим родительские связи для позиционирования
  // parentOf[A] = [B, C] означает A является родителем B и C
  const parentOf = new Map<string, string[]>()
  edgesList.forEach(edge => {
    if (edge.data?.relationType === 'parent') {
      // edge.source = родитель, edge.target = ребёнок
      if (!parentOf.has(edge.source)) parentOf.set(edge.source, [])
      parentOf.get(edge.source)!.push(edge.target)
    }
  })

  // Создаём Map id -> member для доступа к данным
  const memberMap = new Map<string, FamilyMember>()
  members.forEach(m => memberMap.set(m.id, m))

  // Сортируем узлы внутри поколения: сначала по связям, потом по дате рождения
  // Новый подход: группируем связанные узлы вместе
  genGroups.forEach((ids, gen) => {
    const sorted: string[] = []
    const used = new Set<string>()

    // Вспомогательная функция для получения года рождения
    const getBirthYear = (id: string): number => {
      const member = memberMap.get(id)
      return member?.birthDate ? parseInt(member.birthDate.replace('~', '').replace('?', '0')) : 9999
    }

    // Функция для добавления члена со всеми его связями
    const addMemberWithRelations = (id: string) => {
      if (used.has(id) || !ids.includes(id)) return

      sorted.push(id)
      used.add(id)

      // Добавляем супруга справа
      const spouseId = spousePairs.get(id)
      if (spouseId && !used.has(spouseId) && ids.includes(spouseId)) {
        sorted.push(spouseId)
        used.add(spouseId)
      }

      // Добавляем сиблингов сразу после (или после супруга)
      const siblings = siblingPairs.get(id)
      if (siblings) {
        // Сортируем сиблингов по дате рождения
        const sortedSiblings = Array.from(siblings)
          .filter(sId => !used.has(sId) && ids.includes(sId))
          .sort((a, b) => getBirthYear(a) - getBirthYear(b))

        sortedSiblings.forEach(siblingId => {
          sorted.push(siblingId)
          used.add(siblingId)
        })
      }
    }

    // Сначала обрабатываем всех членов, у которых есть связи (супруги или сиблинги)
    // Сортируем по дате рождения
    const sortedByBirth = [...ids].sort((a, b) => getBirthYear(a) - getBirthYear(b))

    // Находим "корневые" узлы - те, кто имеет связи в этом поколении
    const membersWithRelations = new Set<string>()
    ids.forEach(id => {
      if (spousePairs.has(id)) membersWithRelations.add(id)
      if (siblingPairs.has(id)) membersWithRelations.add(id)
    })

    // Сначала добавляем членов с связями, начиная с самых старших
    sortedByBirth.forEach(id => {
      if (membersWithRelations.has(id)) {
        addMemberWithRelations(id)
      }
    })

    // Потом добавляем оставшихся (без связей) по дате рождения
    sortedByBirth.forEach(id => {
      if (!used.has(id)) {
        addMemberWithRelations(id)
      }
    })

    genGroups.set(gen, sorted)
  })

  // Находим максимальное количество узлов в поколении
  let maxNodesInGen = 0
  genGroups.forEach(ids => {
    if (ids.length > maxNodesInGen) maxNodesInGen = ids.length
  })

  // Расставляем узлы змейкой
  const sortedGens = Array.from(genGroups.keys()).sort((a, b) => a - b)

  sortedGens.forEach((gen, genIndex) => {
    const ids = genGroups.get(gen)!

    // Базовое смещение по X для диагонального эффекта
    const baseX = genIndex * diagonalOffset

    // Y позиция - каждое поколение ниже предыдущего
    const y = genIndex * (nodeHeight + verticalGap)

    // Расставляем узлы слева направо с одинаковыми отступами
    ids.forEach((id, posIndex) => {
      const x = baseX + posIndex * (nodeWidth + horizontalGap)
      positions.set(id, { x, y })
    })
  })

  // Создаём итоговый массив узлов с позициями
  // Используем сохранённые позиции где они есть, иначе вычисленные
  return nodesList.map(node => {
    const pos = positions.get(node.id) || { x: 0, y: 0 }
    return {
      ...node,
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
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

  // Используем generation из данных члена, либо вычисляем через calculateGenerations
  const calculatedGenerations = calculateGenerations()
  const generationMap = new Map<string, number>()
  members.forEach(member => {
    // Приоритет: member.generation > вычисленное > 0
    const gen = member.generation ?? calculatedGenerations.get(member.id) ?? 0
    generationMap.set(member.id, gen)
  })

  // Create nodes for all members
  members.forEach(member => {
    const gen = generationMap.get(member.id) ?? 0

    // Вычисляем displayRole относительно корневого члена
    const calculatedRole = calculateDisplayRole(member.id, props.rootMemberId, members, relations)

    newNodes.push({
      id: member.id,
      type: 'family',
      data: {
        member,
        generation: gen,
        isFilled: true,
        name: member.name,
        years: `${member.birthDate} ${member.deathDate ? '- ' + member.deathDate : ''}`,
        displayRole: calculatedRole,
        photoUrl: member.photoUrl,
        selectable: props.selectable,
        onAddRelative: (relationType: 'parent' | 'child' | 'spouse' | 'sibling', gender?: 'male' | 'female') => {
          emit('addRelation', { memberId: member.id, relationType, gender })
        }
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
    let edgeType = 'smoothstep'
    let animated = false

    // Определяем тип связи и соответствующий стиль
    if (relation.relationType === 'spouse') {
      edgeType = 'straight' // Прямая линия для супругов
      edgeStyle = { stroke: '#f472b6', strokeWidth: 2 } // Розовый цвет
    } else if (relation.relationType === 'sibling') {
      edgeType = 'straight' // Прямая линия для сиблингов
      edgeStyle = { stroke: '#f472b6', strokeWidth: 2 } // Розовый цвет
    }

    // Определяем позиции для connections на основе типа связи
    let sourceHandle = undefined
    let targetHandle = undefined

    if (relation.relationType === 'spouse' || relation.relationType === 'sibling') {
      // Для супругов и сиблингов - строго горизонтальные соединения
      sourceHandle = 'right'
      targetHandle = 'left'
    } else {
      // Для parent/child связей - вертикальные соединения между поколениями
      sourceHandle = 'bottom'
      targetHandle = 'top'
    }

    newEdges.push({
      id: `e-${relation.id}`,
      source: relation.fromMemberId,
      target: relation.toMemberId,
      sourceHandle,
      targetHandle,
      animated,
      style: edgeStyle,
      type: edgeType,
      data: { relationType: relation.relationType }
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
  if (props.selectable && node.data.isFilled && node.data.member) {
    emit('selectMember', node.data.member.id)
  }
})
</script>

<template>
  <div 
    ref="treeContainer"
    class="w-full h-full min-h-[500px] border border-white/5 rounded-3xl overflow-hidden bg-obsidian relative flex flex-col"
    :class="{ 'fixed inset-0 z-[100] !rounded-none !border-none': isFullscreen }"
  >
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="nodeTypes"
      :fit-view-on-init="true"
      :default-viewport="{ zoom: 0.8 }"
      :min-zoom="0.1"
      :max-zoom="3"
      :pan-on-drag="true"
      :zoom-on-scroll="true"
      :zoom-on-pinch="true"
      :nodes-draggable="true"
      :selection-on-drag="false"
      class="touch-pan-y flex-1"
      @node-drag-stop="handleNodeDragStop"
    >
      <Background :pattern-color="'#ffffff'" :gap="24" :size="1" :style="{ opacity: 0.03 }" />
      <Controls position="bottom-right" />
    </VueFlow>

    <!-- UI Overlay (Controls, Labels, Legend, Hint) -->
    <div class="absolute inset-0 pointer-events-none z-20 p-6 flex flex-col justify-between">
      <!-- Top: Title and Fullscreen -->
      <div class="flex items-start justify-between">
        <div class="flex flex-col gap-2">
          <h3 class="text-silk font-serif italic tracking-wide text-lg md:text-3xl drop-shadow-lg">
            {{ familyName }}
          </h3>
          <span class="text-gold/60 text-xs md:text-base uppercase tracking-[0.2em] font-bold drop-shadow-md">
            Семейный архив • {{ members.length }} чел.
          </span>
        </div>

        <div class="flex flex-col gap-3 items-end">
          <button
            @click="toggleFullscreen"
            class="pointer-events-auto p-3 bg-charcoal/90 border border-white/10 rounded-full text-silk hover:text-gold hover:border-gold/30 transition-colors shadow-lg"
            :title="isFullscreen ? 'Свернуть' : 'На весь экран'"
          >
            <Minimize v-if="isFullscreen" class="w-5 h-5" />
            <Maximize v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Bottom: Legend (positioned to not overlap fullscreen button) -->
      <div class="absolute bottom-6 left-6 z-20">
        <!-- Tree Legend -->
        <div class="bg-charcoal/95 border border-white/10 p-4 md:p-6 rounded-3xl shadow-lg pointer-events-auto max-w-xs">
          <p class="text-[10px] md:text-xs uppercase tracking-[0.2em] text-gray-400 font-bold mb-4 opacity-80">Типы связей</p>
          <div class="flex flex-col gap-3 md:gap-4">
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]"></div>
              <span class="text-xs md:text-base text-silk/90 font-medium">Прямая линия (Родители / Дети)</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-4 h-4 md:w-6 md:h-6 rounded-full bg-[#f472b6] shadow-[0_0_10px_rgba(244,114,182,0.4)]"></div>
              <span class="text-xs md:text-base text-silk/90 font-medium">Боковая линия (Супруги / Братья и сестры)</span>
            </div>
          </div>
        </div>
      </div>
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
  /* Removed stroke-dasharray for better performance */
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
  background: rgba(212,175,55,0.15);
}
</style>
