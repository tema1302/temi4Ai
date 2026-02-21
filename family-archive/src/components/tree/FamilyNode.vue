<script setup lang="ts">
import { Handle, Position } from '@vue-flow/core'
import { computed } from 'vue'
import type { FamilyMember } from '@/modules/family/domain/models'

interface Props {
  data: {
    label?: string
    isFilled?: boolean
    name?: string
    years?: string
    isSelf?: boolean
    role?: string
    member?: FamilyMember
    generation?: number
    displayRole?: string
    photoUrl?: string
  }
}

const props = defineProps<Props>()

const nodeClasses = computed(() => {
  if (props.data.isFilled) {
    return 'bg-charcoal border-white/10 text-silk'
  }
  return 'bg-white/5 border-white/10 text-gray-500'
})

const borderClasses = computed(() => {
  if (props.data.isFilled) {
    return 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
  }
  return 'border-white/10'
})

const displayName = computed(() => {
  return props.data.name || props.data.member?.name || 'Без имени'
})

const displayRole = computed(() => {
  return props.data.displayRole || props.data.member?.displayRole || props.data.member?.relationship || ''
})

const displayYears = computed(() => {
  if (props.data.years) return props.data.years
  const member = props.data.member
  if (!member) return ''
  return `${member.birthDate} ${member.deathDate ? '- ' + member.deathDate : ''}`
})

const displayPhoto = computed(() => {
  return props.data.photoUrl || props.data.member?.photoUrl
})
</script>

<template>
  <div
    class="px-4 py-3 rounded-xl border-2 transition-all duration-300 min-w-[160px] text-center cursor-pointer hover:scale-105"
    :class="[nodeClasses, borderClasses]"
  >
    <!-- Filled State -->
    <div v-if="data.isFilled" class="flex flex-col gap-2">
      <!-- Avatar -->
      <div v-if="displayPhoto" class="w-12 h-12 mx-auto rounded-full overflow-hidden border border-white/20">
        <img
          :src="displayPhoto"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-cover"
          alt=""
        />
      </div>
      <div v-else class="w-12 h-12 mx-auto rounded-full bg-gold/10 flex items-center justify-center text-xl text-gold font-serif">
        {{ displayName.charAt(0) }}
      </div>

      <!-- Info -->
      <div class="flex flex-col gap-0.5">
        <span class="text-[8px] uppercase tracking-widest text-gold font-bold opacity-80">{{ displayRole }}</span>
        <span class="text-sm font-serif text-silk font-bold truncate max-w-[140px]">{{ displayName }}</span>
        <span v-if="displayYears" class="text-[9px] text-gray-400 font-mono">{{ displayYears }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="flex flex-col gap-1 py-2">
      <span class="text-[10px] uppercase tracking-widest font-bold">{{ data.label || 'Добавить' }}</span>
      <div class="mt-2 text-xs text-gold/60">
        <span class="px-2 py-0.5 rounded-full border border-gold/20">+ добавить</span>
      </div>
    </div>

    <!-- Handles for Vue Flow connections -->
    <Handle type="target" :position="Position.Top" class="!bg-gold/30 !border-none !w-2 !h-2" />
    <Handle type="source" :position="Position.Bottom" class="!bg-gold/30 !border-none !w-2 !h-2" />
  </div>
</template>

<style scoped>
.vue-flow__handle {
  opacity: 0.5;
}
.vue-flow__handle:hover {
  opacity: 1;
}
</style>
