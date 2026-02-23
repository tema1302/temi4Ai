<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import SearchableSelect from '@/shared/ui/SearchableSelect.vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { useAnalytics } from '@/composables/useAnalytics'
import { FamilyRepository } from '@/modules/family/api/repository'
import { useDialogStore } from '@/stores/dialogStore'
import { Trash2, Plus, Quote, GitBranch } from 'lucide-vue-next'
import { ROLE_DICTIONARY } from '@/shared/utils/roleDictionary'

const emit = defineEmits<{
  save: []
  delete: []
  assignOnTree: [memberId: string]
}>()

const store = useMemoryStore()
const dialogs = useDialogStore()
const { trackEvent } = useAnalytics()
const currentMember = computed(() => store.activeMember)
const isDragging = ref(false)

const mainPhotoInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)
const replacePhotoIndex = ref<number | null>(null)
const showGalleryModal = ref(false)

const updateField = (field: string, value: string) => {
  if (currentMember.value) {
    store.updateMember(currentMember.value.id, { [field]: value })
  }
}

const handleFileUpload = async (file: File, isGallery: boolean = false) => {
  if (!currentMember.value) return
  
  const path = `${store.currentFamily?.id || 'general'}/${currentMember.value.id}`
  const url = await FamilyRepository.uploadFile(file, path)
  
  if (url) {
    if (isGallery) {
      const updatedPhotos = [...currentMember.value.photos, url]
      store.updateMember(currentMember.value.id, { photos: updatedPhotos })
      trackEvent('upload_gallery_photo', { member_id: currentMember.value.id })
    } else {
      store.updateMember(currentMember.value.id, { photoUrl: url })
      trackEvent('upload_main_photo', { member_id: currentMember.value.id })
    }
  }
}

const onDrop = async (e: DragEvent, isGallery: boolean = false) => {
  isDragging.value = false
  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        await handleFileUpload(files[i], isGallery)
      }
    }
  }
}

const onFileChange = async (e: Event, isGallery: boolean = false) => {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (files && files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        // If replacing a specific photo
        if (isGallery && replacePhotoIndex.value !== null) {
          const path = `${store.currentFamily?.id || 'general'}/${currentMember.value?.id}`
          const url = await FamilyRepository.uploadFile(files[i], path)
          if (url && currentMember.value) {
            const updatedPhotos = [...currentMember.value.photos]
            updatedPhotos[replacePhotoIndex.value] = url
            store.updateMember(currentMember.value.id, { photos: updatedPhotos })
            trackEvent('replace_gallery_photo', { member_id: currentMember.value.id })
          }
          replacePhotoIndex.value = null
        } else {
          await handleFileUpload(files[i], isGallery)
        }
      }
    }
  }
  // Reset input value so the same file can be uploaded again
  target.value = ''
}

const addQuote = () => {
  if (currentMember.value) {
    trackEvent('add_quote', { member_id: currentMember.value.id })
    const updatedQuotes = [...(currentMember.value.quotes || []), '']
    store.updateMember(currentMember.value.id, { quotes: updatedQuotes })
  }
}

const updateQuote = (index: number, value: string) => {
  if (currentMember.value) {
    const updatedQuotes = [...currentMember.value.quotes]
    updatedQuotes[index] = value
    store.updateMember(currentMember.value.id, { quotes: updatedQuotes })
  }
}

const removeQuote = (index: number) => {
  if (currentMember.value) {
    const updatedQuotes = currentMember.value.quotes.filter((_, i) => i !== index)
    store.updateMember(currentMember.value.id, { quotes: updatedQuotes })
  }
}

const addPhoto = async () => {
  const url = await dialogs.prompt('Введите URL фотографии:', '', 'https://example.com/photo.jpg')
  if (url && currentMember.value) {
    trackEvent('add_photo', { member_id: currentMember.value.id })
    const updatedPhotos = [...currentMember.value.photos, url]
    store.updateMember(currentMember.value.id, { photos: updatedPhotos })
  }
}

// Remove photo from gallery
const removeGalleryPhoto = (index: number) => {
  if (currentMember.value) {
    const updatedPhotos = currentMember.value.photos.filter((_, i) => i !== index)
    store.updateMember(currentMember.value.id, { photos: updatedPhotos })
    trackEvent('remove_gallery_photo', { member_id: currentMember.value.id })
  }
}

// Replace photo in gallery - trigger file upload
const replaceGalleryPhoto = (index: number) => {
  replacePhotoIndex.value = index
  galleryInput.value?.click()
}

// Replace photo in gallery by URL
const replaceGalleryPhotoByUrl = async (index: number) => {
  const currentUrl = currentMember.value?.photos[index] || ''
  const url = await dialogs.prompt('Введите новый URL фотографии:', currentUrl, 'https://example.com/photo.jpg')
  if (url && currentMember.value) {
    const updatedPhotos = [...currentMember.value.photos]
    updatedPhotos[index] = url
    store.updateMember(currentMember.value.id, { photos: updatedPhotos })
    trackEvent('replace_gallery_photo_url', { member_id: currentMember.value.id })
  }
}

// Remove main photo
const removeMainPhoto = () => {
  if (currentMember.value) {
    store.updateMember(currentMember.value.id, { photoUrl: '' })
    trackEvent('remove_main_photo', { member_id: currentMember.value.id })
  }
}

// Set main photo from URL
const setMainPhotoByUrl = async () => {
  const currentUrl = currentMember.value?.photoUrl || ''
  const url = await dialogs.prompt('Введите URL фотографии:', currentUrl, 'https://example.com/photo.jpg')
  if (url && currentMember.value) {
    store.updateMember(currentMember.value.id, { photoUrl: url })
    trackEvent('set_main_photo_url', { member_id: currentMember.value.id })
  }
}

const addVideo = async () => {
  const url = await dialogs.prompt('Введите URL видео (YouTube/Vimeo/Direct):', '', 'https://youtube.com/watch?v=...')
  if (url && currentMember.value) {
    trackEvent('add_video', { member_id: currentMember.value.id })
    const updatedVideos = [...(currentMember.value.videos || []), url]
    store.updateMember(currentMember.value.id, { videos: updatedVideos })
  }
}

const addLifeEvent = () => {
  if (currentMember.value) {
    const updatedLifePath = [...(currentMember.value.lifePath || []), { year: '', title: '', description: '' }]
    store.updateMember(currentMember.value.id, { lifePath: updatedLifePath })
  }
}

const updateLifeEvent = (index: number, field: string, value: string) => {
  if (currentMember.value) {
    const updatedLifePath = [...(currentMember.value.lifePath || [])]
    updatedLifePath[index] = { ...updatedLifePath[index], [field]: value }
    store.updateMember(currentMember.value.id, { lifePath: updatedLifePath })
  }
}

const removeLifeEvent = (index: number) => {
  if (currentMember.value) {
    const updatedLifePath = currentMember.value.lifePath?.filter((_, i) => i !== index)
    store.updateMember(currentMember.value.id, { lifePath: updatedLifePath })
  }
}
</script>

<template>
  <div class="space-y-6">
    
    <!-- Header -->
    <div class="flex items-center justify-between border-b border-white/5 pb-4">
      <h2 class="text-xl font-serif text-silk tracking-wide">Редактирование карточки</h2>
      <button 
        v-if="store.members.length > 1"
        @click="emit('delete')"
        class="p-2 text-gray-500 hover:text-red-400 transition-colors border border-white/10 rounded-lg"
        title="Удалить карточку"
      >
        <Trash2 class="w-5 h-5" />
      </button>
    </div>

    <!-- Form Fields -->
    <div v-if="currentMember" class="space-y-8 pb-10">
      
      <!-- Name -->
      <div>
        <label class="block text-sm text-gray-400 mb-2">Полное имя</label>
        <input
          :value="currentMember.name"
          @input="updateField('name', ($event.target as HTMLInputElement).value)"
          type="text"
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      <!-- Relationship -->
      <div>
        <div class="flex items-center gap-2 mb-2">
          <GitBranch class="w-4 h-4 text-gold/60" />
          <label class="block text-sm text-gray-400">Родственность (кем приходится)</label>
        </div>
        <SearchableSelect
          :model-value="currentMember.relationship || ''"
          :options="ROLE_DICTIONARY"
          placeholder="Выберите роль из списка..."
          @update:model-value="updateField('relationship', $event)"
        />
        <button
          @click="emit('assignOnTree', currentMember.id)"
          class="mt-4 w-full py-3 px-4 bg-gold/5 hover:bg-gold/10 border border-gold/20 rounded-xl text-gold text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
        >
          🧬 Назначить на древе (Связи)
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <!-- Birth Date -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Дата рождения</label>
          <input
            :value="currentMember.birthDate"
            @input="updateField('birthDate', ($event.target as HTMLInputElement).value)"
            type="date"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>

        <!-- Death Date -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Дата ухода</label>
          <input
            :value="currentMember.deathDate"
            @input="updateField('deathDate', ($event.target as HTMLInputElement).value)"
            type="date"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors"
          />
        </div>
      </div>

      <!-- Photo URL -->
      <div>
        <label class="block text-sm text-gray-400 mb-2">Основное фото</label>
        <div class="flex gap-2 mb-2">
           <input
             :value="currentMember.photoUrl"
             @input="updateField('photoUrl', ($event.target as HTMLInputElement).value)"
             type="url"
             placeholder="Введите URL фотографии"
             class="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-silk text-sm focus:outline-none focus:border-gold/50"
           />
           <input
             type="file"
             ref="mainPhotoInput"
             class="hidden"
             accept="image/*"
             @change="(e) => onFileChange(e, false)"
           />
           <BaseButton variant="secondary" size="sm" @click="setMainPhotoByUrl" title="Добавить по ссылке">
             🔗
           </BaseButton>
           <BaseButton variant="secondary" size="sm" @click="mainPhotoInput?.click()">
             📁 Загрузить
           </BaseButton>
           <BaseButton
             v-if="currentMember.photoUrl"
             variant="secondary"
             size="sm"
             @click="removeMainPhoto"
             class="!border-red-500/30 !text-red-400 hover:!bg-red-500/10"
             title="Удалить фото"
           >
             ✕
           </BaseButton>
        </div>
        <div
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop($event, false)"
          class="relative group h-20 border-2 border-dashed border-white/10 rounded-lg flex items-center justify-center text-gray-500 text-xs hover:border-gold/30 hover:bg-gold/5 transition-all"
          :class="{ 'border-gold bg-gold/5 ring-1 ring-gold/20': isDragging }"
        >
           {{ isDragging ? 'Отпустите для загрузки' : 'Или перетащите файл сюда' }}
        </div>
      </div>

      <!-- Biography -->
      <div>
        <label class="block text-sm text-gray-400 mb-2">Биография</label>
        <textarea
          :value="currentMember.biography"
          @input="updateField('biography', ($event.target as HTMLTextAreaElement).value)"
          rows="6"
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk resize-none focus:outline-none focus:border-gold/50 transition-colors"
          placeholder="Расскажите их историю..."
        ></textarea>
      </div>

      <!-- Life Path (Timeline) -->
      <BaseCard class="p-4 border-white/5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest">Жизненный путь</h3>
          <button @click="addLifeEvent" class="text-gold text-xs hover:underline">+ Добавить событие</button>
        </div>
        <div class="space-y-4">
           <div v-for="(event, index) in currentMember.lifePath" :key="index" class="p-3 bg-white/5 rounded-lg relative group">
              <button @click="removeLifeEvent(index)" class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">✕</button>
              <input 
                :value="event.year" 
                @input="updateLifeEvent(index, 'year', ($event.target as HTMLInputElement).value)"
                placeholder="Год" 
                class="w-20 mb-2 px-2 py-1 bg-white/10 border border-white/10 rounded text-silk text-xs" 
              />
              <input 
                :value="event.title" 
                @input="updateLifeEvent(index, 'title', ($event.target as HTMLInputElement).value)"
                placeholder="Событие" 
                class="w-full mb-2 px-2 py-1 bg-white/10 border border-white/10 rounded text-silk text-xs font-bold" 
              />
              <textarea 
                :value="event.description" 
                @input="updateLifeEvent(index, 'description', ($event.target as HTMLTextAreaElement).value)"
                placeholder="Описание" 
                class="w-full px-2 py-1 bg-white/10 border border-white/10 rounded text-silk text-xs resize-none"
              ></textarea>
           </div>
        </div>
      </BaseCard>

      <!-- Quotes -->
      <BaseCard class="p-6 border-white/5 bg-white/[0.02]">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center gap-2">
            <Quote class="w-4 h-4 text-gold/40" />
            <h3 class="text-sm font-bold text-gray-400 uppercase tracking-[0.2em]">Цитаты и мысли</h3>
          </div>
          <button @click="addQuote" class="text-gold text-xs hover:text-white transition-colors flex items-center gap-1 font-bold">
            <Plus class="w-3 h-3" /> Добавить
          </button>
        </div>
        <div class="space-y-4">
          <div v-for="(quote, index) in currentMember.quotes" :key="index" class="flex gap-3 group items-start">
            <div class="flex-1 relative">
              <textarea
                :value="quote"
                @input="updateQuote(index, ($event.target as HTMLTextAreaElement).value)"
                rows="2"
                class="w-full px-4 py-3 bg-obsidian/50 border border-white/10 rounded-xl text-silk text-sm focus:outline-none focus:border-gold/50 transition-all resize-none placeholder:text-gray-600 italic"
                placeholder="&quot;Их мудрые слова...&quot;"
              ></textarea>
            </div>
            <button 
              @click="removeQuote(index)" 
              class="mt-3 text-gray-600 hover:text-red-400 transition-colors"
              title="Удалить цитату"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
          <div v-if="!currentMember.quotes?.length" class="text-center py-6 border border-dashed border-white/5 rounded-xl text-xs text-gray-600 italic">
            Список цитат пуст
          </div>
        </div>
      </BaseCard>

      <!-- Delete Button (Bottom of form) -->
      <div v-if="store.members.length > 1" class="pt-6">
        <button
          @click="emit('delete')"
          class="w-full py-3 rounded-xl border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-widest hover:bg-red-500/5 transition-all flex items-center justify-center gap-2"
        >
          <Trash2 class="w-4 h-4" /> Удалить карточку
        </button>
      </div>

      <!-- Save Button (Bottom) -->
      <div class="pt-8 border-t border-white/5">
        <BaseButton 
          full 
          size="lg" 
          @click="emit('save')"
          class="shadow-[0_10px_30px_rgba(212,175,55,0.1)]"
        >
          💾 Сохранить изменения
        </BaseButton>
      </div>

      <!-- Media (Photos & Videos) -->
      <BaseCard
        class="p-4 border-white/5 transition-all"
        :class="{ 'border-gold bg-gold/5': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop($event, true)"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest">Фотографии</h3>
          <div class="flex gap-2">
             <button @click="addPhoto" class="text-gold text-xs hover:underline">URL фото</button>
             <span class="text-gray-700">|</span>
             <input type="file" ref="galleryInput" class="hidden" accept="image/*" multiple @change="(e) => onFileChange(e, true)" />
             <button @click="replacePhotoIndex = null; galleryInput?.click()" class="text-gold text-xs hover:underline">Загрузить</button>
             <span class="text-gray-700">|</span>
             <button @click="addVideo" class="text-gold text-xs hover:underline">Видео</button>
          </div>
        </div>

        <!-- Photos Mini Grid -->
        <div class="mb-4">
           <div class="flex items-center justify-between mb-2">
              <p class="text-[10px] text-gray-500 uppercase tracking-widest">Фотографии ({{ currentMember.photos.length }})</p>
              <div class="flex items-center gap-2">
                <span v-if="isDragging" class="text-gold text-[8px] font-bold animate-pulse">ПЕРЕТАЩИТЕ СЮДА</span>
                <button
                  v-if="currentMember.photos.length > 0"
                  @click="showGalleryModal = true"
                  class="text-gold text-[10px] hover:underline"
                >
                  Показать все
                </button>
              </div>
           </div>
           <div class="grid grid-cols-4 gap-2">
              <div
                v-for="(photo, index) in currentMember.photos.slice(0, 3)"
                :key="index"
                class="aspect-square rounded border border-white/10 overflow-hidden bg-charcoal relative group cursor-pointer"
                @click="showGalleryModal = true"
              >
                <img :src="photo" class="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
                <!-- Hover overlay with actions -->
                <div class="absolute inset-0 bg-black/60 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
                  <button
                    @click="replaceGalleryPhoto(index)"
                    class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                    title="Заменить файлом"
                  >
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    @click="replaceGalleryPhotoByUrl(index)"
                    class="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                    title="Заменить по URL"
                  >
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <button
                    @click="removeGalleryPhoto(index)"
                    class="w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500"
                    title="Удалить"
                  >
                    <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <button
                v-if="currentMember.photos.length > 3"
                @click="showGalleryModal = true"
                class="aspect-square rounded border border-white/10 bg-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors cursor-pointer"
              >
                 <span class="text-gold text-[10px] font-bold">+{{ currentMember.photos.length - 3 }}</span>
                 <span class="text-[8px] text-gray-500 uppercase">все</span>
              </button>
              <div v-else-if="currentMember.photos.length === 0" class="col-span-4 py-4 border border-dashed border-white/5 rounded flex items-center justify-center text-[10px] text-gray-600 uppercase tracking-widest">
                 Нет фото
              </div>
           </div>
        </div>

        <!-- Videos Mini Grid -->
        <div>
           <p class="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Видео ({{ currentMember.videos?.length || 0 }})</p>
           <div class="grid grid-cols-4 gap-2">
              <div
                v-for="(video, index) in (currentMember.videos || []).slice(0, 3)"
                :key="index"
                class="aspect-square rounded border border-white/10 overflow-hidden bg-obsidian flex items-center justify-center"
              >
                 <span class="text-gold text-xs">▶</span>
              </div>
              <button v-if="(currentMember.videos?.length || 0) > 3" class="aspect-square rounded border border-white/10 bg-white/5 flex flex-col items-center justify-center">
                 <span class="text-gold text-[10px] font-bold">+{{ currentMember.videos!.length - 3 }}</span>
                 <span class="text-[8px] text-gray-500 uppercase">все</span>
              </button>
           </div>
        </div>
      </BaseCard>

    </div>
  </div>

  <!-- Gallery Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="showGalleryModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
        @click.self="showGalleryModal = false"
      >
        <div class="bg-charcoal rounded-2xl border border-white/10 p-6 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-serif text-silk">Все фотографии ({{ currentMember?.photos?.length || 0 }})</h3>
            <button
              @click="showGalleryModal = false"
              class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <svg class="w-4 h-4 text-silk" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Photo Grid -->
          <div class="flex-1 overflow-y-auto">
            <div class="grid grid-cols-3 md:grid-cols-4 gap-3">
              <div
                v-for="(photo, index) in currentMember?.photos"
                :key="index"
                class="aspect-square rounded-xl border border-white/10 overflow-hidden bg-obsidian relative group"
              >
                <img :src="photo" class="w-full h-full object-cover" />
                <!-- Hover overlay with actions -->
                <div class="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    @click="replaceGalleryPhoto(index); showGalleryModal = false"
                    class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                    title="Заменить файлом"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                  <button
                    @click="replaceGalleryPhotoByUrl(index); showGalleryModal = false"
                    class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                    title="Заменить по URL"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </button>
                  <button
                    @click="removeGalleryPhoto(index)"
                    class="w-10 h-10 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500"
                    title="Удалить"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty state -->
            <div v-if="!currentMember?.photos?.length" class="text-center py-12 text-gray-500">
              Нет фотографий
            </div>
          </div>

          <!-- Footer actions -->
          <div class="mt-4 pt-4 border-t border-white/10 flex gap-3 justify-end">
            <BaseButton variant="secondary" @click="addPhoto">
              Добавить по URL
            </BaseButton>
            <BaseButton @click="galleryInput?.click()">
              Загрузить фото
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
