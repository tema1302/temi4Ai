<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'

interface Props {
  photos: string[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'open-gallery': [index: number]
}>()

const loadedImages = ref<Set<number>>(new Set())
const GRID_LIMIT = 6

const visiblePhotos = computed(() => props.photos?.slice(0, GRID_LIMIT) || [])
const hasMore = computed(() => (props.photos?.length || 0) > GRID_LIMIT)

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
  <div class="space-y-12">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
      <BaseCard
        v-for="(photo, index) in visiblePhotos"
        :key="index"
        :class="getCellClass(index)"
        class="overflow-hidden group cursor-pointer"
        @click="emit('open-gallery', index)"
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
          loading="lazy"
          decoding="async"
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

    <!-- See All Button -->
    <div v-if="hasMore" class="flex justify-center pt-4">
      <BaseButton 
        variant="secondary" 
        @click="emit('open-gallery', 0)"
        class="group"
      >
        Смотреть все фотографии
        <span class="ml-2 text-xs opacity-50 font-sans group-hover:opacity-100 transition-opacity">
          ({{ photos.length }})
        </span>
      </BaseButton>
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
