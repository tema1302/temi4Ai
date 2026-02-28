<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  center?: boolean
  type?: 'button' | 'submit' | 'reset'
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  full: false,
  center: false,
  type: 'submit'
})
</script>

<template>
  <button
    :type="type"
    class="btn relative overflow-hidden rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group"
    :class="[
      // Size
      size === 'sm' ? 'btn--sm px-4 py-2 text-sm' : '',
      size === 'md' ? 'btn--md px-6 py-3 text-base' : '',
      size === 'lg' ? 'btn--lg px-8 py-4 text-lg' : '',

      // Variants
      variant === 'primary' ? 'btn--primary bg-gradient-to-r from-gold to-yellow-600 text-obsidian shadow-lg shadow-gold/20 hover:shadow-gold/40' : '',
      variant === 'secondary' ? 'btn--secondary bg-white/10 text-silk border border-white/10 hover:bg-white/20' : '',
      variant === 'outline' ? 'btn--outline bg-transparent text-gold border border-gold hover:bg-gold/10' : '',
      variant === 'ghost' ? 'btn--ghost text-silk/70 hover:text-gold hover:bg-white/5' : '',

      // Layout
      full ? 'btn--full w-full' : '',
      center ? 'btn--center mx-auto' : '',
    ]"
  >
    <slot />
    <!-- Glow effect on hover -->
    <div v-if="variant === 'primary'" class="btn__glow absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
  </button>
</template>
