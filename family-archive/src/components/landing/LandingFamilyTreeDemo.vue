<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FamilyTree from '@/components/tree/FamilyTree.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { RURIK_FAMILY_DEMO, RURIK_STATS } from '@/data/demoRurikTree'
import { SIMPLE_FAMILY_DEMO, SIMPLE_FAMILY_STATS } from '@/data/demoSimpleFamily'
import { useRouter } from 'vue-router'
import { Users, Crown } from 'lucide-vue-next'
import type { FamilyMember, FamilyRelation } from '@/modules/family/domain/models'

const router = useRouter()

// Tree mode: 'rurik' or 'simple'
const treeMode = ref<'rurik' | 'simple'>('simple')

// Get current demo data based on mode
const currentDemo = computed(() => treeMode.value === 'rurik' ? RURIK_FAMILY_DEMO : SIMPLE_FAMILY_DEMO)
const currentStats = computed(() => treeMode.value === 'rurik' ? RURIK_STATS : SIMPLE_FAMILY_STATS)

// Local reactive state (resets on page reload)
const localMembers = ref<FamilyMember[]>(JSON.parse(JSON.stringify(currentDemo.value.members)))
const localRelations = ref<FamilyRelation[]>(JSON.parse(JSON.stringify(currentDemo.value.relations)))

// Watch for mode changes and reset data
watch(treeMode, () => {
  localMembers.value = JSON.parse(JSON.stringify(currentDemo.value.members))
  localRelations.value = JSON.parse(JSON.stringify(currentDemo.value.relations))
})

const handleCreateOwn = () => {
  router.push('/auth?mode=signup')
}
</script>

<template>
  <section class="tree-demo py-20 md:py-32 px-4 bg-obsidian relative overflow-hidden">
    <!-- Background decoration -->
    <div class="tree-demo__bg absolute inset-0 pointer-events-none overflow-hidden">
      <div class="tree-demo__bg-circle tree-demo__bg-circle--1 absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.03] rounded-full"></div>
      <div class="tree-demo__bg-circle tree-demo__bg-circle--2 absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/[0.02] rounded-full"></div>
    </div>

    <div class="tree-demo__container max-w-7xl mx-auto relative">
      <!-- Header -->
      <div class="tree-demo__header text-center mb-12">
        <span class="tree-demo__badge text-gold text-sm tracking-widest uppercase font-bold mb-4 block">
          Попробуйте сами
        </span>
        <h2 class="tree-demo__title text-3xl md:text-5xl font-serif text-silk mb-6">
          Создайте такое же древо своей семьи
        </h2>
        <p class="tree-demo__subtitle text-xl text-gray-400 max-w-2xl mx-auto mb-4">
          Перетаскивайте карточки, изучайте связи между родственниками!
        </p>
        <p class="tree-demo__hint text-sm text-gold/70 max-w-xl mx-auto mb-8">
          Это демо-режим. Выберите пример древа и попробуйте управлять им.
          <span class="tree-demo__hint-highlight text-gold">Создайте свой архив, чтобы добавлять родственников!</span>
        </p>

        <!-- Tree Mode Switcher -->
        <div class="tree-demo__switcher flex justify-center gap-2 mb-8">
          <button
            @click="treeMode = 'simple'"
            class="tree-demo__switcher-btn flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            :class="treeMode === 'simple'
              ? 'tree-demo__switcher-btn--active bg-gold text-obsidian font-bold'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-gold hover:border-gold/30'"
          >
            <Users class="w-4 h-4" />
            Простая семья
          </button>
          <button
            @click="treeMode = 'rurik'"
            class="tree-demo__switcher-btn flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            :class="treeMode === 'rurik'
              ? 'tree-demo__switcher-btn--active bg-gold text-obsidian font-bold'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-gold hover:border-gold/30'"
          >
            <Crown class="w-4 h-4" />
            Рюриковичи и Романовы
          </button>
        </div>

        <!-- Stats -->
        <div class="tree-demo__stats flex flex-wrap justify-center gap-8 mb-8">
          <div class="tree-demo__stat text-center">
            <div class="tree-demo__stat-value text-3xl md:text-4xl font-serif text-gold">{{ currentStats.generations }}</div>
            <div class="tree-demo__stat-label text-xs text-gray-500 uppercase tracking-widest mt-1">поколений</div>
          </div>
          <div class="tree-demo__stat text-center">
            <div class="tree-demo__stat-value text-3xl md:text-4xl font-serif text-gold">{{ currentStats.totalYears }}</div>
            <div class="tree-demo__stat-label text-xs text-gray-500 uppercase tracking-widest mt-1">лет истории</div>
          </div>
          <div class="tree-demo__stat text-center">
            <div class="tree-demo__stat-value text-3xl md:text-4xl font-serif text-gold">{{ localMembers.length }}</div>
            <div class="tree-demo__stat-label text-xs text-gray-500 uppercase tracking-widest mt-1">человек в древе</div>
          </div>
        </div>
      </div>

      <!-- Tree Container -->
      <div class="tree-demo__canvas h-[500px] md:h-[600px] rounded-3xl border border-white/10 overflow-hidden bg-charcoal/50 relative">
        <FamilyTree
          :key="treeMode"
          :members="localMembers"
          :relations="localRelations"
          :family-name="currentDemo.name"
          :root-member-id="currentDemo.rootMemberId"
          :readonly="true"
        />
      </div>

      <!-- Key Events Timeline -->
      <div class="tree-demo__timeline mt-12 overflow-x-auto pb-4">
        <div class="tree-demo__timeline-inner flex gap-4 min-w-max">
          <div
            v-for="event in currentStats.keyEvents"
            :key="event.year"
            class="tree-demo__event flex-shrink-0 px-4 py-3 bg-white/5 rounded-lg border border-white/10"
          >
            <span class="tree-demo__event-year text-gold font-mono text-sm">{{ event.year }}</span>
            <span class="tree-demo__event-text text-gray-400 text-sm ml-2">{{ event.event }}</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="tree-demo__cta mt-12 text-center">
        <p class="tree-demo__cta-text text-gray-400 mb-6">
          Понравилось? Создайте свой семейный архив и сохраняйте историю навсегда
        </p>
        <BaseButton size="lg" @click="handleCreateOwn">
          Создать семейный архив
        </BaseButton>
      </div>
    </div>
  </section>
</template>
