<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { useAnalytics } from '@/composables/useAnalytics'
import { Share2, Users, Check } from 'lucide-vue-next'

const store = useMemoryStore()
const { trackEvent } = useAnalytics()
const member = computed(() => store.activeMember)

// Sharing state
const shareProfileCopied = ref(false)
const shareTreeCopied = ref(false)

// Share URLs
const shareProfileUrl = computed(() => {
  if (typeof window !== 'undefined' && store.currentFamily?.id && member.value) {
    return `${window.location.origin}/archive/${store.currentFamily.id}?member=${member.value.id}`
  }
  return ''
})

const shareTreeUrl = computed(() => {
  if (typeof window !== 'undefined' && store.currentFamily?.id) {
    return `${window.location.origin}/archive/${store.currentFamily.id}/tree`
  }
  return ''
})

const copyProfileLink = async () => {
  try {
    await navigator.clipboard.writeText(shareProfileUrl.value)
    shareProfileCopied.value = true
    trackEvent('share_profile', { member_id: member.value?.id })
    setTimeout(() => {
      shareProfileCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const copyTreeLink = async () => {
  try {
    await navigator.clipboard.writeText(shareTreeUrl.value)
    shareTreeCopied.value = true
    trackEvent('share_tree', { family_id: store.currentFamily?.id })
    setTimeout(() => {
      shareTreeCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'Не указано'
  const date = new Date(dateStr)
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}
</script>

<template>
  <div class="space-y-6 md:space-y-8">

    <!-- Preview Notice with Share Buttons -->
    <div class="flex flex-col sm:flex-row items-center justify-between gap-3 py-3 px-4 md:py-4 md:px-6 rounded-lg bg-gold/10 border border-gold/20">
      <p class="text-gold text-xs md:text-sm">👁️ Предпросмотр — изменения отображаются в реальном времени</p>
      <!-- Share Buttons -->
      <div class="flex gap-2">
        <button
          @click="copyProfileLink"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
          :class="shareProfileCopied
            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
            : 'bg-white/10 border border-white/10 text-silk hover:bg-white/20'"
        >
          <Check v-if="shareProfileCopied" class="w-3.5 h-3.5" />
          <Share2 v-else class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{ shareProfileCopied ? 'Готово!' : 'Профиль' }}</span>
        </button>
        <button
          @click="copyTreeLink"
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
          :class="shareTreeCopied
            ? 'bg-green-500/20 border border-green-500/30 text-green-400'
            : 'bg-white/10 border border-white/10 text-silk hover:bg-white/20'"
        >
          <Check v-if="shareTreeCopied" class="w-3.5 h-3.5" />
          <Users v-else class="w-3.5 h-3.5" />
          <span class="hidden sm:inline">{{ shareTreeCopied ? 'Готово!' : 'Древо' }}</span>
        </button>
      </div>
    </div>

    <!-- Hero Preview -->
    <BaseCard class="overflow-hidden">
      <div class="aspect-[4/3] md:aspect-[16/9] relative bg-charcoal">
        <img
          v-if="member?.photoUrl"
          :src="member.photoUrl"
          :alt="member?.name"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-cover opacity-50"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-obsidian to-transparent"></div>

        <div class="absolute inset-0 flex flex-col items-center justify-center text-center p-4 md:p-6">
          <p v-if="member?.relationship" class="text-gold text-[9px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] mb-2 md:mb-3">
            {{ member.relationship }}
          </p>
          <h2 class="text-2xl md:text-4xl lg:text-5xl font-serif text-silk mb-3 md:mb-4">
            {{ member?.name || 'Имя члена семьи' }}
          </h2>
          <p class="text-gray-300 text-xs md:text-sm tracking-widest font-serif">
            {{ formatDate(member?.birthDate ?? '') }} — {{ member?.deathDate ? formatDate(member.deathDate) : 'настоящее время' }}
          </p>
        </div>
      </div>
    </BaseCard>

    <!-- Life Path Preview -->
    <div v-if="member?.lifePath?.length" class="space-y-4 md:space-y-6">
      <h3 class="text-xs text-gray-500 uppercase tracking-widest font-bold">Жизненный путь</h3>
      <div class="space-y-3 md:space-y-4">
         <div v-for="(event, index) in member.lifePath" :key="index" class="flex gap-3 md:gap-6">
            <div class="w-16 md:w-20 shrink-0 text-gold font-serif text-lg md:text-xl">{{ event.year }}</div>
            <div class="flex-1 pb-4 md:pb-6 border-b border-white/5">
               <h4 class="text-silk font-serif text-base md:text-lg mb-1 md:mb-2">{{ event.title }}</h4>
               <p class="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{{ event.description }}</p>
            </div>
         </div>
      </div>
    </div>

    <!-- Biography Preview -->
    <BaseCard class="p-5 md:p-8 border-white/5 bg-charcoal/30">
      <h3 class="text-xs text-gray-500 uppercase tracking-widest font-bold mb-4 md:mb-6">Биография</h3>
      <p class="text-silk/90 leading-relaxed text-base md:text-lg font-serif whitespace-pre-wrap">
        {{ member?.biography || 'Биография ещё не написана...' }}
      </p>
    </BaseCard>

    <!-- Quotes Preview -->
    <div v-if="member?.quotes?.length" class="space-y-4 md:space-y-6">
      <h3 class="text-xs text-gray-500 uppercase tracking-widest font-bold">Цитаты</h3>
      <div class="grid gap-3 md:gap-4">
        <div
          v-for="(quote, index) in member.quotes"
          :key="index"
          class="p-4 md:p-6 bg-white/5 border border-white/5 rounded-xl md:rounded-2xl relative"
        >
          <span class="absolute top-3 md:top-4 left-3 md:left-4 text-2xl md:text-4xl text-gold/20 font-serif">"</span>
          <p class="text-silk/80 italic text-base md:text-lg relative z-10">{{ quote }}</p>
        </div>
      </div>
    </div>

    <!-- Media Gallery Preview -->
    <div v-if="member?.photos?.length || member?.videos?.length" class="space-y-4 md:space-y-6">
      <h3 class="text-xs text-gray-500 uppercase tracking-widest font-bold">Медиагалерея</h3>

      <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <!-- Photos -->
        <div
          v-for="(photo, index) in member.photos.slice(0, 6)"
          :key="`photo-${index}`"
          class="aspect-square rounded-lg md:rounded-xl overflow-hidden group relative cursor-pointer shadow-lg md:shadow-xl"
        >
          <img
            :src="photo"
            loading="lazy"
            decoding="async"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          <div class="absolute inset-0 bg-gold/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>

        <!-- Videos -->
        <div
          v-for="(video, index) in (member.videos || []).slice(0, 3)"
          :key="`video-${index}`"
          class="aspect-square rounded-lg md:rounded-xl overflow-hidden bg-obsidian flex flex-col items-center justify-center border border-white/10 group cursor-pointer shadow-lg md:shadow-xl"
        >
           <div class="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-gold flex items-center justify-center text-gold mb-1 md:mb-2 group-hover:bg-gold group-hover:text-charcoal transition-all">
              <span class="ml-0.5 md:ml-1">▶</span>
           </div>
           <span class="text-[7px] md:text-[8px] uppercase tracking-widest text-gray-500">Видеозапись</span>
        </div>
      </div>

      <div v-if="(member.photos.length + (member.videos?.length || 0)) > 9" class="text-center pt-4">
         <BaseButton variant="ghost" size="sm" class="text-gold">Смотреть все медиафайлы</BaseButton>
      </div>
    </div>

  </div>
</template>
