<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { VueFlow, useVueFlow, Position } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import dagre from 'dagre'
import FamilyNode from './FamilyNode.vue'
import { FamilyRole, FAMILY_STRUCTURE_CONFIG } from '../../modules/family/domain/constants'
import type { FamilyMember } from '../../modules/family/domain/models'

interface Props {
  members: FamilyMember[]
  familyName: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  selectRole: [role: FamilyRole]
  selectMember: [memberId: string]
}>()

const { onNodeClick, fitView } = useVueFlow()

const nodes = ref<any[]>([])
const edges = ref<any[]>([])

// Layout function using dagre
const layoutNodes = (nodes: any[], edges: any[]) => {
  const g = new dagre.graphlib.Graph()
  g.setGraph({ rankdir: 'TB', nodesep: 150, ranksep: 200 })
  g.setDefaultEdgeLabel(() => ({}))

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 160, height: 80 })
  })

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  return nodes.map((node) => {
    const nodeWithPosition = g.node(node.id)
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: { x: nodeWithPosition.x - 80, y: nodeWithPosition.y - 40 },
    }
  })
}

const buildTree = () => {
  const newNodes: any[] = []
  const newEdges: any[] = []

  // Create nodes for each role in FAMILY_STRUCTURE_CONFIG
  // Map members to these roles if they exist
  FAMILY_STRUCTURE_CONFIG.forEach((config) => {
    // Check if we have a member for this role
    // For simplicity, we match by relationship label (hacky, but matches current store logic)
    // Actually, store has `relationship` string.
    const member = props.members.find(m => m.relationship === config.label)
    
    newNodes.push({
      id: config.role,
      type: 'family',
      data: {
        label: config.label,
        isFilled: !!member,
        name: member?.name,
        years: member ? `${member.birthDate} ${member.deathDate ? '- ' + member.deathDate : ''}` : '',
        isSelf: config.role === FamilyRole.SELF,
        role: config.role,
        memberId: member?.id
      }
    })
  })

  // Define edges based on roles
  const edgeDefinitions = [
    { source: FamilyRole.GREAT_GRANDFATHER, target: FamilyRole.GRANDFATHER },
    { source: FamilyRole.GREAT_GRANDMOTHER, target: FamilyRole.GRANDFATHER },
    { source: FamilyRole.GRANDFATHER, target: FamilyRole.FATHER },
    { source: FamilyRole.GRANDMOTHER, target: FamilyRole.FATHER }, // Assuming father's parents for simplicity or add more roles
    { source: FamilyRole.FATHER, target: FamilyRole.SELF },
    { source: FamilyRole.MOTHER, target: FamilyRole.SELF },
    { source: FamilyRole.FATHER, target: FamilyRole.BROTHER },
    { source: FamilyRole.MOTHER, target: FamilyRole.BROTHER },
    { source: FamilyRole.FATHER, target: FamilyRole.SISTER },
    { source: FamilyRole.MOTHER, target: FamilyRole.SISTER },
    { source: FamilyRole.SELF, target: FamilyRole.CHILD },
    { source: FamilyRole.SPOUSE, target: FamilyRole.CHILD },
  ]

  edgeDefinitions.forEach((def, index) => {
    newEdges.push({
      id: `e-${index}`,
      source: def.source,
      target: def.target,
      animated: true,
      style: { stroke: '#d4af37', strokeWidth: 2, opacity: 0.4 }
    })
  })

  nodes.value = layoutNodes(newNodes, newEdges)
  edges.value = newEdges
}

onMounted(() => {
  buildTree()
  setTimeout(() => {
    fitView()
  }, 100)
})

watch(() => props.members, () => {
  buildTree()
}, { deep: true })

onNodeClick(({ node }) => {
  if (node.data.isFilled && node.data.memberId) {
    emit('selectMember', node.data.memberId)
  } else {
    emit('selectRole', node.data.role as FamilyRole)
  }
})
</script>

<template>
  <div class="w-full h-full min-h-[500px] border border-white/5 rounded-3xl overflow-hidden bg-obsidian relative">
    <VueFlow
      v-model:nodes="nodes"
      v-model:edges="edges"
      :node-types="{ family: FamilyNode }"
      :fit-view-on-init="true"
      :default-viewport="{ zoom: 0.8 }"
      :min-zoom="0.2"
      :max-zoom="2"
    >
      <Background :pattern-color="'#ffffff'" :gap="20" :size="1" :style="{ opacity: 0.05 }" />
      <Controls position="bottom-right" />
    </VueFlow>

    <!-- Overlay hint -->
    <div class="absolute top-4 left-4 pointer-events-none">
       <h3 class="text-silk/40 text-[10px] uppercase tracking-widest font-bold">Интерактивное древо: {{ familyName }}</h3>
    </div>
  </div>
</template>

<style>
@import '@vue-flow/core/dist/style.css';
@import '@vue-flow/core/dist/theme-default.css';
@import '@vue-flow/controls/dist/style.css';

/* Customizing Vue Flow theme to match project */
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
