<script setup lang="ts">
interface Props {
  variant?: 'default' | 'dark' | 'glass'
  hover?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'glass',
  hover: true,
})
</script>

<template>
  <div
    class="card rounded-2xl transition-[background-color,transform,box-shadow] duration-300 border relative overflow-hidden"
    :class="[
      variant === 'glass' ? 'card--glass bg-white/5 border-white/10' : '',
      variant === 'dark' ? 'card--dark bg-charcoal/60 border-white/5' : '',
      hover ? 'card--hover hover:bg-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gold/10' : '',
    ]"
  >
    <!-- Shine Effect -->
    <div v-if="hover" class="card__shine absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform translate-x-[-100%] hover:translate-x-[100%]"></div>

    <slot />
  </div>
</template>
