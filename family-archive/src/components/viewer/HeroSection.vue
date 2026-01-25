<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FamilyMember } from '@/stores/memoryStore'

interface Props {
  member: FamilyMember
  familyName: string
}

const props = defineProps<Props>()

const parallaxOffset = ref(0)

const formatDate = (dateStr: string) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

const lifespan = computed(() => {
  const birth = formatDate(props.member.birthDate)
  const death = props.member.deathDate ? formatDate(props.member.deathDate) : 'настоящее время'
  return `${birth} — ${death}`
})

onMounted(() => {
  const handleScroll = () => {
    parallaxOffset.value = window.scrollY * 0.3
  }
  window.addEventListener('scroll', handleScroll, { passive: true })
})
</script>

<template>
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
    
    <!-- Background Image with Parallax -->
    <div 
      class="absolute inset-0 z-0"
      :style="{ transform: `translateY(${parallaxOffset}px)` }"
    >
      <img 
        v-if="member.photoUrl"
        :src="member.photoUrl"
        :alt="member.name"
        class="w-full h-[120%] object-cover opacity-30"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-obsidian/60 via-obsidian/80 to-obsidian"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-4 py-32 text-center">
      
      <!-- Family Badge -->
      <div class="inline-block mb-6 px-4 py-1 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-gold tracking-widest uppercase">
        {{ familyName }}
      </div>

      <!-- Name -->
      <h1 class="text-5xl md:text-7xl lg:text-8xl font-serif font-medium leading-tight mb-6 text-silk">
        {{ member.name }}
      </h1>

      <!-- Lifespan -->
      <p class="text-xl md:text-2xl text-gray-400 mb-12 tracking-wide">
        {{ lifespan }}
      </p>

      <!-- Portrait Circle -->
      <div v-if="member.photoUrl" class="relative w-48 h-48 md:w-64 md:h-64 mx-auto mb-12">
        <div class="absolute inset-0 rounded-full bg-gradient-to-br from-gold/20 to-purple-500/20 blur-2xl"></div>
        <img 
          :src="member.photoUrl"
          :alt="member.name"
          class="relative w-full h-full object-cover rounded-full border-4 border-white/10 shadow-2xl"
        />
      </div>

      <!-- Biography -->
      <p class="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed">
        {{ member.biography }}
      </p>

      <!-- Scroll Indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-gold/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

    </div>
  </section>
</template>
