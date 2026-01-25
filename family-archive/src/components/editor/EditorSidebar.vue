<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useMemoryStore } from '@/stores/memoryStore'

const emit = defineEmits<{
  save: []
}>()

const store = useMemoryStore()
const currentMember = computed(() => store.primaryMember)

const updateField = (field: string, value: string) => {
  if (currentMember.value) {
    store.updateMember(currentMember.value.id, { [field]: value })
  }
}

const addQuote = () => {
  if (currentMember.value) {
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
    const updatedPhotos = [...currentMember.value.photos, url]
    store.updateMember(currentMember.value.id, { photos: updatedPhotos })
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
    <div v-if="currentMember" class="space-y-5">
      
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
        <label class="block text-sm text-gray-400 mb-2">Дата ухода (необязательно)</label>
        <input
          :value="currentMember.deathDate"
          @input="updateField('deathDate', ($event.target as HTMLInputElement).value)"
          type="date"
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>

      <!-- Photo URL -->
      <div>
        <label class="block text-sm text-gray-400 mb-2">Основное фото (URL)</label>
        <input
          :value="currentMember.photoUrl"
          @input="updateField('photoUrl', ($event.target as HTMLInputElement).value)"
          type="url"
          placeholder="https://..."
          class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-600 focus:outline-none focus:border-gold/50 transition-colors"
        />
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

      <!-- Quotes -->
      <BaseCard class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm text-gray-400">Цитаты</h3>
          <button @click="addQuote" class="text-gold text-sm hover:underline">+ Добавить цитату</button>
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

      <!-- Gallery -->
      <BaseCard class="p-4">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm text-gray-400">Галерея ({{ currentMember.photos.length }} фото)</h3>
          <button @click="addPhoto" class="text-gold text-sm hover:underline">+ Добавить фото</button>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div 
            v-for="(photo, index) in currentMember.photos" 
            :key="index"
            class="aspect-square rounded overflow-hidden bg-charcoal"
          >
            <img :src="photo" :alt="`Фото ${index + 1}`" class="w-full h-full object-cover" />
          </div>
        </div>
      </BaseCard>

    </div>
  </div>
</template>
