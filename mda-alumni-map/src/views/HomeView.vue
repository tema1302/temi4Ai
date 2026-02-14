<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { usePeopleStore } from '../store/peopleStore';
import Sidebar from '../components/layout/Sidebar.vue';
import MainMap from '../components/map/MainMap.vue';
import HeroSection from '../components/HeroSection.vue';
import type { Rank } from '../types';
import { Menu, X } from 'lucide-vue-next';

const route = useRoute();
const store = usePeopleStore();
const isSidebarOpen = ref(false);
const touchStart = ref(0);
const touchEnd = ref(0);

const handleTouchStart = (e: TouchEvent) => {
  touchStart.value = e.targetTouches[0].clientX;
};

const handleTouchMove = (e: TouchEvent) => {
  touchEnd.value = e.targetTouches[0].clientX;
};

const handleTouchEnd = () => {
  // If swipe left is more than 50px
  if (touchStart.value - touchEnd.value > 50) {
    isSidebarOpen.value = false;
  }
};

const syncFilters = () => {
  if (route.params.rank) {
    store.setSelectedRank(route.params.rank as Rank);
  }
  if (route.params.region) {
    store.setSelectedRegion(route.params.region as string);
  }
};

onMounted(() => {
  store.fetchPeople();
  syncFilters();
});
watch(() => route.params, syncFilters);

// Close sidebar on route change (for mobile)
watch(() => route.fullPath, () => {
  isSidebarOpen.value = false;
});
</script>

<template>
  <div class="flex h-screen w-full bg-gray-50 overflow-hidden relative">
    <!-- Mobile Header -->
    <header class="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4">
      <h1 class="font-bold text-mda-blue">МДА: Выпускники</h1>
      <button 
        @click="isSidebarOpen = !isSidebarOpen"
        class="p-2 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Menu v-if="!isSidebarOpen" class="h-6 w-6 text-gray-600" />
        <X v-else class="h-6 w-6 text-gray-600" />
      </button>
    </header>

    <!-- Sidebar Overlay for Mobile -->
    <div 
      v-if="isSidebarOpen" 
      @click="isSidebarOpen = false"
      class="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
    ></div>

    <Sidebar 
      @close="isSidebarOpen = false"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
      :class="[
        'fixed lg:relative z-50 lg:z-10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] h-full',
        isSidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full lg:translate-x-0 opacity-0 lg:opacity-100'
      ]"
    />
    
    <main class="flex-1 relative mt-16 lg:mt-0">
      <HeroSection />
      <MainMap />
    </main>
  </div>
</template>
