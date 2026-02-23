<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

interface Props {
  to?: string | object
  label?: string
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Назад',
  className: ''
})

const router = useRouter()

const handleClick = () => {
  if (props.to) {
    router.push(props.to)
  } else if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/editor')
  }
}
</script>

<template>
  <button 
    @click="handleClick"
    :class="['flex items-center gap-2 text-gray-400 hover:text-silk transition-colors group', className]"
  >
    <ArrowLeft class="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
    <span class="text-sm">{{ label }}</span>
  </button>
</template>
