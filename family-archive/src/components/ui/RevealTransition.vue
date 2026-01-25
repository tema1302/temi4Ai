<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  delay?: number
}>()

const element = ref<HTMLElement | null>(null)
const isVisible = ref(false)

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          isVisible.value = true
        }, props.delay || 0)
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  if (element.value) observer.observe(element.value)
})
</script>

<template>
  <div 
    ref="element" 
    class="transition-all duration-1000 ease-out transform"
    :class="[
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
    ]"
  >
    <slot />
  </div>
</template>
