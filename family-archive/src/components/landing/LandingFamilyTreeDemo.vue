<script setup lang="ts">
import FamilyTree from '@/components/tree/FamilyTree.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { RURIK_FAMILY_DEMO, RURIK_STATS } from '@/data/demoRurikTree'
import { useRouter } from 'vue-router'

const router = useRouter()

const handleCreateOwn = () => {
  router.push('/auth')
}
</script>

<template>
  <section class="py-20 md:py-32 px-4 bg-obsidian relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/3 rounded-full blur-3xl"></div>
    </div>

    <div class="max-w-7xl mx-auto relative">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="text-gold text-sm tracking-widest uppercase font-bold mb-4 block">
          Пример
        </span>
        <h2 class="text-3xl md:text-5xl font-serif text-silk mb-6">
          Родословная Рюриковичей
        </h2>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          От Рюрика (862 г.) до Николая II (1918 г.) — более 1000 лет истории в одном древе
        </p>

        <!-- Stats -->
        <div class="flex flex-wrap justify-center gap-8 mb-8">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-serif text-gold">{{ RURIK_STATS.generations }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">поколений</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-serif text-gold">{{ RURIK_STATS.totalYears }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">лет истории</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-serif text-gold">{{ RURIK_STATS.rulers }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">правителей</div>
          </div>
        </div>
      </div>

      <!-- Tree Container -->
      <div class="h-[500px] md:h-[600px] rounded-3xl border border-white/10 overflow-hidden bg-charcoal/50 relative">
        <FamilyTree
          :members="RURIK_FAMILY_DEMO.members"
          :relations="RURIK_FAMILY_DEMO.relations"
          :family-name="RURIK_FAMILY_DEMO.name"
          :root-member-id="RURIK_FAMILY_DEMO.rootMemberId"
          @select-member="() => {}"
        />

        <!-- Overlay gradient -->
        <div class="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-obsidian to-transparent pointer-events-none"></div>
      </div>

      <!-- Key Events Timeline -->
      <div class="mt-12 overflow-x-auto pb-4">
        <div class="flex gap-4 min-w-max">
          <div
            v-for="event in RURIK_STATS.keyEvents"
            :key="event.year"
            class="flex-shrink-0 px-4 py-3 bg-white/5 rounded-lg border border-white/10"
          >
            <span class="text-gold font-mono text-sm">{{ event.year }}</span>
            <span class="text-gray-400 text-sm ml-2">{{ event.event }}</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-12 text-center">
        <p class="text-gray-400 mb-6">
          Создайте своё семейное древо и сохраните историю своей семьи
        </p>
        <BaseButton size="lg" @click="handleCreateOwn">
          Создать своё древо
        </BaseButton>
      </div>
    </div>
  </section>
</template>
