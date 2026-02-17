<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { useAnalytics } from '@/composables/useAnalytics'
import { FamilyRepository } from '@/modules/family/api/repository'

const emit = defineEmits<{
  save: []
}>()

const store = useMemoryStore()
const { trackEvent } = useAnalytics()
const currentMember = computed(() => store.activeMember)
const isDragging = ref(false)

const mainPhotoInput = ref<HTMLInputElement | null>(null)
const galleryInput = ref<HTMLInputElement | null>(null)

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
        await handleFileUpload(files[i], isGallery)
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

const addPhoto = () => {
  const url = prompt('Введите URL фотографии:')
  if (url && currentMember.value) {
    trackEvent('add_photo', { member_id: currentMember.value.id })
    const updatedPhotos = [...currentMember.value.photos, url]
    store.updateMember(currentMember.value.id, { photos: updatedPhotos })
  }
}

const addVideo = () => {
  const url = prompt('Введите URL видео (YouTube/Vimeo/Direct):')
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
    <div class="flex items-center justify-between">
      <h2 class="text-xl font-serif text-silk">Редактирование</h2>
      <BaseButton size="sm" @click="emit('save')">💾 Сохранить</BaseButton>
    </div>

    <!-- Form Fields -->
    <div v-if="currentMember" class="space-y-5 pb-10">
      
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
        <label class="block text-sm text-gray-400 mb-2">Родственность (кем приходится)</label>
        <input
          :value="currentMember.relationship"
          @input="updateField('relationship', ($event.target as HTMLInputElement).value)"
          type="text"
          placeholder="Например: Основатель рода, Дедушка..."
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors"
        />
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
           <BaseButton variant="secondary" size="sm" @click="mainPhotoInput?.click()">
             📁 Загрузить
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
      <BaseCard class="p-4 border-white/5">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest">Цитаты</h3>
          <button @click="addQuote" class="text-gold text-xs hover:underline">+ Добавить</button>
        </div>
        <div class="space-y-3">
          <div v-for="(quote, index) in currentMember.quotes" :key="index" class="flex gap-2">
            <input
              :value="quote"
              @input="updateQuote(index, ($event.target as HTMLInputElement).value)"
              type="text"
              class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-silk text-sm focus:outline-none focus:border-gold/50"
              placeholder="&quot;Их слова...&quot;"
            />
            <button @click="removeQuote(index)" class="text-red-400 hover:text-red-300 px-2">✕</button>
          </div>
        </div>
      </BaseCard>

      <!-- Media (Photos & Videos) -->
      <BaseCard 
        class="p-4 border-white/5 transition-all"
        :class="{ 'border-gold bg-gold/5': isDragging }"
        @dragover.prevent="isDragging = true"
        @dragleave.prevent="isDragging = false"
        @drop.prevent="onDrop($event, true)"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest">Медиатека</h3>
          <div class="flex gap-2">
             <button @click="addPhoto" class="text-gold text-xs hover:underline">URL фото</button>
             <span class="text-gray-700">|</span>
             <input type="file" ref="galleryInput" class="hidden" accept="image/*" multiple @change="(e) => onFileChange(e, true)" />
             <button @click="galleryInput?.click()" class="text-gold text-xs hover:underline">Загрузить с ПК</button>
             <span class="text-gray-700">|</span>
             <button @click="addVideo" class="text-gold text-xs hover:underline">Видео</button>
          </div>
        </div>
        
        <!-- Photos Mini Grid -->
        <div class="mb-4">
           <div class="flex items-center justify-between mb-2">
              <p class="text-[10px] text-gray-500 uppercase tracking-widest">Фотографии ({{ currentMember.photos.length }})</p>
              <span v-if="isDragging" class="text-gold text-[8px] font-bold animate-pulse">ПЕРЕТАЩИТЕ СЮДА</span>
           </div>
           <div class="grid grid-cols-4 gap-2">
              <div 
                v-for="(photo, index) in currentMember.photos.slice(0, 3)" 
                :key="index"
                class="aspect-square rounded border border-white/10 overflow-hidden bg-charcoal"
              >
                <img :src="photo" class="w-full h-full object-cover opacity-50 hover:opacity-100 transition-opacity" />
              </div>
              <button v-if="currentMember.photos.length > 3" class="aspect-square rounded border border-white/10 bg-white/5 flex flex-col items-center justify-center">
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
</template>
