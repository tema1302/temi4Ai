<script setup lang="ts">
interface Props {
  modelValue: 'cards' | 'tree'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: 'cards' | 'tree']
}>()

const options = [
  { value: 'cards' as const, label: 'Карточки' },
  { value: 'tree' as const, label: 'Древо' }
]
</script>

<template>
  <div class="inline-flex bg-white/5 rounded-full p-1 border border-white/10">
    <button
      v-for="option in options"
      :key="option.value"
      @click="emit('update:modelValue', option.value)"
      class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all"
      :class="modelValue === option.value
        ? 'bg-gold text-charcoal shadow-lg'
        : 'text-gray-400 hover:text-silk'"
    >
      <!-- Grid Icon for Cards -->
      <svg
        v-if="option.value === 'cards'"
        class="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>

      <!-- Tree Icon for Tree -->
      <svg
        v-else
        class="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M6 3v12"/>
        <circle cx="18" cy="6" r="3"/>
        <circle cx="6" cy="18" r="3"/>
        <path d="M6 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
        <path d="M18 9a9 9 0 0 1-9 9"/>
      </svg>

      <span class="hidden sm:inline">{{ option.label }}</span>
    </button>
  </div>
</template>
