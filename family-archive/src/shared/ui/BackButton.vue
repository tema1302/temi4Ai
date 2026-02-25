<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ArrowLeft } from 'lucide-vue-next'

interface Props {
  to?: string | object
  label?: string
  className?: string
  showLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Назад',
  className: '',
  showLabel: false
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
    :class="['flex items-center gap-2 transition-all group', className]"
  >
    <!-- Pinterest-style circular back button -->
    <span class="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 hover:bg-gold/5 transition-all group-hover:shadow-lg group-hover:shadow-gold/10">
      <ArrowLeft class="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
    </span>
    <!-- Optional label (hidden by default) -->
    <span v-if="showLabel" class="text-sm text-gray-400 group-hover:text-silk transition-colors">{{ label }}</span>
  </button>
</template>
