<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, ChevronDown, Check } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const searchQuery = ref('')

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options
  const query = searchQuery.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(query))
})

const selectedLabel = computed(() => {
  return props.options.find(o => o.value === props.modelValue)?.label || props.modelValue
})

const selectOption = (value: string) => {
  emit('update:modelValue', value)
  isOpen.value = false
  searchQuery.value = ''
}
</script>

<template>
  <div class="relative">
    <div
      class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk cursor-pointer flex items-center justify-between hover:border-gold/30 transition-colors"
      @click="isOpen = !isOpen"
    >
      <span :class="{ 'text-gray-500': !modelValue }">{{ selectedLabel || placeholder }}</span>
      <ChevronDown class="w-4 h-4 text-gray-500 transition-transform" :class="{ 'rotate-180': isOpen }" />
    </div>

    <div
      v-if="isOpen"
      class="absolute z-[100] mt-2 w-full bg-charcoal border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
    >
      <div class="p-2 border-b border-white/5">
        <div class="relative">
          <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            v-model="searchQuery"
            type="text"
            class="w-full pl-10 pr-4 py-2 bg-obsidian/50 border border-white/5 rounded-lg text-sm text-silk focus:outline-none focus:border-gold/30"
            placeholder="Поиск роли..."
            @click.stop
          />
        </div>
      </div>

      <div class="max-h-60 overflow-y-auto p-1 scrollbar-thin">
        <button
          v-for="option in filteredOptions"
          :key="option.value"
          class="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between group"
          :class="modelValue === option.value ? 'bg-gold/10 text-gold' : 'text-gray-400 hover:bg-white/5 hover:text-silk'"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
          <Check v-if="modelValue === option.value" class="w-4 h-4" />
        </button>
        <div v-if="filteredOptions.length === 0" class="p-4 text-center text-xs text-gray-600 italic">
          Ничего не найдено
        </div>
      </div>
    </div>

    <!-- Backdrop to close -->
    <div v-if="isOpen" class="fixed inset-0 z-[90]" @click="isOpen = false"></div>
  </div>
</template>
