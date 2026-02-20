<script setup lang="ts">
import { ref, onMounted, watch, markRaw } from 'vue'
import { VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import dagre from 'dagre'
import FamilyNode from './FamilyNode.vue'
import type { FamilyMember, FamilyRelation, RelationType } from '@/modules/family/domain/models'

// markRaw чтобы Vue не делал компонент реактивным
const nodeTypes = markRaw({ family: FamilyNode })

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
}>()

const { onNodeClick, fitView } = useVueFlow()

const nodes = ref<any[]>([])
const edges = ref<any[]>([])

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

  console.log('Generation map:', Object.fromEntries(generationMap))
  console.log('Oldest members:', oldestMembers.map(m => m.name))

  return generationMap
}

// Layout function using dagre
const layoutNodes = (nodesList: any[], edgesList: any[], generationMap: Map<string, number>) => {
  if (nodesList.length === 0) return []

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
  return nodesList.map(node => {
    const pos = positions.get(node.id) || { x: 0, y: 0 }
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: { x: pos.x, y: pos.y },
    }
  })
}

// Build tree from relations
const buildTree = () => {
  const newNodes: any[] = []
  const newEdges: any[] = []
  const generationMap = calculateGenerations()
  const members = safeMembers()
  const relations = safeRelations()

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

    let edgeStyle = { stroke: '#d4af37', strokeWidth: 2 }
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

  nodes.value = layoutNodes(newNodes, newEdges, generationMap)
  edges.value = newEdges
}

onMounted(() => {
  buildTree()
  setTimeout(() => {
    fitView({ padding: 0.2 })
  }, 100)
})

watch(() => [props.members, props.relations], () => {
  if (props.members !== undefined && props.relations !== undefined) {
    buildTree()
  }
}, { deep: true })

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
      :pan-on-drag="true"
      :zoom-on-scroll="true"
      :zoom-on-pinch="true"
      class="touch-pan-y"
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

    <!-- Mobile hint -->
    <div class="md:hidden absolute bottom-4 left-4 right-4 pointer-events-none">
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
