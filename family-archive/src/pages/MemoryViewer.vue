<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import HeroSection from '@/components/viewer/HeroSection.vue'
import BentoGrid from '@/components/viewer/BentoGrid.vue'
import TimelineSection from '@/components/viewer/TimelineSection.vue'
import { useMemoryStore } from '@/stores/memoryStore'
import { fetchFamilyData } from '@/services/memoryService'

const route = useRoute()
const store = useMemoryStore()

const familyId = computed(() => route.params.id as string)
const isLoading = ref(true)
const notFound = ref(false)

onMounted(async () => {
  isLoading.value = true
  const data = await fetchFamilyData(familyId.value)
  
  if (data) {
    store.setFamily(data)
    notFound.value = false
  } else {
    notFound.value = true
  }
  
  isLoading.value = false
})

const setActiveMember = (id: string) => {
  store.setActiveMember(id)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <MainLayout>
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-400">Загружаем воспоминания...</p>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="min-h-screen flex items-center justify-center">
      <BaseCard class="p-12 text-center max-w-md">
        <div class="text-6xl mb-6">🕊️</div>
        <h2 class="text-2xl font-serif text-silk mb-4">Архив не найден</h2>
        <p class="text-gray-400 mb-6">Семейный архив "{{ familyId }}" еще не создан.</p>
        <router-link to="/" class="text-gold hover:underline">← Вернуться на главную</router-link>
      </BaseCard>
    </div>

    <!-- Main Content -->
    <div v-else class="relative z-10">
      
      <!-- Member Navigation (Sticky) -->
      <div v-if="store.members.length > 1" class="sticky top-0 z-50 bg-obsidian/80 backdrop-blur-md border-b border-white/10 py-4 overflow-x-auto">
        <div class="container mx-auto px-4 flex justify-center gap-4">
          <button 
            v-for="member in store.members" 
            :key="member.id"
            @click="setActiveMember(member.id)"
            class="flex items-center gap-2 px-4 py-2 rounded-full transition-all border"
            :class="store.activeMemberId === member.id 
              ? 'bg-gold/20 border-gold text-gold' 
              : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10 hover:text-silk'"
          >
            <div class="w-6 h-6 rounded-full overflow-hidden bg-charcoal">
              <img 
                v-if="member.photoUrl" 
                :src="member.photoUrl" 
                class="w-full h-full object-cover"
              />
              <div v-else class="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                {{ member.name[0] || '?' }}
              </div>
            </div>
            <span class="text-sm font-medium whitespace-nowrap">{{ member.name }}</span>
          </button>
        </div>
      </div>

      <!-- Content Components -->
      <div v-if="store.activeMember" :key="store.activeMember.id" class="animate-fade-in">
        
        <HeroSection 
          :member="store.activeMember"
          :family-name="store.familyName"
        />

        <!-- Bento Grid Gallery -->
        <section class="container mx-auto px-4 py-20">
          <h2 class="text-3xl font-serif text-center mb-12 text-silk/90">
            Дорогие сердцу моменты
          </h2>
          <BentoGrid :photos="store.activeMember.photos" />
        </section>

        <!-- Timeline -->
        <TimelineSection 
          :member="store.activeMember"
        />

        <!-- Quotes Section -->
        <section v-if="store.activeMember.quotes?.length" class="container mx-auto px-4 py-20">
          <h2 class="text-3xl font-serif text-center mb-12 text-silk/90">
            Слова, которые останутся с нами
          </h2>
          <div class="max-w-3xl mx-auto space-y-8">
            <BaseCard 
              v-for="(quote, index) in store.activeMember.quotes" 
              :key="index"
              class="p-8 text-center"
            >
              <p class="text-2xl font-serif italic text-silk/80 leading-relaxed">
                {{ quote }}
              </p>
            </BaseCard>
          </div>
        </section>

      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
