<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import FamilyTree from '@/components/tree/FamilyTree.vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { Copy, Check, User, ArrowLeft } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useMemoryStore()

const familyId = computed(() => route.params.id as string)
const isLoading = ref(true)
const notFound = ref(false)
const shareCopied = ref(false)

// Share functionality
const shareUrl = computed(() => {
  if (typeof window !== 'undefined') {
    return window.location.href
  }
  return ''
})

const copyShareLink = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    shareCopied.value = true
    setTimeout(() => {
      shareCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Navigate to member profile
const handleSelectMember = (memberId: string) => {
  router.push({
    path: `/archive/${familyId.value}`,
    query: { member: memberId }
  })
}

// Navigate back to archive
const goToArchive = () => {
  router.push(`/archive/${familyId.value}`)
}

// Mock data for demo
const MOCK_FAMILY_DATA = {
  id: 'smith-family',
  name: 'Семья Смирновых',
  heroImage: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  rootMemberId: 'm1',
  relations: [
    { id: 'r1', fromMemberId: 'm1', toMemberId: 'm2', relationType: 'spouse' as const, createdAt: '' },
    { id: 'r2', fromMemberId: 'm1', toMemberId: 'm3', relationType: 'parent' as const, createdAt: '' },
    { id: 'r3', fromMemberId: 'm1', toMemberId: 'm4', relationType: 'parent' as const, createdAt: '' },
    { id: 'r4', fromMemberId: 'm3', toMemberId: 'm4', relationType: 'sibling' as const, createdAt: '' },
  ],
  members: [
    {
      id: 'm1',
      name: 'Александр Смирнов',
      displayRole: 'Отец',
      gender: 'male' as const,
      generation: 1,
      birthDate: '1945',
      deathDate: '2018',
      biography: 'Инженер-конструктор',
      photoUrl: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?q=80&w=1000&auto=format&fit=crop',
      photos: [],
      quotes: []
    },
    {
      id: 'm2',
      name: 'Елена Смирнова',
      displayRole: 'Мать',
      gender: 'female' as const,
      generation: 1,
      birthDate: '1948',
      biography: 'Учительница литературы',
      photoUrl: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?q=80&w=1000&auto=format&fit=crop',
      photos: [],
      quotes: []
    },
    {
      id: 'm3',
      name: 'Дмитрий Смирнов',
      displayRole: 'Сын',
      gender: 'male' as const,
      generation: 2,
      birthDate: '1970',
      biography: 'Программист',
      photoUrl: '',
      photos: [],
      quotes: []
    },
    {
      id: 'm4',
      name: 'Анна Смирнова',
      displayRole: 'Дочь',
      gender: 'female' as const,
      generation: 2,
      birthDate: '1975',
      biography: 'Врач',
      photoUrl: '',
      photos: [],
      quotes: []
    }
  ]
}

onMounted(async () => {
  isLoading.value = true

  // Static route for examples/demo
  if (familyId.value === 'smith-family' || familyId.value === 'example') {
    setTimeout(() => {
      store.setFamily(MOCK_FAMILY_DATA as any)
      notFound.value = false
      isLoading.value = false
    }, 100)
    return
  }

  const data = await store.loadFamilyBySlug(familyId.value)

  if (data) {
    notFound.value = false
  } else {
    notFound.value = true
  }

  isLoading.value = false
})
</script>

<template>
  <MainLayout>
    <!-- Loading State -->
    <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-400">Загружаем семейное древо...</p>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else-if="notFound" class="min-h-screen flex items-center justify-center">
      <BaseCard class="p-12 text-center max-w-md">
        <div class="text-6xl mb-6">🕊️</div>
        <h2 class="text-2xl font-serif text-silk mb-4">Древо не найдено</h2>
        <p class="text-gray-400 mb-6">Семейный архив "{{ familyId }}" еще не создан.</p>
        <router-link to="/" class="text-gold hover:underline">← Вернуться на главную</router-link>
      </BaseCard>
    </div>

    <!-- Empty Family State -->
    <div v-else-if="!store.members || store.members.length === 0" class="min-h-screen flex items-center justify-center">
      <BaseCard class="p-12 text-center max-w-md">
        <div class="text-6xl mb-6">👥</div>
        <h2 class="text-2xl font-serif text-silk mb-4">Семья найдена</h2>
        <p class="text-gray-400 mb-6">Но в этом архиве пока нет добавленных людей.</p>
        <router-link to="/" class="text-gold hover:underline">← Вернуться на главную</router-link>
      </BaseCard>
    </div>

    <!-- Main Content -->
    <div v-else class="min-h-screen flex flex-col">
      <!-- Header -->
      <div class="sticky top-0 z-50 bg-obsidian/95 border-b border-white/10 py-4">
        <div class="container mx-auto px-4 flex items-center justify-between gap-4">
          <!-- Back & Title -->
          <div class="flex items-center gap-4">
            <button
              @click="goToArchive"
              class="flex items-center gap-2 text-gray-400 hover:text-gold transition-colors"
            >
              <ArrowLeft class="w-5 h-5" />
              <span class="hidden sm:inline">К профилям</span>
            </button>
            <div class="h-6 w-px bg-white/10"></div>
            <h1 class="text-lg md:text-xl font-serif text-silk">
              {{ store.familyName || 'Семейное древо' }}
            </h1>
          </div>

          <!-- Share Button -->
          <button
            @click="copyShareLink"
            class="flex items-center gap-2 px-4 py-2 rounded-full transition-all border"
            :class="shareCopied
              ? 'bg-green-500/20 border-green-500/50 text-green-400'
              : 'bg-gold/10 border-gold/30 text-gold hover:bg-gold/20'"
          >
            <Check v-if="shareCopied" class="w-4 h-4" />
            <Copy v-else class="w-4 h-4" />
            <span class="hidden sm:inline text-sm">
              {{ shareCopied ? 'Скопировано!' : 'Скопировать ссылку' }}
            </span>
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="bg-charcoal/50 border-b border-white/5 py-3">
        <div class="container mx-auto px-4 flex justify-center gap-8">
          <div class="text-center">
            <div class="text-xl font-serif text-gold">{{ store.members.length }}</div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">человек</div>
          </div>
          <div class="text-center">
            <div class="text-xl font-serif text-gold">
              {{ new Set(store.relations?.filter(r => r.relationType === 'parent').map(r => r.toMemberId)).size || 0 }}
            </div>
            <div class="text-xs text-gray-500 uppercase tracking-widest">поколений</div>
          </div>
        </div>
      </div>

      <!-- Tree Container -->
      <div class="flex-1 p-4 md:p-8">
        <div class="h-[60vh] md:h-[75vh] rounded-3xl border border-white/10 overflow-hidden bg-charcoal/30">
          <FamilyTree
            :members="store.members"
            :relations="store.relations || []"
            :family-name="store.familyName || 'Семейное древо'"
            :root-member-id="store.currentFamily?.rootMemberId"
            :selectable="true"
            @select-member="handleSelectMember"
          />
        </div>
      </div>

      <!-- Help Text -->
      <div class="text-center py-4 text-gray-500 text-sm">
        <User class="w-4 h-4 inline-block mr-2" />
        Нажмите на карточку, чтобы посмотреть профиль человека
      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
</style>
