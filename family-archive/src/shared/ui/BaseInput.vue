<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'url' | 'date' | 'textarea'
  rows?: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  rows: 4,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const inputClasses = computed(() => [
  'w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk',
  'placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors',
])
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm text-gray-400 mb-2">{{ label }}</label>
    
    <textarea
      v-if="type === 'textarea'"
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :class="inputClasses"
      class="resize-none"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    
    <input
      v-else
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :class="inputClasses"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>
