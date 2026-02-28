<script setup lang="ts">
defineProps<{
  className?: string
}>()
</script>

<template>
  <div
    class="skeleton animate-pulse bg-white/10 rounded"
    :class="className"
  ></div>
</template>
