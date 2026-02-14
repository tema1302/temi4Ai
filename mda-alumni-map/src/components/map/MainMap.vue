<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { usePeopleStore } from '../../store/peopleStore';
import { useRouter } from 'vue-router';
import { RANKS } from '../../data/constants';

declare const ymaps: any;

const store = usePeopleStore();
const router = useRouter();
const mapContainer = ref<HTMLElement | null>(null);
let map: any = null;
let objectManager: any = null;

const getRankColor = (rankSlug: string) => {
  const rank = RANKS.find(r => r.slug === rankSlug);
  return rank ? rank.color : '#1a365d';
};

const getRankLabel = (slug: string) => {
  return RANKS.find(r => r.slug === slug)?.label || slug;
};

onMounted(() => {
  if (!mapContainer.value) return;

  // Wait for ymaps to be ready
  ymaps.ready(init);
});

function init() {
  map = new ymaps.Map(mapContainer.value, {
    center: [55.7558, 37.6173],
    zoom: 6,
    controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
  }, {
    searchControlProvider: 'yandex#search'
  });

  objectManager = new ymaps.ObjectManager({
    clusterize: true,
    gridSize: 32,
    clusterDisableClickZoom: false
  });

  // Modern cluster styling
  objectManager.clusters.options.set('preset', 'islands#invertedDarkBlueClusterIcons');
  map.geoObjects.add(objectManager);

  updateMarkers();
}

const updateMarkers = () => {
  if (!map || !objectManager) return;

  const features = store.filteredPeople.map(person => {
    const color = getRankColor(person.rank);
    return {
      type: 'Feature',
      id: person.id,
      geometry: {
        type: 'Point',
        coordinates: person.coordinates
      },
      properties: {
        balloonContentHeader: `<div class="font-black text-slate-900 text-sm">${person.fullName}</div>`,
        balloonContentBody: `
          <div class="pt-2 pb-1">
            <div class="text-[9px] font-black text-mda-blue/60 mb-2 uppercase tracking-wider">${getRankLabel(person.rank)}</div>
            <div class="text-[11px] text-slate-500 mb-4 leading-relaxed">${person.address}</div>
            <button class="w-full py-2.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.1em] rounded-xl hover:bg-slate-800 transition-all active:scale-[0.98] view-profile-btn" data-slug="${person.slug}">
              Смотреть профиль
            </button>
          </div>
        `,
        hintContent: person.fullName
      },
      options: {
        preset: 'islands#dotIcon',
        iconColor: color
      }
    };
  });

  objectManager.removeAll();
  objectManager.add(features);
};

// Handle clicks inside balloons
onMounted(() => {
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('view-profile-btn')) {
      const slug = target.getAttribute('data-slug');
      if (slug) router.push(`/p/${slug}`);
    }
  });
});

watch(() => store.filteredPeople, () => {
  updateMarkers();
}, { deep: true });
</script>

<template>
  <div ref="mapContainer" class="w-full h-full z-0"></div>
</template>

<style>
/* Modern Yandex Balloon Styling */
[class*="ymaps-2-1-"][class*="-balloon"] {
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25) !important;
  border-radius: 24px !important;
  border: 1px solid rgba(255,255,255,0.5) !important;
  background: rgba(255,255,255,0.95) !important;
  backdrop-filter: blur(10px);
}
[class*="ymaps-2-1-"][class*="-balloon__content"] {
  padding: 20px !important;
  border-radius: 24px !important;
  margin-right: 0 !important;
}
[class*="ymaps-2-1-"][class*="-balloon__close-button"] {
  background: none !important;
  opacity: 0.6 !important;
  width: 24px !important;
  height: 24px !important;
  margin: 10px !important;
  transition: opacity 0.2s;
  display: flex !important;
  align-items: center;
  justify-content: center;
  position: relative;
}
[class*="ymaps-2-1-"][class*="-balloon__close-button"]::before,
[class*="ymaps-2-1-"][class*="-balloon__close-button"]::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 2px;
  background-color: #000;
  border-radius: 1px;
}
[class*="ymaps-2-1-"][class*="-balloon__close-button"]::before {
  transform: rotate(45deg);
}
[class*="ymaps-2-1-"][class*="-balloon__close-button"]::after {
  transform: rotate(-45deg);
}
[class*="ymaps-2-1-"][class*="-balloon__close-button"]:hover {
  opacity: 1 !important;
}
[class*="ymaps-2-1-"][class*="-balloon__tail"] {
  display: none !important; /* Remove the old-fashioned tail */
}
[class*="ymaps-2-1-"][class*="-balloon__layout"] {
  border: none !important;
  background: transparent !important;
}
</style>
