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
      
      <!-- Hero Section -->
      <HeroSection 
        v-if="store.primaryMember"
        :member="store.primaryMember"
        :family-name="store.familyName"
      />

      <!-- Bento Grid Gallery -->
      <section class="container mx-auto px-4 py-20">
        <h2 class="text-3xl font-serif text-center mb-12 text-silk/90">
          Дорогие сердцу моменты
        </h2>
        <BentoGrid v-if="store.primaryMember" :photos="store.primaryMember.photos" />
      </section>

      <!-- Timeline -->
      <TimelineSection 
        v-if="store.primaryMember"
        :member="store.primaryMember"
      />

      <!-- Quotes Section -->
      <section v-if="store.primaryMember?.quotes?.length" class="container mx-auto px-4 py-20">
        <h2 class="text-3xl font-serif text-center mb-12 text-silk/90">
          Слова, которые останутся с нами
        </h2>
        <div class="max-w-3xl mx-auto space-y-8">
          <BaseCard 
            v-for="(quote, index) in store.primaryMember.quotes" 
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
  </MainLayout>
</template>
