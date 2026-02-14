<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePeopleStore } from '../store/peopleStore';
import { ChevronLeft, Calendar, MapPin, Send, Phone, Edit, GraduationCap, Clock } from 'lucide-vue-next';
import { useSeo } from '../utils/useSeo';
import { RANKS } from '../data/constants';

const route = useRoute();
const router = useRouter();
const store = usePeopleStore();
const { setTitle, setDescription } = useSeo();

const getRankLabel = (slug: string) => {
  return RANKS.find(r => r.slug === slug)?.label || slug;
};

const person = computed(() => {
  const p = store.people.find(p => p.slug === route.params.slug);
  if (p) {
    setTitle(p.fullName);
    setDescription(`${getRankLabel(p.rank)} выпускник МДА. Место служения: ${p.address}`);
  }
  return p;
});

const serviceYears = computed(() => {
  if (!person.value?.ordinationDate) return null;
  const start = new Date(person.value.ordinationDate);
  const now = new Date();
  const diff = now.getFullYear() - start.getFullYear();
  return diff > 0 ? diff : null;
});
</script>

<template>
  <div v-if="person" class="min-h-screen bg-slate-50 font-sans">
    <nav class="bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center sticky top-0 z-20">
      <button @click="router.back()" class="flex items-center text-slate-900 hover:text-mda-blue transition-all font-bold text-sm group">
        <ChevronLeft class="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform" />
        <span>Вернуться к карте</span>
      </button>
      <div class="flex gap-4">
        <button 
          @click="router.push(`/add?edit=${person.slug}`)"
          class="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-mda-blue transition-colors uppercase tracking-widest"
        >
          <Edit class="h-4 w-4" />
          <span>Предложить правку</span>
        </button>
      </div>
    </nav>

    <div class="max-w-5xl mx-auto p-4 md:p-12">
      <div class="bg-white rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
        <div class="flex flex-col md:flex-row">
          <div class="w-full md:w-[400px] bg-slate-100 aspect-square md:aspect-auto overflow-hidden relative border-b md:border-b-0 md:border-r border-slate-100">
            <img 
              v-if="person.photoUrl" 
              :src="person.photoUrl" 
              class="w-full h-full object-cover" 
              :alt="person.fullName"
            />
            <div v-else class="w-full h-full flex items-center justify-center bg-slate-900 text-white text-6xl font-black">
              {{ person.fullName[0] }}
            </div>
            <div v-if="person.isVerified" class="absolute bottom-6 right-6 bg-green-500 text-white p-2 rounded-2xl shadow-xl" title="Проверенный аккаунт">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
          </div>

          <div class="p-8 md:p-16 md:flex-1">
            <div class="flex flex-wrap items-center gap-3 mb-8">
              <span class="px-4 py-1.5 bg-mda-blue/5 text-mda-blue rounded-full text-[10px] font-black uppercase tracking-widest border border-mda-blue/10">
                {{ getRankLabel(person.rank) }}
              </span>
              <div v-if="person.graduationYear" class="flex items-center gap-2 text-xs font-bold text-slate-400">
                <GraduationCap class="h-4 w-4" />
                Выпуск {{ person.graduationYear }}
              </div>
              <div v-if="serviceYears" class="flex items-center gap-2 text-xs font-bold text-slate-400">
                <Clock class="h-4 w-4" />
                {{ serviceYears }} лет служения
              </div>
            </div>
            
            <h1 class="text-4xl md:text-5xl font-black text-slate-900 mb-10 tracking-tight leading-[1.1]">{{ person.fullName }}</h1>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-12">
              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <MapPin class="h-4 w-4 text-mda-blue" />
                  <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Место служения</p>
                </div>
                <p class="text-lg text-slate-700 font-medium leading-relaxed">{{ person.address }}</p>
              </div>

              <div class="space-y-3">
                <div class="flex items-center gap-2">
                  <Calendar class="h-4 w-4 text-mda-blue" />
                  <p class="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">День Тезоименитства</p>
                </div>
                <p class="text-lg text-slate-700 font-medium leading-relaxed">{{ person.angelDay }}</p>
              </div>
            </div>

            <div class="border-t border-slate-100 pt-12">
              <h2 class="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Связаться с выпускником</h2>
              <div class="flex flex-col sm:flex-row gap-4">
                <a 
                  v-if="person.contacts.tg" 
                  :href="'https://t.me/' + person.contacts.tg.replace('@', '')"
                  target="_blank"
                  class="flex items-center justify-center gap-3 px-8 py-4 bg-[#0088cc] text-white rounded-[1.25rem] hover:opacity-90 transition-all font-bold text-sm shadow-xl shadow-blue-500/20 active:scale-[0.98]"
                >
                  <Send class="h-5 w-5" />
                  Написать в Telegram
                </a>
                <a 
                  v-if="person.contacts.phone" 
                  :href="'tel:' + person.contacts.phone"
                  class="flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-[1.25rem] hover:opacity-90 transition-all font-bold text-sm shadow-xl shadow-slate-900/20 active:scale-[0.98]"
                >
                  <Phone class="h-5 w-5" />
                  Позвонить
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="flex h-screen items-center justify-center">
    <div class="animate-pulse text-slate-400 font-bold uppercase tracking-widest text-xs">Загрузка профиля...</div>
  </div>
</template>