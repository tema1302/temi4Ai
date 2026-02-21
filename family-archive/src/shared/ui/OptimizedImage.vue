<script setup lang="ts">
/**
 * OptimizedImage - компонент для оптимизированной загрузки изображений
 *
 * Особенности:
 * - Lazy loading по умолчанию
 * - Placeholder во время загрузки
 * - Обработка ошибок с fallback
 * - Поддержка object-fit через пропсы
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Props {
  src: string | undefined | null
  alt?: string
  fallbackSrc?: string
  loading?: 'lazy' | 'eager'
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  class?: string
  placeholderClass?: string
  // Для критичных изображений (hero)
  preload?: boolean
  // Показывать ли placeholder
  showPlaceholder?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alt: '',
  loading: 'lazy',
  objectFit: 'cover',
  showPlaceholder: true
})

const emit = defineEmits<{
  loaded: []
  error: []
}>()

const isLoaded = ref(false)
const hasError = ref(false)
const isIntersecting = ref(false)
const imageRef = ref<HTMLImageElement | null>(null)
const observer = ref<IntersectionObserver | null>(null)

const actualSrc = computed(() => {
  if (hasError.value && props.fallbackSrc) {
    return props.fallbackSrc
  }
  return props.src || props.fallbackSrc || ''
})

const shouldRender = computed(() => {
  // Eager loading - рендерим сразу
  if (props.loading === 'eager' || props.preload) return true
  // Lazy loading - только когда в viewport
  return isIntersecting.value
})

const containerClasses = computed(() => [
  'relative overflow-hidden',
  props.class
])

const imageClasses = computed(() => [
  'w-full h-full transition-opacity duration-300',
  isLoaded.value ? 'opacity-100' : 'opacity-0',
  `object-${props.objectFit}`
])

const placeholderClasses = computed(() => [
  'absolute inset-0 bg-white/5 animate-pulse',
  props.placeholderClass || props.class
])

// Intersection Observer для lazy loading
onMounted(() => {
  // Предзагрузка критичных изображений
  if (props.preload && props.src) {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = props.src
    document.head.appendChild(link)
  }

  // Native lazy loading поддерживается - используем его
  if (props.loading === 'lazy' && imageRef.value && !('loading' in HTMLImageElement.prototype)) {
    // Fallback для старых браузеров
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isIntersecting.value = true
          observer.value?.disconnect()
        }
      })
    }, {
      rootMargin: '50px' // Начинаем загружать за 50px до появления
    })
    observer.value.observe(imageRef.value)
  } else {
    isIntersecting.value = true
  }
})

onUnmounted(() => {
  observer.value?.disconnect()
})

const onLoad = () => {
  isLoaded.value = true
  emit('loaded')
}

const onError = () => {
  hasError.value = true
  isLoaded.value = true // Показываем fallback или пустоту
  emit('error')
}
</script>

<template>
  <div :class="containerClasses">
    <!-- Placeholder -->
    <div
      v-if="showPlaceholder && !isLoaded"
      :class="placeholderClasses"
    >
      <div class="w-full h-full flex items-center justify-center text-gray-600">
        <svg class="w-8 h-8 opacity-30" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </div>

    <!-- Image -->
    <img
      v-show="shouldRender && actualSrc"
      ref="imageRef"
      :src="shouldRender ? actualSrc : undefined"
      :alt="alt"
      :loading="loading"
      :class="imageClasses"
      @load="onLoad"
      @error="onError"
    />

    <!-- Fallback when no image -->
    <div
      v-if="!actualSrc && showPlaceholder"
      class="absolute inset-0 flex items-center justify-center bg-white/5"
    >
      <slot name="fallback">
        <span class="text-2xl text-gray-600 font-serif">?</span>
      </slot>
    </div>
  </div>
</template>
