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
          <p v-if="member?.relationship" class="text-gold text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
            {{ member.relationship }}
          </p>
          <h2 class="text-4xl md:text-5xl font-serif text-silk mb-4">
            {{ member?.name || 'Имя члена семьи' }}
          </h2>
          <p class="text-gray-300 text-sm tracking-widest font-serif">
            {{ formatDate(member?.birthDate ?? '') }} — {{ member?.deathDate ? formatDate(member.deathDate) : 'настоящее время' }}
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Life Path Preview -->
    <div v-if="member?.lifePath?.length" class="space-y-6">
      <h3 class="text-xs text-gray-500 uppercase tracking-widest font-bold">Жизненный путь</h3>
      <div class="space-y-4">
         <div v-for="(event, index) in member.lifePath" :key="index" class="flex gap-6">
            <div class="w-20 shrink-0 text-gold font-serif text-xl">{{ event.year }}</div>
            <div class="flex-1 pb-6 border-b border-white/5">
               <h4 class="text-silk font-serif text-lg mb-2">{{ event.title }}</h4>
               <p class="text-gray-400 text-sm leading-relaxed">{{ event.description }}</p>
            </div>
         </div>
      </div>
    </div>

    <!-- Biography Preview -->
    <BaseCard class="p-8 border-white/5 bg-charcoal/30">
      <h3 class="text-xs text-gray-500 uppercase tracking-widest font-bold mb-6">Биография</h3>
      <p class="text-silk/90 leading-relaxed text-lg font-serif">
        {{ member?.biography || 'Биография ещё не написана...' }}
      </p>
    </BaseCard>

    <!-- Quotes Preview -->
    <div v-if="member?.quotes?.length" class="space-y-6">
      <h3 class="text-xs text-gray-500 uppercase tracking-widest font-bold">Цитаты</h3>
      <div class="grid gap-4">
        <div 
          v-for="(quote, index) in member.quotes" 
          :key="index"
          class="p-6 bg-white/5 border border-white/5 rounded-2xl relative"
        >
          <span class="absolute top-4 left-4 text-4xl text-gold/20 font-serif">“</span>
          <p class="text-silk/80 italic text-lg relative z-10">{{ quote }}</p>
        </div>
      </div>
    </div>

    <!-- Media Gallery Preview -->
    <div v-if="member?.photos?.length || member?.videos?.length" class="space-y-6">
      <h3 class="text-xs text-gray-500 uppercase tracking-widest font-bold">Медиагалерея</h3>
      
      <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
        <!-- Photos -->
        <div 
          v-for="(photo, index) in member.photos.slice(0, 6)" 
          :key="`photo-${index}`"
          class="aspect-square rounded-xl overflow-hidden group relative cursor-pointer shadow-xl"
        >
          <img :src="photo" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div class="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <!-- Videos -->
        <div 
          v-for="(video, index) in (member.videos || []).slice(0, 3)" 
          :key="`video-${index}`"
          class="aspect-square rounded-xl overflow-hidden bg-obsidian flex flex-col items-center justify-center border border-white/10 group cursor-pointer shadow-xl"
        >
           <div class="w-12 h-12 rounded-full border-2 border-gold flex items-center justify-center text-gold mb-2 group-hover:bg-gold group-hover:text-charcoal transition-all">
              <span class="ml-1">▶</span>
           </div>
           <span class="text-[8px] uppercase tracking-widest text-gray-500">Видеозапись</span>
        </div>
      </div>

      <div v-if="(member.photos.length + (member.videos?.length || 0)) > 9" class="text-center pt-4">
         <BaseButton variant="ghost" size="sm" class="text-gold">Смотреть все медиафайлы</BaseButton>
      </div>
    </div>

  </div>
</template>
