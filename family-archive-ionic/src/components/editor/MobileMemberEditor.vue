<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import type { FamilyMember } from '@/modules/family/domain/models'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import { useAnalytics } from '@/composables/useAnalytics'
import { FamilyRepository } from '@/modules/family/api/repository'

const props = defineProps<{
  memberId: string
}>()

const emit = defineEmits<{
  save: []
  back: []
  delete: [id: string]
}>()

const store = useMemoryStore()
const { trackEvent } = useAnalytics()
const fileInput = ref<HTMLInputElement | null>(null)
const uploadType = ref<'main' | 'gallery'>('main')

// ... (existing code) ...

const addPhoto = () => {
  uploadType.value = 'gallery'
  fileInput.value?.click()
}

const triggerMainPhotoUpload = () => {
  uploadType.value = 'main'
  fileInput.value?.click()
}

const handleFileChange = async (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !currentMember.value) return

  const path = `${store.currentFamily?.id || 'general'}/${currentMember.value.id}`
  const url = await FamilyRepository.uploadFile(file, path)
  
  if (url) {
    if (uploadType.value === 'gallery') {
      const updatedPhotos = [...currentMember.value.photos, url]
      store.updateMember(props.memberId, { photos: updatedPhotos })
    } else {
      store.updateMember(props.memberId, { photoUrl: url })
    }
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
    // Scroll to top or show toast
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
    <div class="sticky top-0 z-20 bg-charcoal/90 backdrop-blur border-b border-white/10 p-4 flex justify-between items-center shadow-lg">
      <button @click="emit('back')" class="text-gray-400 flex items-center gap-1 text-sm">
        ← Назад
      </button>
      <h2 class="text-silk font-medium">Редактирование</h2>
      <button @click="handleSave" class="text-gold font-bold text-sm">
        Сохранить
      </button>
    </div>

    <!-- Form Content -->
    <div class="p-4 space-y-6">
      
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
        <div 
          @click="triggerMainPhotoUpload"
          class="w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 relative group cursor-pointer"
        >
          <img 
            v-if="currentMember.photoUrl" 
            :src="currentMember.photoUrl" 
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-3xl text-gray-600">
            {{ currentMember.name[0] }}
          </div>
          <div class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span class="text-[10px] text-white font-bold uppercase">Сменить</span>
          </div>
        </div>
        
        <div class="w-full">
          <BaseInput
            :modelValue="currentMember.name"
            @update:modelValue="updateField('name', $event)"
            label="Имя *"
            placeholder="ФИО"
          />
          <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
          
          <div class="mt-4">
             <BaseInput
                :modelValue="currentMember.relationship || ''"
                @update:modelValue="updateField('relationship', $event)"
                label="Родственность"
                placeholder="Напр: Дедушка, Основатель..."
              />
          </div>
        </div>
      </div>

      <!-- Dates -->
      <div class="grid grid-cols-2 gap-4">
        <BaseInput
          :modelValue="currentMember.birthDate"
          @update:modelValue="updateField('birthDate', $event)"
          type="date"
          label="Рождение"
        />
        <BaseInput
          :modelValue="currentMember.deathDate || ''"
          @update:modelValue="updateField('deathDate', $event)"
          type="date"
          label="Уход"
        />
      </div>

      <!-- Photo URL -->
      <BaseInput
        :modelValue="currentMember.photoUrl"
        @update:modelValue="updateField('photoUrl', $event)"
        type="url"
        label="Ссылка на фото"
        placeholder="https://example.com/photo.jpg"
      />

      <!-- Biography -->
      <BaseInput
        :modelValue="currentMember.biography"
        @update:modelValue="updateField('biography', $event)"
        type="textarea"
        :rows="6"
        label="Биография"
        placeholder="История жизни..."
      />

      <!-- Life Path -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <label class="text-sm text-gray-400">Жизненный путь</label>
          <button @click="addLifeEvent" class="text-gold text-xs border border-gold/30 px-2 py-1 rounded hover:bg-gold/10">
            + Добавить
          </button>
        </div>
        
        <div v-for="(event, index) in currentMember.lifePath" :key="index" class="p-4 bg-white/5 rounded-lg border border-white/5 relative">
          <button @click="removeLifeEvent(index)" class="absolute top-2 right-2 text-red-500">✕</button>
          <input 
            :value="event.year" 
            @input="updateLifeEvent(index, 'year', ($event.target as HTMLInputElement).value)"
            placeholder="Год" 
            class="w-20 mb-2 px-3 py-1 bg-white/10 border border-white/10 rounded text-silk text-sm" 
          />
          <input 
            :value="event.title" 
            @input="updateLifeEvent(index, 'title', ($event.target as HTMLInputElement).value)"
            placeholder="Событие" 
            class="w-full mb-2 px-3 py-1 bg-white/10 border border-white/10 rounded text-silk text-sm font-bold" 
          />
          <textarea 
            :value="event.description" 
            @input="updateLifeEvent(index, 'description', ($event.target as HTMLTextAreaElement).value)"
            placeholder="Описание" 
            class="w-full px-3 py-1 bg-white/10 border border-white/10 rounded text-silk text-sm resize-none"
          ></textarea>
        </div>
      </div>

      <!-- Quotes -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <label class="text-sm text-gray-400">Цитаты</label>
          <button @click="addQuote" class="text-gold text-xs border border-gold/30 px-2 py-1 rounded hover:bg-gold/10">
            + Добавить
          </button>
        </div>
        
        <div v-for="(quote, index) in currentMember.quotes" :key="index" class="flex gap-2">
          <input
            :value="quote"
            @input="updateQuote(index, ($event.target as HTMLInputElement).value)"
            class="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded text-silk text-sm focus:outline-none focus:border-gold/50"
            placeholder="Цитата..."
          />
          <button @click="removeQuote(index)" class="text-red-400 px-2">✕</button>
        </div>
      </div>

      <!-- Media (Photos & Videos) -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <label class="text-sm text-gray-400">Медиатека</label>
          <div class="flex gap-2">
            <button @click="addPhoto" class="text-gold text-xs border border-gold/30 px-2 py-1 rounded hover:bg-gold/10">
              + Фото
            </button>
            <button @click="addVideo" class="text-gold text-xs border border-gold/30 px-2 py-1 rounded hover:bg-gold/10">
              + Видео
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-4 gap-2">
          <div 
            v-for="(photo, index) in currentMember.photos" 
            :key="`ph-${index}`"
            class="aspect-square rounded overflow-hidden bg-white/5 border border-white/10"
          >
            <img :src="photo" class="w-full h-full object-cover" />
          </div>
          <div 
            v-for="(video, index) in currentMember.videos" 
            :key="`vid-${index}`"
            class="aspect-square rounded overflow-hidden bg-obsidian flex items-center justify-center border border-white/10"
          >
            <span class="text-gold text-xs">▶</span>
          </div>
        </div>
      </div>

      <!-- Delete Zone -->
      <div class="pt-8 border-t border-white/5 mt-8">
        <BaseButton 
          variant="ghost" 
          full 
          class="!text-red-400 hover:!bg-red-900/20"
          @click="handleDelete"
        >
          Удалить человека
        </BaseButton>
      </div>

    </div>
  </div>
</template>
