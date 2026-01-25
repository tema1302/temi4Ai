<script setup lang="ts">
import { ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'

interface Props {
  photos: string[]
}

defineProps<Props>()

const loadedImages = ref<Set<number>>(new Set())

const onImageLoad = (index: number) => {
  loadedImages.value.add(index)
}

const getCellClass = (index: number) => {
  const patterns = [
    'col-span-2 row-span-2', // Large
    'col-span-1 row-span-1', // Small
    'col-span-1 row-span-2', // Tall
    'col-span-2 row-span-1', // Wide
    'col-span-1 row-span-1', // Small
    'col-span-1 row-span-1', // Small
  ]
  return patterns[index % patterns.length]
}
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
    <BaseCard
      v-for="(photo, index) in photos"
      :key="index"
      :class="getCellClass(index)"
      class="overflow-hidden group cursor-pointer"
    >
      <!-- Skeleton Loader -->
      <div 
        v-if="!loadedImages.has(index)"
        class="absolute inset-0 bg-charcoal/50 animate-pulse"
      >
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer"></div>
      </div>

      <!-- Image -->
      <img
        :src="photo"
        :alt="`Воспоминание ${index + 1}`"
        class="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
        :class="{ 'opacity-0': !loadedImages.has(index), 'opacity-100': loadedImages.has(index) }"
        @load="onImageLoad(index)"
      />

      <!-- Hover Overlay -->
      <div class="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
        <span class="text-sm text-silk/80">Открыть фото</span>
      </div>
    </BaseCard>

    <!-- Empty State -->
    <div 
      v-if="!photos || photos.length === 0"
      class="col-span-full py-20 text-center"
    >
      <p class="text-gray-500">Фотографии ещё не добавлены.</p>
    </div>
  </div>
</template>

<style scoped>
.skeleton-shimmer {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
</style>
