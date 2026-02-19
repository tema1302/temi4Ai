<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'

interface Props {
  data: {
    label: string
    isFilled?: boolean
    name?: string
    years?: string
    isSelf?: boolean
    role: string
  }
}

const props = defineProps<Props>()

const nodeClasses = computed(() => {
  if (props.data.isFilled) {
    return 'bg-charcoal border-white/10 text-silk'
  }
  if (props.data.isSelf) {
    return 'bg-blue-600/20 border-blue-500 text-blue-100'
  }
  return 'bg-white/5 border-white/10 text-gray-500'
})

const borderClasses = computed(() => {
  if (props.data.isFilled) {
    return 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
  }
  if (props.data.isSelf) {
    return 'border-blue-500'
  }
  return 'border-white/10'
})
</script>

<template>
  <div 
    class="px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[140px] text-center"
    :class="[nodeClasses, borderClasses]"
  >
    <!-- Filled State -->
    <div v-if="data.isFilled" class="flex flex-col gap-1">
      <span class="text-[8px] uppercase tracking-widest text-gold font-bold opacity-80">{{ data.label }}</span>
      <span class="text-sm font-serif text-silk font-bold">{{ data.name }}</span>
      <span v-if="data.years" class="text-[9px] text-gray-400 font-mono">{{ data.years }}</span>
    </div>

    <!-- Empty/Role State -->
    <div v-else class="flex flex-col gap-1 py-1">
      <span class="text-[10px] uppercase tracking-widest font-bold">{{ data.label }}</span>
      <div v-if="data.role === 'child'" class="mt-2 text-xs text-gold/60">
        <span class="px-2 py-0.5 rounded-full border border-gold/20">+ добавить</span>
      </div>
    </div>

    <!-- Handles for Vue Flow connections -->
    <Handle type="target" :position="Position.Top" class="!bg-gold/30 !border-none !w-2 !h-2" />
    <Handle type="source" :position="Position.Bottom" class="!bg-gold/30 !border-none !w-2 !h-2" />
  </div>
</template>

<style scoped>
/* Ensure handles are not visible when not dragging if desired, or styled properly */
.vue-flow__handle {
  opacity: 0.5;
}
.vue-flow__handle:hover {
  opacity: 1;
}
</style>
