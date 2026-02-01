<script setup lang="ts">
import { computed } from 'vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'

const store = useMemoryStore()
const member = computed(() => store.activeMember)

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Не указано'
  const date = new Date(dateStr)
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}
</script>

<template>
  <div class="space-y-8">
    
    <!-- Preview Notice -->
    <div class="text-center py-4 px-6 rounded-lg bg-gold/10 border border-gold/20">
      <p class="text-gold text-sm">👁️ Предпросмотр — изменения отображаются в реальном времени</p>
    </div>

    <!-- Hero Preview -->
    <BaseCard class="overflow-hidden">
      <div class="aspect-[16/9] relative bg-charcoal">
        <img 
          v-if="member?.photoUrl"
          :src="member.photoUrl"
          :alt="member?.name"
          class="w-full h-full object-cover opacity-50"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent"></div>
        
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h2 class="text-3xl font-serif text-silk mb-2">
            {{ member?.name || 'Имя члена семьи' }}
          </h2>
          <p class="text-gray-400 text-sm">
            {{ formatDate(member?.birthDate ?? '') }} — {{ member?.deathDate ? formatDate(member.deathDate) : 'настоящее время' }}
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Biography Preview -->
    <BaseCard class="p-6">
      <h3 class="text-sm text-gray-400 uppercase tracking-wider mb-4">Биография</h3>
      <p class="text-silk/80 leading-relaxed">
        {{ member?.biography || 'Биография ещё не написана...' }}
      </p>
    </BaseCard>

    <!-- Quotes Preview -->
    <div v-if="member?.quotes?.length" class="space-y-4">
      <h3 class="text-sm text-gray-400 uppercase tracking-wider">Цитаты</h3>
      <BaseCard 
        v-for="(quote, index) in member.quotes" 
        :key="index"
        class="p-4"
      >
        <p class="text-silk/80 italic">"{{ quote }}"</p>
      </BaseCard>
    </div>

    <!-- Gallery Preview -->
    <div v-if="member?.photos?.length">
      <h3 class="text-sm text-gray-400 uppercase tracking-wider mb-4">Галерея</h3>
      <div class="grid grid-cols-2 gap-3">
        <BaseCard 
          v-for="(photo, index) in member.photos.slice(0, 4)" 
          :key="index"
          class="aspect-square overflow-hidden"
        >
          <img :src="photo" :alt="`Фото ${index + 1}`" class="w-full h-full object-cover" />
        </BaseCard>
      </div>
      <p v-if="member.photos.length > 4" class="text-sm text-gray-500 text-center mt-3">
        +{{ member.photos.length - 4 }} ещё {{ member.photos.length - 4 === 1 ? 'фотография' : 'фотографий' }}
      </p>
    </div>

  </div>
</template>
