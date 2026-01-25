<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
})
</script>

<template>
  <button 
    class="relative overflow-hidden rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
    :class="[
      // Size
      size === 'sm' ? 'px-4 py-2 text-sm' : '',
      size === 'md' ? 'px-6 py-3 text-base' : '',
      size === 'lg' ? 'px-8 py-4 text-lg' : '',
      
      // Variants
      variant === 'primary' ? 'bg-gradient-to-r from-gold to-yellow-600 text-obsidian shadow-lg shadow-gold/20 hover:shadow-gold/40' : '',
      variant === 'secondary' ? 'bg-white/10 text-silk border border-white/10 hover:bg-white/20' : '',
      variant === 'ghost' ? 'text-silk/70 hover:text-gold hover:bg-white/5' : '',
    ]"
  >
    <slot />
    <!-- Glow effect on hover -->
    <div v-if="variant === 'primary'" class="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
  </button>
</template>
