/**
 * Утилиты для предзагрузки и оптимизации изображений
 */

// Кеш предзагруженных изображений
const preloadedImages = new Set<string>()

/**
 * Предзагрузка изображения
 */
export function preloadImage(src: string): Promise<HTMLImageElement> {
  if (preloadedImages.has(src)) {
    return Promise.resolve(new Image())
  }

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      preloadedImages.add(src)
      resolve(img)
    }
    img.onerror = reject
    img.src = src
  })
}

/**
 * Предзагрузка массива изображений
 */
export function preloadImages(sources: string[]): Promise<PromiseSettledResult<HTMLImageElement>[]> {
  return Promise.allSettled(sources.map(preloadImage))
}

/**
 * Предзагрузка критичных изображений для страницы
 * Вызывать в onMounted или в начале компонента
 */
export function preloadCriticalImages(sources: string[]): void {
  // Используем requestIdleCallback для не блокирующей предзагрузки
  const scheduleIdle = window.requestIdleCallback || ((cb: IdleRequestCallback) => setTimeout(cb, 1))

  scheduleIdle(() => {
    sources.forEach(src => {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })
  })
}

/**
 * Проверка поддержки native lazy loading
 */
export function supportsLazyLoading(): boolean {
  return 'loading' in HTMLImageElement.prototype
}

/**
 * Получение thumbnail URL из Supabase Storage
 * Supabase поддерживает трансформации изображений
 */
export function getThumbnailUrl(
  originalUrl: string | undefined | null,
  width: number = 200,
  height?: number
): string | undefined {
  if (!originalUrl) return undefined

  // Проверяем, это Supabase Storage URL
  if (originalUrl.includes('supabase.co/storage')) {
    const url = new URL(originalUrl)
    url.searchParams.set('width', String(width))
    if (height) {
      url.searchParams.set('height', String(height))
    }
    url.searchParams.set('quality', '80')
    url.searchParams.set('resize', 'cover')
    return url.toString()
  }

  // Для других URL возвращаем оригинал
  return originalUrl
}

/**
 * Определение оптимального размера изображения на основе viewport
 */
export function getOptimalImageSize(containerWidth: number): number {
  const dpr = window.devicePixelRatio || 1
  const sizes = [200, 400, 600, 800, 1200, 1600, 2000]

  const targetSize = containerWidth * dpr

  // Находим ближайший размер
  return sizes.reduce((prev, curr) =>
    Math.abs(curr - targetSize) < Math.abs(prev - targetSize) ? curr : prev
  )
}
