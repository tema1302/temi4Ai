<script setup lang="ts">
import type { FamilyRole } from '../../modules/family/domain/constants'

interface Props {
  label: string
  isActive?: boolean
  gridArea: string
  role: FamilyRole
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [role: FamilyRole]
}>()
</script>

<template>
  <button
    @click="emit('select', props.role)"
    class="flex items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 text-xs font-bold uppercase tracking-widest h-full w-full"
    :class="[
      props.isActive 
        ? 'bg-gold border-gold text-charcoal shadow-[0_0_20px_rgba(212,175,55,0.4)] scale-105 z-10' 
        : 'bg-white/5 border-white/10 text-gray-400 hover:border-gold/50 hover:bg-gold/5 hover:text-silk'
    ]"
    :style="{ gridArea: props.gridArea }"
  >
    {{ props.label }}
  </button>
</template>
