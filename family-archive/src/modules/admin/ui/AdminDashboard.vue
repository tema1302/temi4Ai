<script setup lang="ts">
import { ref, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import SimpleChart from './SimpleChart.vue'
import { AnalyticsRepository, type DailyStats } from '../api/repository'
import { Users, MousePointer, Eye, ArrowLeft } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(true)

const pageViews = ref<DailyStats[]>([])
const registrations = ref<DailyStats[]>([])
const ctaClicks = ref<DailyStats[]>([])

const totalViews = ref(0)
const totalSignups = ref(0)

onMounted(async () => {
  isLoading.value = true
  try {
    // Parallel fetch
    const [views, signups, clicks, totViews, totSignups] = await Promise.all([
      AnalyticsRepository.getDailyStats('page_view', 7),
      AnalyticsRepository.getDailyStats('sign_up', 7),
      AnalyticsRepository.getDailyStats('cta_click', 7),
      AnalyticsRepository.getTotalCount('page_view'),
      AnalyticsRepository.getTotalCount('sign_up')
    ])

    pageViews.value = views
    registrations.value = signups
    ctaClicks.value = clicks
    totalViews.value = totViews
    totalSignups.value = totSignups
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen p-8">
      
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <button @click="router.push('/editor')" class="text-gray-400 hover:text-white flex items-center gap-2 mb-2 text-sm">
            <ArrowLeft class="w-4 h-4" /> Вернуться
          </button>
          <h1 class="text-3xl font-serif text-silk">Админ-панель</h1>
          <p class="text-gray-400">Внутренняя аналитика проекта</p>
        </div>
        <div class="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">
          Данные за 7 дней
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-20">
        <div class="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin mx-auto"></div>
      </div>

      <div v-else class="space-y-8">
        
        <!-- Summary Cards -->
        <div class="grid md:grid-cols-3 gap-4">
          <BaseCard class="p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Eye class="w-6 h-6" />
            </div>
            <div>
              <p class="text-gray-400 text-xs uppercase tracking-wider">Просмотры</p>
              <p class="text-2xl text-silk font-serif">{{ totalViews }}</p>
            </div>
          </BaseCard>

          <BaseCard class="p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-400">
              <Users class="w-6 h-6" />
            </div>
            <div>
              <p class="text-gray-400 text-xs uppercase tracking-wider">Регистрации</p>
              <p class="text-2xl text-silk font-serif">{{ totalSignups }}</p>
            </div>
          </BaseCard>
          
          <BaseCard class="p-6 flex items-center gap-4">
            <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
              <MousePointer class="w-6 h-6" />
            </div>
            <div>
              <p class="text-gray-400 text-xs uppercase tracking-wider">Конверсия</p>
              <p class="text-2xl text-silk font-serif">
                {{ totalViews > 0 ? ((totalSignups / totalViews) * 100).toFixed(1) : 0 }}%
              </p>
            </div>
          </BaseCard>
        </div>

        <!-- Charts Grid -->
        <div class="grid md:grid-cols-2 gap-8">
          
          <!-- Page Views Chart -->
          <BaseCard class="p-6">
            <SimpleChart 
              label="Просмотры страниц" 
              :data="pageViews" 
              color="#60a5fa"
            />
          </BaseCard>

          <!-- Registrations Chart -->
          <BaseCard class="p-6">
            <SimpleChart 
              label="Новые регистрации" 
              :data="registrations" 
              color="#4ade80"
            />
          </BaseCard>

          <!-- CTA Clicks Chart -->
          <BaseCard class="p-6 md:col-span-2">
            <SimpleChart 
              label="Клики по кнопкам (CTA)" 
              :data="ctaClicks" 
              color="#d4af37"
              :height="250"
            />
          </BaseCard>

        </div>
      </div>
    </div>
  </MainLayout>
</template>
