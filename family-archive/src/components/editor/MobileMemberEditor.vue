<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMemoryStore, type FamilyMember } from '@/modules/family/store/memoryStore'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import { useAnalytics } from '@/composables/useAnalytics'

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

// Local state for editing to allow validation before commit (optional)
// But to keep it simple and consistent with store, we'll edit store directly 
// but validate on "Save/Back".
// Actually, since the store updates immediately in the original app, 
// I should probably follow that pattern or introduce a local copy.
// Given the prompt asks for "Validation", let's use a local copy or validate the store state.
// Let's use direct store update for consistency with desktop, but showing errors.

const currentMember = computed(() => store.members.find(m => m.id === props.memberId))
const errors = ref<Record<string, string>>({})

const validate = (): boolean => {
  errors.value = {}
  if (!currentMember.value) return false
  
  if (!currentMember.value.name.trim()) {
    errors.value.name = 'Имя обязательно'
  }
  
  return Object.keys(errors.value).length === 0
}

const updateField = (field: keyof FamilyMember, value: any) => {
  if (currentMember.value) {
    store.updateMember(props.memberId, { [field]: value })
    // Clear error if exists
    if (errors.value[field]) delete errors.value[field]
  }
}

const addQuote = () => {
  if (currentMember.value) {
    const updatedQuotes = [...(currentMember.value.quotes || []), '']
    store.updateMember(props.memberId, { quotes: updatedQuotes })
  }
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

const addPhoto = () => {
  const url = prompt('Введите URL фотографии:')
  if (url && currentMember.value) {
    const updatedPhotos = [...currentMember.value.photos, url]
    store.updateMember(props.memberId, { photos: updatedPhotos })
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
      
      <!-- Avatar & Basic Info -->
      <div class="flex flex-col items-center gap-4">
        <div class="w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden bg-white/5 relative group">
          <img 
            v-if="currentMember.photoUrl" 
            :src="currentMember.photoUrl" 
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-3xl text-gray-600">
            {{ currentMember.name[0] }}
          </div>
          <!-- Edit overlay could go here -->
        </div>
        
        <div class="w-full">
          <BaseInput
            :modelValue="currentMember.name"
            @update:modelValue="updateField('name', $event)"
            label="Имя *"
            placeholder="ФИО"
          />
          <p v-if="errors.name" class="text-red-400 text-xs mt-1">{{ errors.name }}</p>
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

      <!-- Photos -->
      <div class="space-y-3">
        <div class="flex justify-between items-center">
          <label class="text-sm text-gray-400">Галерея</label>
          <button @click="addPhoto" class="text-gold text-xs border border-gold/30 px-2 py-1 rounded hover:bg-gold/10">
            + Добавить
          </button>
        </div>
        
        <div class="grid grid-cols-3 gap-2">
          <div 
            v-for="(photo, index) in currentMember.photos" 
            :key="index"
            class="aspect-square rounded overflow-hidden bg-white/5"
          >
            <img :src="photo" class="w-full h-full object-cover" />
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
