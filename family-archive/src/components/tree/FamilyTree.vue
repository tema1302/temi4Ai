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
const calculateGenerations = () => {
  const generationMap = new Map<string, number>()
  const members = safeMembers()
  const relations = safeRelations()

  if (members.length === 0) return generationMap

  // Find root member
  const rootMember = members.find(m => m.id === props.rootMemberId) || members[0]
  if (!rootMember) return generationMap

  // BFS for generation calculation
  const queue = [{ id: rootMember.id, gen: 0 }]
  const visited = new Set<string>()

  while (queue.length > 0) {
    const { id, gen } = queue.shift()!
    if (visited.has(id)) continue
    visited.add(id)
    generationMap.set(id, gen)

    // Parents (gen - 1)
    relations
      .filter(r => r.toMemberId === id && r.relationType === 'parent')
      .forEach(r => {
        if (!visited.has(r.fromMemberId)) {
          queue.push({ id: r.fromMemberId, gen: gen - 1 })
        }
      })

    // Children (gen + 1)
    relations
      .filter(r => r.fromMemberId === id && r.relationType === 'parent')
      .forEach(r => {
        if (!visited.has(r.toMemberId)) {
          queue.push({ id: r.toMemberId, gen: gen + 1 })
        }
      })

    // Spouses (same gen)
    relations
      .filter(r => r.relationType === 'spouse' && (r.fromMemberId === id || r.toMemberId === id))
      .forEach(r => {
        const spouseId = r.fromMemberId === id ? r.toMemberId : r.fromMemberId
        if (!visited.has(spouseId)) {
          queue.push({ id: spouseId, gen })
        }
      })

    // Siblings (same gen)
    relations
      .filter(r => r.relationType === 'sibling' && (r.fromMemberId === id || r.toMemberId === id))
      .forEach(r => {
        const siblingId = r.fromMemberId === id ? r.toMemberId : r.fromMemberId
        if (!visited.has(siblingId)) {
          queue.push({ id: siblingId, gen })
        }
      })
  }

  // Handle members without relations
  members.forEach(m => {
    if (!generationMap.has(m.id)) {
      generationMap.set(m.id, m.generation || 0)
    }
  })

  return generationMap
}

// Layout function using dagre
const layoutNodes = (nodesList: any[], edgesList: any[]) => {
  if (nodesList.length === 0) return []

  const g = new dagre.graphlib.Graph()
  g.setGraph({
    rankdir: 'TB',
    nodesep: 120,
    ranksep: 180,
    align: 'CENTER'
  })
  g.setDefaultEdgeLabel(() => ({}))

  // Собираем все ID узлов
  const nodeIds = new Set(nodesList.map(n => n.id))

  // Сначала добавляем все узлы
  nodesList.forEach((node) => {
    g.setNode(node.id, { width: 180, height: 100 })
  })

  // Добавляем только те рёбра, которые ссылаются на существующие узлы
  const validEdges: any[] = []
  edgesList.forEach((edge) => {
    if (nodeIds.has(edge.source) && nodeIds.has(edge.target)) {
      g.setEdge(edge.source, edge.target)
      validEdges.push(edge)
    }
  })

  try {
    dagre.layout(g)
  } catch (e) {
    console.warn('Dagre layout error:', e)
    // Возвращаем узлы без позиционирования dagre
    return nodesList.map((node, index) => ({
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: { x: (index % 5) * 200, y: Math.floor(index / 5) * 200 },
    }))
  }

  return nodesList.map((node) => {
    const nodeWithPosition = g.node(node.id)
    if (!nodeWithPosition) {
      // Fallback позиция если dagre не смог позиционировать
      const index = nodesList.findIndex(n => n.id === node.id)
      return {
        ...node,
        targetPosition: Position.Top,
        sourcePosition: Position.Bottom,
        position: { x: (index % 5) * 200, y: Math.floor(index / 5) * 200 },
      }
    }
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: { x: nodeWithPosition.x - 90, y: nodeWithPosition.y - 50 },
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

  nodes.value = layoutNodes(newNodes, newEdges)
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
