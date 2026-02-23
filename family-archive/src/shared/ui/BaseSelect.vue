<script setup lang="ts">
import { ChevronDown } from 'lucide-vue-next'

interface Option {
  label: string
  value: any
}

interface Props {
  modelValue: any
  options: Option[]
  label?: string
  placeholder?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

const handleChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="space-y-2 w-full">
    <label v-if="label" class="block text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">
      {{ label }}
    </label>
    <div class="relative group">
      <select
        :value="modelValue"
        @change="handleChange"
        class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-silk outline-none appearance-none focus:border-gold/50 focus:bg-white/[0.08] transition-all cursor-pointer group-hover:border-white/20"
      >
        <option v-if="placeholder" value="" disabled selected hidden>{{ placeholder }}</option>
        <option 
          v-for="option in options" 
          :key="option.value" 
          :value="option.value"
          class="bg-charcoal text-silk"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- Custom Arrow -->
      <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 group-hover:text-gold transition-colors">
        <ChevronDown class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove default arrow for IE */
select::-ms-expand {
  display: none;
}
</style>
