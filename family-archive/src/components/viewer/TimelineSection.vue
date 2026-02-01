<script setup lang="ts">
import type { FamilyMember } from '@/modules/family/store/memoryStore'
import BaseCard from '@/shared/ui/BaseCard.vue'

interface Props {
  member: FamilyMember
}

const props = defineProps<Props>()

const formatYear = (dateStr: string) => {
  if (!dateStr) return ''
  return new Date(dateStr).getFullYear().toString()
}

// Generate timeline events
const timelineEvents = [
  {
    year: formatYear(props.member.birthDate),
    title: 'Рождение',
    description: `${props.member.name} появился на свет.`,
    icon: '👶',
  },
  ...(props.member.deathDate
    ? [
        {
          year: formatYear(props.member.deathDate),
          title: 'Ушёл из жизни',
          description: `${props.member.name} покинул этот мир, оставив светлую память в наших сердцах.`,
          icon: '🕊️',
        },
      ]
    : []),
]
</script>

<template>
  <section class="container mx-auto px-4 py-20">
    <h2 class="text-3xl font-serif text-center mb-16 text-silk/90">
      Жизненный путь
    </h2>

    <!-- Timeline -->
    <div class="relative max-w-3xl mx-auto">
      <!-- Vertical Line -->
      <div class="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/50 via-gold/20 to-transparent -translate-x-1/2"></div>

      <!-- Timeline Items -->
      <div 
        v-for="(event, index) in timelineEvents" 
        :key="index"
        class="relative flex items-center mb-16 last:mb-0"
        :class="index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'"
      >
        <!-- Content Card -->
        <div class="w-5/12">
          <BaseCard class="p-6">
            <div class="flex items-center gap-3 mb-3">
              <span class="text-2xl">{{ event.icon }}</span>
              <span class="text-gold font-medium">{{ event.year }}</span>
            </div>
            <h3 class="text-xl font-serif text-silk mb-2">{{ event.title }}</h3>
            <p class="text-gray-400 text-sm leading-relaxed">{{ event.description }}</p>
          </BaseCard>
        </div>

        <!-- Center Dot -->
        <div class="w-2/12 flex justify-center">
          <div class="w-4 h-4 bg-gold rounded-full border-4 border-obsidian shadow-lg shadow-gold/30 z-10"></div>
        </div>

        <!-- Empty Space -->
        <div class="w-5/12"></div>
      </div>
    </div>

    <!-- Note for empty timeline -->
    <p v-if="timelineEvents.length === 0" class="text-center text-gray-500">
      События жизни появятся здесь.
    </p>
  </section>
</template>
