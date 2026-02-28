<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FamilyTree from '@/components/tree/FamilyTree.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import { RURIK_FAMILY_DEMO, RURIK_STATS } from '@/data/demoRurikTree'
import { SIMPLE_FAMILY_DEMO, SIMPLE_FAMILY_STATS } from '@/data/demoSimpleFamily'
import { useRouter } from 'vue-router'
import { Plus, RefreshCw, Users, Crown } from 'lucide-vue-next'
import type { FamilyMember, FamilyRelation, RelationType } from '@/modules/family/domain/models'

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

// Generate unique ID
const generateId = () => `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Add new member
const addMember = () => {
  const newMember: FamilyMember = {
    id: generateId(),
    name: 'Новый родственник',
    birthDate: '',
    deathDate: undefined,
    biography: '',
    photos: [],
    videos: [],
    quotes: [],
    lifePath: [],
    relationship: '',
    gender: 'male',
    photoUrl: '',
  }
  localMembers.value.push(newMember)
}

// Reset to demo data
const resetDemo = () => {
  localMembers.value = JSON.parse(JSON.stringify(currentDemo.value.members))
  localRelations.value = JSON.parse(JSON.stringify(currentDemo.value.relations))
}

// Handle member selection (for demo, just log)
const handleSelectMember = (memberId: string) => {
  console.log('Selected member:', memberId)
}

// Handle add relation
const handleAddRelation = (data: { memberId: string; relationType: RelationType | 'child' | 'sibling'; gender?: 'male' | 'female' }) => {
  const newMember: FamilyMember = {
    id: generateId(),
    name: data.gender === 'male' ? 'Новый родственник' : 'Новая родственница',
    birthDate: '',
    deathDate: undefined,
    biography: '',
    photos: [],
    videos: [],
    quotes: [],
    lifePath: [],
    relationship: '',
    gender: data.gender || 'male',
    photoUrl: '',
  }
  localMembers.value.push(newMember)

  // Add relation
  const newRelation: FamilyRelation = {
    id: generateId(),
    fromMemberId: data.relationType === 'child' ? data.memberId : newMember.id,
    toMemberId: data.relationType === 'child' ? newMember.id : data.memberId,
    relationType: data.relationType === 'sibling' ? 'sibling' : data.relationType === 'child' ? 'parent' : data.relationType as RelationType,
    createdAt: new Date().toISOString()
  }
  localRelations.value.push(newRelation)
}

const handleCreateOwn = () => {
  router.push('/auth?mode=signup')
}
</script>

<template>
  <section class="py-20 md:py-32 px-4 bg-obsidian relative overflow-hidden">
    <!-- Background decoration -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/[0.03] rounded-full"></div>
      <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/[0.02] rounded-full"></div>
    </div>

    <div class="max-w-7xl mx-auto relative">
      <!-- Header -->
      <div class="text-center mb-12">
        <span class="text-gold text-sm tracking-widest uppercase font-bold mb-4 block">
          Попробуйте сами
        </span>
        <h2 class="text-3xl md:text-5xl font-serif text-silk mb-6">
          Создайте такое же древо своей семьи
        </h2>
        <p class="text-xl text-gray-400 max-w-2xl mx-auto mb-4">
          Нажимайте на + чтобы добавить родственников, перетаскивайте карточки!
        </p>
        <p class="text-sm text-gold/70 max-w-xl mx-auto mb-8">
          Это демо-режим. После перезагрузки страницы изменения сбросятся.
          <span class="text-gold">В личном кабинете изменения сохраняются навсегда!</span>
        </p>

        <!-- Tree Mode Switcher -->
        <div class="flex justify-center gap-2 mb-8">
          <button
            @click="treeMode = 'simple'"
            class="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            :class="treeMode === 'simple'
              ? 'bg-gold text-obsidian font-bold'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-gold hover:border-gold/30'"
          >
            <Users class="w-4 h-4" />
            Простая семья
          </button>
          <button
            @click="treeMode = 'rurik'"
            class="flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-all"
            :class="treeMode === 'rurik'
              ? 'bg-gold text-obsidian font-bold'
              : 'bg-white/5 border border-white/10 text-gray-400 hover:text-gold hover:border-gold/30'"
          >
            <Crown class="w-4 h-4" />
            Рюриковичи и Романовы
          </button>
        </div>

        <!-- Stats -->
        <div class="flex flex-wrap justify-center gap-8 mb-8">
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-serif text-gold">{{ currentStats.generations }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">поколений</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-serif text-gold">{{ currentStats.totalYears }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">лет истории</div>
          </div>
          <div class="text-center">
            <div class="text-3xl md:text-4xl font-serif text-gold">{{ localMembers.length }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest mt-1">человек в древе</div>
          </div>
        </div>
      </div>

      <!-- Demo Controls -->
      <div class="flex justify-center gap-4 mb-6">
        <button
          @click="addMember"
          class="flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/30 rounded-full text-gold text-sm hover:bg-gold/20 transition-colors"
        >
          <Plus class="w-4 h-4" />
          Добавить
        </button>
        <button
          @click="resetDemo"
          class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-gray-400 text-sm hover:text-gold hover:border-gold/30 transition-colors"
        >
          <RefreshCw class="w-4 h-4" />
          Сбросить
        </button>
      </div>

      <!-- Tree Container -->
      <div class="h-[500px] md:h-[600px] rounded-3xl border border-white/10 overflow-hidden bg-charcoal/50 relative">
        <FamilyTree
          :key="treeMode"
          :members="localMembers"
          :relations="localRelations"
          :family-name="currentDemo.name"
          :root-member-id="currentDemo.rootMemberId"
          @select-member="handleSelectMember"
          @add-relation="handleAddRelation"
          @add-member="addMember"
        />
      </div>

      <!-- Key Events Timeline -->
      <div class="mt-12 overflow-x-auto pb-4">
        <div class="flex gap-4 min-w-max">
          <div
            v-for="event in currentStats.keyEvents"
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
          Понравилось? Создайте свой семейный архив и сохраняйте историю навсегда
        </p>
        <BaseButton size="lg" @click="handleCreateOwn">
          Создать семейный архив
        </BaseButton>
      </div>
    </div>
  </section>
</template>
