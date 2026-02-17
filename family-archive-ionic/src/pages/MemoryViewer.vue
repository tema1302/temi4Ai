<script setup lang="ts">
import { IonPage, IonContent } from '@ionic/vue';
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import BentoGrid from '@/components/viewer/BentoGrid.vue'
import HeroSection from '@/components/viewer/HeroSection.vue'
import TimelineSection from '@/components/viewer/TimelineSection.vue'
import TheFooter from '@/components/layout/TheFooter.vue'
import Skeleton from '@/shared/ui/Skeleton.vue'

const route = useRoute()
const store = useMemoryStore()
const familyId = route.params.id as string

onMounted(async () => {
  await store.loadFamilyBySlug(familyId)
})

const currentMember = computed(() => store.activeMember)
</script>

<template>
  <ion-page>
    <ion-content>
      <div class="min-h-screen bg-obsidian">
        <div v-if="store.isLoading" class="p-8 space-y-12">
          <Skeleton className="h-[60vh] w-full rounded-3xl" />
          <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Skeleton v-for="i in 4" :key="i" className="h-64 w-full rounded-2xl" />
          </div>
        </div>

        <template v-else-if="store.currentFamily">
          <HeroSection :member="currentMember" :family-name="store.familyName" />
          
          <main class="max-w-7xl mx-auto px-4 py-20 space-y-32">
            <BentoGrid :member="currentMember" />
            <TimelineSection :member="currentMember" />
          </main>

          <TheFooter />
        </template>

        <div v-else class="flex flex-col items-center justify-center min-h-screen text-center p-8">
          <h2 class="text-3xl font-serif text-silk mb-4">Архив не найден</h2>
          <p class="text-gray-400 mb-8 text-lg">Возможно, ссылка неверна или архив был удален.</p>
          <router-link to="/" class="text-gold hover:underline">Вернуться на главную</router-link>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.bg-obsidian {
  background-color: #1a1a23;
}
</style>
