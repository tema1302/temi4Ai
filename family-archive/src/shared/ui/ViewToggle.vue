<script setup lang="ts">
interface Props {
  modelValue: 'cards' | 'tree'
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: 'cards' | 'tree']
}>()

const options = [
  { value: 'cards' as const, label: 'Список' },
  { value: 'tree' as const, label: 'Древо' }
]
</script>

<template>
  <div class="inline-flex bg-white/5 rounded-full p-1 border border-white/10 shadow-inner">
    <button
      v-for="option in options"
      :key="option.value"
      @click="emit('update:modelValue', option.value)"
      class="flex items-center justify-center px-4 md:px-8 py-2.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300"
      :class="modelValue === option.value
        ? 'bg-gold text-charcoal shadow-[0_0_20px_rgba(212,175,55,0.2)] scale-105 z-10'
        : 'text-gray-500 hover:text-silk hover:bg-white/5'"
    >
      {{ option.label }}
    </button>
  </div>
</template>
