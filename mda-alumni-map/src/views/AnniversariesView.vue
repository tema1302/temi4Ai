<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronLeft, Gift, Award } from 'lucide-vue-next';
import { usePeopleStore } from '../store/peopleStore';

const router = useRouter();
const store = usePeopleStore();

const getMonth = (dateStr: string) => {
  // Simple parser for Russian dates like "20 января"
  const parts = dateStr.split(' ');
  if (parts.length < 2) return -1;
  const monthMap: Record<string, number> = {
    'января': 0, 'февраля': 1, 'марта': 2, 'апреля': 3, 'мая': 4, 'июня': 5,
    'июля': 6, 'августа': 7, 'сентября': 8, 'октября': 9, 'ноября': 10, 'декабря': 11
  };
  return monthMap[parts[1].toLowerCase()] || -1;
};

const upcoming = computed(() => {
  const today = new Date();
  const currentMonth = today.getMonth();
  
  return store.people.filter(p => {
    // Check Angel Day
    const m = getMonth(p.angelDay);
    if (m === currentMonth || m === (currentMonth + 1) % 12) return true;
    
    // Check Ordination
    if (p.ordinationDate) {
      const ordDate = new Date(p.ordinationDate);
      if (ordDate.getMonth() === currentMonth) return true;
    }
    return false;
  });
});
</script>

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <nav class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
      <button @click="router.back()" class="flex items-center text-mda-blue hover:text-blue-900 transition-colors">
        <ChevronLeft class="h-5 w-5 mr-1" />
        <span>Назад</span>
      </button>
    </nav>

    <div class="flex-1 p-6 max-w-3xl mx-auto w-full">
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 p-8 text-white">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <Gift class="h-6 w-6" />
            Памятные даты
          </h1>
          <p class="text-indigo-100 mt-2">Дни Ангела и годовщины хиротоний в этом месяце.</p>
        </div>

        <div class="p-6">
          <div v-if="upcoming.length === 0" class="text-center py-12 text-gray-500">
            В ближайшее время памятных дат нет.
          </div>
          <div v-else class="grid gap-4">
            <div 
              v-for="person in upcoming" 
              :key="person.id"
              class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer border border-gray-100"
              @click="router.push(`/p/${person.slug}`)"
            >
              <div class="flex items-center gap-4">
                <div class="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                  {{ person.fullName[0] }}
                </div>
                <div>
                  <h3 class="font-bold text-gray-900">{{ person.fullName }}</h3>
                  <p class="text-xs text-gray-500">{{ person.rank }} • {{ person.address }}</p>
                </div>
              </div>
              <div class="text-right">
                <div class="flex items-center gap-1 text-sm text-purple-600 font-medium">
                  <Gift class="h-3 w-3" />
                  {{ person.angelDay }}
                </div>
                <div v-if="person.ordinationDate" class="flex items-center gap-1 text-xs text-gray-400 mt-1">
                  <Award class="h-3 w-3" />
                  {{ new Date(person.ordinationDate).getFullYear() }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
