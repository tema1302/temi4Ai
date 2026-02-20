<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { FamilyRepository } from '@/modules/family/api/repository'
import { Eye, Edit2, Trash2, Plus, ArrowLeft, X, RefreshCw, Link } from 'lucide-vue-next'

const props = defineProps<{
  memberId: string
}>()

const emit = defineEmits<{
  save: []
  back: []
  delete: [id: string]
  assignOnTree: [memberId: string]
}>()

const store = useMemoryStore()
const { trackEvent } = useAnalytics()
const fileInput = ref<HTMLInputElement | null>(null)
const uploadType = ref<'main' | 'gallery'>('main')
const viewMode = ref<'edit' | 'preview'>('edit')
const replacePhotoIndex = ref<number | null>(null)

const currentMember = computed(() => {
  return store.members.find(m => m.id === props.memberId) || store.activeMember
})
const errors = ref({ name: '' })

const updateField = (field: string, value: any) => {
  store.updateMember(props.memberId, { [field]: value })
}

const updateQuote = (index: number, value: string) => {
  if (currentMember.value) {
    const updatedQuotes = [...currentMember.value.quotes]
    updatedQuotes[index] = value
    store.updateMember(props.memberId, { quotes: updatedQuotes })
  }
}

const removeQuote = (index: number) => {
  if (currentMember.value) {
    const updatedQuotes = currentMember.value.quotes.filter((_, i) => i !== index)
    store.updateMember(props.memberId, { quotes: updatedQuotes })
  }
}

const validate = () => {
  errors.value.name = currentMember.value?.name ? '' : 'Имя обязательно'
  return !errors.value.name
}

const addQuote = () => {
  if (currentMember.value) {
    const updatedQuotes = [...(currentMember.value.quotes || []), '']
    store.updateMember(props.memberId, { quotes: updatedQuotes })
  }
}

const triggerPCGalleryUpload = () => {
  uploadType.value = 'gallery'
  fileInput.value?.click()
}

const triggerMainPhotoUpload = () => {
  uploadType.value = 'main'
  replacePhotoIndex.value = null
  fileInput.value?.click()
}

const handleFileChange = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !currentMember.value) return

  const path = `${store.currentFamily?.id || 'general'}/${currentMember.value.id}`
  const url = await FamilyRepository.uploadFile(file, path)

  if (url) {
    if (uploadType.value === 'gallery') {
      if (replacePhotoIndex.value !== null) {
        // Replace existing photo
        const updatedPhotos = [...currentMember.value.photos]
        updatedPhotos[replacePhotoIndex.value] = url
        store.updateMember(props.memberId, { photos: updatedPhotos })
        replacePhotoIndex.value = null
      } else {
        // Add new photo
        const updatedPhotos = [...currentMember.value.photos, url]
        store.updateMember(props.memberId, { photos: updatedPhotos })
      }
    } else {
      store.updateMember(props.memberId, { photoUrl: url })
    }
  }
  target.value = ''
}

// Remove photo from gallery
const removeGalleryPhoto = (index: number) => {
  if (currentMember.value) {
    const updatedPhotos = currentMember.value.photos.filter((_, i) => i !== index)
    store.updateMember(props.memberId, { photos: updatedPhotos })
  }
}

// Replace photo in gallery - trigger file upload
const replaceGalleryPhoto = (index: number) => {
  uploadType.value = 'gallery'
  replacePhotoIndex.value = index
  fileInput.value?.click()
}

// Add photo by URL to gallery
const addPhotoByUrl = () => {
  const url = prompt('Введите URL фотографии:')
  if (url && currentMember.value) {
    const updatedPhotos = [...currentMember.value.photos, url]
    store.updateMember(props.memberId, { photos: updatedPhotos })
    trackEvent('add_photo_url', { member_id: props.memberId })
  }
}

// Replace photo in gallery by URL
const replaceGalleryPhotoByUrl = (index: number) => {
  const url = prompt('Введите новый URL фотографии:')
  if (url && currentMember.value) {
    const updatedPhotos = [...currentMember.value.photos]
    updatedPhotos[index] = url
    store.updateMember(props.memberId, { photos: updatedPhotos })
  }
}

// Remove main photo
const removeMainPhoto = () => {
  store.updateMember(props.memberId, { photoUrl: '' })
}

// Set main photo from URL
const setMainPhotoByUrl = () => {
  const url = prompt('Введите URL фотографии:')
  if (url) {
    store.updateMember(props.memberId, { photoUrl: url })
    trackEvent('set_main_photo_url', { member_id: props.memberId })
  }
}

const addLifeEvent = () => {
  if (currentMember.value) {
    const updatedLifePath = [...(currentMember.value.lifePath || []), { year: '', title: '', description: '' }]
    store.updateMember(props.memberId, { lifePath: updatedLifePath })
  }
}

const updateLifeEvent = (index: number, field: string, value: string) => {
  if (currentMember.value) {
    const updatedLifePath = [...(currentMember.value.lifePath || [])]
    updatedLifePath[index] = { ...updatedLifePath[index], [field]: value }
    store.updateMember(props.memberId, { lifePath: updatedLifePath })
  }
}

const removeLifeEvent = (index: number) => {
  if (currentMember.value) {
    const updatedLifePath = currentMember.value.lifePath?.filter((_, i) => i !== index)
    store.updateMember(props.memberId, { lifePath: updatedLifePath })
  }
}

const addVideo = () => {
  const url = prompt('Введите URL видео:')
  if (url && currentMember.value) {
    const updatedVideos = [...(currentMember.value.videos || []), url]
    store.updateMember(props.memberId, { videos: updatedVideos })
  }
}

const handleSave = () => {
  if (validate()) {
    trackEvent('update_member', { member_id: props.memberId })
    emit('save')
  } else {
    alert('Пожалуйста, исправьте ошибки.')
  }
}

const handleDelete = () => {
  if (confirm('Вы уверены? Это действие необратимо.')) {
    trackEvent('delete_member', { member_id: props.memberId })
    emit('delete', props.memberId)
  }
}
</script>

<template>
  <div v-if="currentMember" class="bg-charcoal min-h-screen flex flex-col pb-20">
    
    <!-- Sticky Header -->
    <div class="sticky top-0 z-30 bg-charcoal/95 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center shadow-lg">
      <div class="flex items-center gap-3">
        <button @click="emit('back')" class="text-gray-400 p-1">
          <ArrowLeft class="w-6 h-6" />
        </button>
        <div>
          <h2 class="text-silk font-serif leading-none">{{ currentMember.name || 'Новый профиль' }}</h2>
          <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
            {{ viewMode === 'edit' ? 'Редактирование' : 'Предпросмотр' }}
          </p>
        </div>
      </div>
      
      <div class="flex items-center gap-2">
        <button 
          @click="viewMode = viewMode === 'edit' ? 'preview' : 'edit'"
          class="p-2 rounded-full bg-white/5 border border-white/10 text-gold"
        >
          <Eye v-if="viewMode === 'edit'" class="w-5 h-5" />
          <Edit2 v-else class="w-5 h-5" />
        </button>
        <BaseButton v-if="viewMode === 'edit'" size="sm" @click="handleSave">
          Сохранить
        </BaseButton>
      </div>
    </div>

    <!-- Mode: PREVIEW -->
    <div v-if="viewMode === 'preview'" class="p-4 overflow-y-auto animate-fade-in">
       <EditorPreview />
    </div>

    <!-- Mode: EDIT -->
    <div v-else class="p-4 overflow-y-auto space-y-6 animate-fade-in">

      <!-- No member selected -->
      <div v-if="!currentMember" class="text-center py-8">
        <p class="text-gray-400">Выберите члена семьи для редактирования</p>
      </div>

      <!-- Member editor form -->
      <template v-else>
        <!-- Hidden File Input -->
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="hidden"
          @change="handleFileChange"
        />

        <!-- Avatar & Basic Info -->
        <div class="flex flex-col items-center gap-4">
        <div class="relative group">
          <div
            @click="triggerMainPhotoUpload"
            class="w-28 h-28 rounded-full border-2 border-gold/30 overflow-hidden bg-white/5 cursor-pointer shadow-xl shadow-gold/5"
          >
            <img
              v-if="currentMember.photoUrl"
              :src="currentMember.photoUrl"
              class="w-full h-full object-cover"
            >
            <div v-else class="w-full h-full flex items-center justify-center text-4xl text-gray-600 font-serif">
              {{ currentMember.name ? currentMember.name[0] : '?' }}
            </div>
            <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <Edit2 class="w-6 h-6 text-white/70" />
            </div>
          </div>
          <!-- Remove main photo button -->
          <button
            v-if="currentMember.photoUrl"
            @click.stop="removeMainPhoto"
            class="absolute -top-1 -right-1 w-7 h-7 bg-red-500 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X class="w-4 h-4 text-white" />
          </button>
        </div>
        
        <div class="w-full space-y-4">
          <BaseInput
            :modelValue="currentMember.name"
            @update:modelValue="updateField('name', $event)"
            label="Полное имя *"
            placeholder="Напр: Иванов Иван Иванович"
          />
          <p v-if="errors.name" class="text-red-400 text-[10px] uppercase font-bold mt-1 tracking-wider">{{ errors.name }}</p>
          
          <BaseInput
            :modelValue="currentMember.relationship || ''"
            @update:modelValue="updateField('relationship', $event)"
            label="Кем приходится (роль)"
            placeholder="Напр: Основатель рода, Дедушка..."
          />

          <!-- Assign on Tree Button -->
          <button
            @click="emit('assignOnTree', props.memberId)"
            class="w-full p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center">
                <svg class="w-5 h-5 text-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M6 3v12"/>
                  <circle cx="18" cy="6" r="3"/>
                  <circle cx="6" cy="18" r="3"/>
                  <path d="M6 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
                  <path d="M18 9a9 9 0 0 1-9 9"/>
                </svg>
              </div>
              <div class="text-left">
                <p class="text-silk text-sm font-medium">
                  {{ currentMember?.displayRole || 'Назначить на древе' }}
                </p>
                <p class="text-gray-500 text-xs">
                  Выбрать место на семейном древе
                </p>
              </div>
            </div>
            <span class="text-gold">→</span>
          </button>
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-2 gap-4">
        <BaseInput
          :modelValue="currentMember.birthDate"
          @update:modelValue="updateField('birthDate', $event)"
          type="date"
          label="Дата рождения"
        />
        <BaseInput
          :modelValue="currentMember.deathDate || ''"
          @update:modelValue="updateField('deathDate', $event)"
          type="date"
          label="Дата ухода"
        />
      </div>

      <!-- Photo URL -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest">Основное фото</label>
        <div class="flex gap-2">
          <input
            :value="currentMember.photoUrl"
            @input="updateField('photoUrl', ($event.target as HTMLInputElement).value)"
            type="url"
            placeholder="URL фотографии"
            class="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk text-sm focus:outline-none focus:border-gold/50"
          />
          <button @click="setMainPhotoByUrl" class="px-3 bg-white/5 border border-white/10 rounded-lg text-gold" title="Добавить по ссылке">
            <Link class="w-5 h-5" />
          </button>
          <button @click="triggerMainPhotoUpload" class="px-3 bg-white/5 border border-white/10 rounded-lg text-gold" title="Загрузить файл">
            <Plus class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Biography -->
      <BaseInput
        :modelValue="currentMember.biography"
        @update:modelValue="updateField('biography', $event)"
        type="textarea"
        :rows="6"
        label="Биография"
        placeholder="Расскажите историю жизни..."
      />

      <!-- Life Path -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Жизненный путь</label>
          <button @click="addLifeEvent" class="text-gold text-xs flex items-center gap-1">
            <Plus class="w-3 h-3" /> Добавить событие
          </button>
        </div>
        
        <div v-for="(event, index) in currentMember.lifePath" :key="index" class="p-4 bg-white/5 rounded-2xl border border-white/5 relative">
          <button @click="removeLifeEvent(index)" class="absolute top-2 right-2 text-gray-600 hover:text-red-400">
            <Trash2 class="w-4 h-4" />
          </button>
          <div class="grid grid-cols-4 gap-3 mb-2">
            <input 
              :value="event.year" 
              @input="updateLifeEvent(index, 'year', ($event.target as HTMLInputElement).value)"
              placeholder="Год" 
              class="col-span-1 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-silk text-sm" 
            />
            <input 
              :value="event.title" 
              @input="updateLifeEvent(index, 'title', ($event.target as HTMLInputElement).value)"
              placeholder="Событие" 
              class="col-span-3 px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-silk text-sm font-bold" 
            />
          </div>
          <textarea 
            :value="event.description" 
            @input="updateLifeEvent(index, 'description', ($event.target as HTMLTextAreaElement).value)"
            placeholder="Описание..." 
            class="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-silk text-sm resize-none"
            rows="2"
          ></textarea>
        </div>
      </div>

      <!-- Quotes -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Цитаты</label>
          <button @click="addQuote" class="text-gold text-xs flex items-center gap-1">
            <Plus class="w-3 h-3" /> Добавить
          </button>
        </div>
        
        <div v-for="(quote, index) in currentMember.quotes" :key="index" class="flex gap-2">
          <textarea
            :value="quote"
            @input="updateQuote(index, ($event.target as HTMLInputElement).value)"
            class="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk text-sm focus:outline-none focus:border-gold/50 resize-none"
            placeholder="«Их мудрые слова...»"
            rows="2"
          ></textarea>
          <button @click="removeQuote(index)" class="p-2 self-start text-gray-600 hover:text-red-400">
            <Trash2 class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Media (Photos & Videos) -->
      <div class="space-y-4">
        <div class="flex justify-between items-center">
          <label class="text-xs font-bold text-gray-500 uppercase tracking-widest">Медиатека</label>
          <div class="flex gap-3">
            <button @click="addPhotoByUrl" class="text-gold text-xs flex items-center gap-1">
              <Link class="w-3 h-3" /> URL
            </button>
            <button @click="triggerPCGalleryUpload" class="text-gold text-xs flex items-center gap-1">
              <Plus class="w-3 h-3" /> Фото
            </button>
            <button @click="addVideo" class="text-gold text-xs flex items-center gap-1">
              <Plus class="w-3 h-3" /> Видео
            </button>
          </div>
        </div>

        <div class="grid grid-cols-3 gap-3">
          <div
            v-for="(photo, index) in currentMember.photos"
            :key="`ph-${index}`"
            class="aspect-square rounded-xl overflow-hidden bg-white/5 border border-white/10 relative group"
          >
            <img :src="photo" class="w-full h-full object-cover" />
            <!-- Hover overlay with actions -->
            <div class="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                @click="replaceGalleryPhoto(index)"
                class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                title="Заменить файлом"
              >
                <RefreshCw class="w-4 h-4 text-white" />
              </button>
              <button
                @click="replaceGalleryPhotoByUrl(index)"
                class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"
                title="Заменить по URL"
              >
                <Link class="w-4 h-4 text-white" />
              </button>
              <button
                @click="removeGalleryPhoto(index)"
                class="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500"
                title="Удалить"
              >
                <Trash2 class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
          <div
            v-for="(video, index) in currentMember.videos"
            :key="`vid-${index}`"
            class="aspect-square rounded-xl overflow-hidden bg-obsidian flex items-center justify-center border border-white/10"
          >
            <span class="text-gold text-xs">▶</span>
          </div>
          <button
            @click="triggerPCGalleryUpload"
            class="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center text-gray-600"
          >
            <Plus class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Delete Zone -->
      <div class="pt-10 pb-10 border-t border-white/5 mt-10">
        <button
          class="w-full py-4 rounded-xl bg-red-500/5 border border-red-500/20 text-red-400 font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
          @click="handleDelete"
        >
          <Trash2 class="w-4 h-4" /> Удалить профиль
        </button>
      </div>
      </template>

    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
