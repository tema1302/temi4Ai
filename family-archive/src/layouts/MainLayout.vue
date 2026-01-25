<script setup lang="ts">
// Common header/footer logic can go here
</script>

<template>
  <div class="min-h-screen bg-obsidian text-silk font-sans selection:bg-gold/30 overflow-x-hidden relative">
    
    <!-- Global Ambient Lights -->
    <div class="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50 animate-pulse-slow"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gold/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen opacity-50"></div>

    <!-- Content Slot -->
    <slot />

  </div>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}
</style>
