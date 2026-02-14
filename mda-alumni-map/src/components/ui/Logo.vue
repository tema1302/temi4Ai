<script setup lang="ts">
defineProps<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
}>();

const sizes = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
  xl: 'w-32 h-32'
};
</script>

<template>
  <div :class="['flex items-center justify-center overflow-hidden rounded-[1.25rem] shadow-xl shadow-slate-200/50', sizes[size || 'md']]">
    <img src="/logo.svg" alt="МДА Лого" class="w-full h-full object-contain p-2" />
  </div>
</template>
