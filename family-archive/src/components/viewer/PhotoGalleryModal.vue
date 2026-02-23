<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import BaseButton from '@/shared/ui/BaseButton.vue'

interface Props {
  isOpen: boolean
  photos: string[]
  initialIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
})

const emit = defineEmits<{
  close: []
}>()

const currentIndex = ref(props.initialIndex)

const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.photos.length
}

const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length
}

const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close')
  if (e.key === 'ArrowRight') next()
  if (e.key === 'ArrowLeft') prev()
}

// Manage body scroll based on modal state
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
}, { immediate: true })

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  document.body.style.overflow = ''
})
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div 
        v-if="isOpen" 
        class="fixed inset-0 z-[100] bg-obsidian/95 backdrop-blur-xl flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-6 shrink-0">
          <div class="text-silk/60 text-sm font-medium">
            Фотография {{ currentIndex + 1 }} из {{ photos.length }}
          </div>
          <button 
            @click="emit('close')"
            class="p-2 text-silk/60 hover:text-gold transition-colors bg-white/5 rounded-full"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <!-- Main Viewer -->
        <div class="flex-1 relative flex items-center justify-center p-4 md:p-12">
          <!-- Navigation Buttons -->
          <button 
            v-if="photos.length > 1"
            @click="prev"
            class="absolute left-4 md:left-8 z-10 p-4 text-silk/40 hover:text-gold transition-all bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md"
          >
            <ChevronLeft class="w-8 h-8" />
          </button>

          <div class="relative w-full h-full flex items-center justify-center group">
            <img 
              :key="currentIndex"
              :src="photos[currentIndex]" 
              class="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-fade-in select-none"
              alt="Увеличить фото"
            />
          </div>

          <button 
            v-if="photos.length > 1"
            @click="next"
            class="absolute right-4 md:right-8 z-10 p-4 text-silk/40 hover:text-gold transition-all bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-md"
          >
            <ChevronRight class="w-8 h-8" />
          </button>
        </div>

        <!-- Thumbnails (Bottom) -->
        <div class="p-6 shrink-0 overflow-x-auto scrollbar-hide">
          <div class="flex justify-center gap-3 min-w-max mx-auto">
            <div 
              v-for="(photo, index) in photos" 
              :key="index"
              @click="currentIndex = index"
              class="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all shrink-0"
              :class="currentIndex === index ? 'border-gold scale-110 shadow-lg' : 'border-transparent opacity-40 hover:opacity-100'"
            >
              <img :src="photo" class="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.98); }
  to { opacity: 1; transform: scale(1); }
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
