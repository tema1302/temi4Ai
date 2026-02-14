<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePeopleStore } from '../../store/peopleStore';
import { RANKS } from '../../data/constants';
import { Search, MapPin, UserPlus, Gift, Navigation, ChevronRight, X } from 'lucide-vue-next';
import Logo from '../ui/Logo.vue';
import { useNearby } from '../../utils/useNearby';
import { useRouter } from 'vue-router';

const store = usePeopleStore();
const router = useRouter();
const emit = defineEmits(['close']);
const { findNearby, nearbyPeople, isLocating, geoError } = useNearby();

const activeTab = ref<'search' | 'nearby'>('search');

const handleNearby = () => {
  activeTab.value = 'nearby';
  findNearby(store.people, 50);
};

const getRankLabel = (slug: string) => {
  return RANKS.find(r => r.slug === slug)?.label || slug;
};
</script>

<template>
  <aside class="w-full lg:w-[400px] h-full bg-white/80 backdrop-blur-xl border-r border-slate-200/50 flex flex-col z-10 flex-shrink-0 shadow-2xl lg:shadow-none transition-all">
        <!-- Header with modern branding -->
                <div class="p-8 pb-6 flex justify-between items-center">
                  <div class="flex items-center gap-4">
                    <Logo size="md" />
                    <div>
                      <h1 class="text-xl font-black text-slate-900 tracking-tight leading-none">МДА</h1>
                      <p class="text-[10px] font-bold text-mda-blue/60 uppercase tracking-[0.2em] mt-1">Архив выпускников</p>
                    </div>
                  </div>
                      <!-- Close button for mobile -->
          <button @click="$emit('close')" class="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X class="h-6 w-6 text-slate-600" />
          </button>
        </div>
    
        <!-- Modern Tabs -->
        <div class="px-8 mb-6">
          <div class="bg-slate-100/50 p-1 rounded-xl flex">
            <button 
              @click="activeTab = 'search'"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all"
              :class="activeTab === 'search' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            >
              <Search class="h-3.5 w-3.5" />
              Поиск
            </button>
            <button 
              @click="handleNearby"
              class="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition-all"
              :class="activeTab === 'nearby' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
            >
              <Navigation class="h-3.5 w-3.5" />
              Рядом
            </button>
          </div>
        </div>
    
        <div class="flex-1 overflow-y-auto px-8 custom-scrollbar">
          <!-- Search Tab Content -->
          <div v-if="activeTab === 'search'" class="space-y-8">
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Кого ищем?</label>
              <div class="relative group">
                <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-mda-blue transition-colors" />
                <input 
                  v-model="store.searchQuery"
                  type="text" 
                  placeholder="Имя или название храма..." 
                  class="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-mda-blue/5 focus:border-mda-blue outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>
    
            <div class="space-y-3">
              <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Фильтр по сану</label>
              <div class="flex flex-wrap gap-2">
                <button 
                  v-for="rank in RANKS" 
                  :key="rank.slug"
                  @click="store.setSelectedRank(store.selectedRank === rank.slug ? null : rank.slug)"
                  :class="[
                    'px-4 py-2 rounded-full text-xs font-bold border transition-all',
                    store.selectedRank === rank.slug 
                      ? 'bg-mda-blue border-mda-blue text-white shadow-lg shadow-blue-900/20' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  ]"
                >
                  {{ rank.label }}
                </button>
              </div>
            </div>
    
            <!-- Dynamic Results Preview -->
            <div class="space-y-4 pt-4 pb-8 border-t border-slate-100">
              <div class="flex justify-between items-center">
                 <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Найдено: {{ store.filteredPeople.length }}</label>
              </div>
              <div class="space-y-3">
                <div 
                  v-for="person in store.filteredPeople.slice(0, 10)" 
                  :key="person.id"
                  @click="router.push(`/p/${person.slug}`)"
                  class="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-mda-blue/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer flex items-center justify-between"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-mda-blue font-bold text-sm group-hover:bg-mda-blue group-hover:text-white transition-colors">
                      {{ person.fullName[0] }}
                    </div>
                    <div>
                      <h3 class="font-bold text-slate-900 text-sm leading-tight">{{ person.fullName }}</h3>
                      <p class="text-[11px] text-slate-500 mt-0.5">{{ getRankLabel(person.rank) }}</p>
                    </div>
                  </div>
                  <ChevronRight class="h-4 w-4 text-slate-300 group-hover:text-mda-blue transition-colors" />
                </div>
              </div>
            </div>
          </div>
    
                <!-- Nearby Tab Content -->
                <div v-else class="space-y-6">
                  <div v-if="isLocating" class="flex flex-col items-center justify-center py-20">
                    <div class="relative w-12 h-12">
                      <div class="absolute inset-0 border-4 border-mda-blue/10 rounded-full"></div>
                      <div class="absolute inset-0 border-4 border-mda-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p class="text-sm font-bold text-slate-900 mt-6 tracking-tight">Поиск ближайших...</p>
                    <p class="text-xs text-slate-400 mt-1">Определяем вашу геопозицию</p>
                  </div>
          
                  <div v-else-if="geoError" class="p-6 text-center">
                    <div class="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Navigation class="h-6 w-6" />
                    </div>
                    <p class="text-xs text-red-600 font-bold leading-relaxed">{{ geoError }}</p>
                    <button @click="handleNearby" class="mt-4 text-[10px] font-black text-mda-blue uppercase tracking-widest underline">Попробовать снова</button>
                  </div>
                  
                  <div v-else-if="nearbyPeople.length === 0" class="text-center py-20 px-4">              <div class="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Navigation class="h-8 w-8" />
              </div>
              <h3 class="text-sm font-bold text-slate-900">Никого не нашли</h3>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">В радиусе 50 км пока нет отмеченных выпускников или доступ к GPS запрещен.</p>
              <button @click="handleNearby" class="mt-6 text-xs font-black text-mda-blue uppercase tracking-widest hover:text-blue-700 transition-colors">Повторить поиск</button>
            </div>
    
            <div v-else class="space-y-3">
              <div class="flex items-center gap-2 mb-4 px-1">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">В радиусе 50 км: {{ nearbyPeople.length }}</p>
              </div>
              <div 
                v-for="person in nearbyPeople" 
                :key="person.id"
                @click="router.push(`/p/${person.slug}`)"
                class="group p-4 bg-white border border-slate-100 rounded-2xl hover:border-mda-blue/20 hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer"
              >
                <h3 class="font-bold text-slate-900 text-sm leading-tight">{{ person.fullName }}</h3>
                <div class="flex items-center gap-2 mt-2">
                  <span class="text-[10px] font-bold text-mda-blue/60 bg-mda-blue/5 px-2 py-0.5 rounded-md uppercase">{{ getRankLabel(person.rank) }}</span>
                </div>
                <p class="text-[11px] text-slate-400 mt-2 line-clamp-1">{{ person.address }}</p>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Actions Section -->
        <div class="p-8 space-y-3 bg-gradient-to-t from-white via-white to-transparent">
          <router-link 
            to="/anniversaries" 
            class="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
          >
            <Gift class="h-4 w-4" />
            Памятные даты
          </router-link>
    
                <router-link 
    
                  to="/add" 
    
                  class="flex items-center justify-center gap-2 w-full py-3.5 border-2 border-slate-100 text-slate-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
    
                >
    
                  <UserPlus class="h-4 w-4" />
    
                  Добавить выпускника
    
                </router-link>
    
          
        </div>
      </aside>
    </template>
    
    <style scoped>
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #e2e8f0;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #cbd5e1;
    }
    </style>
    