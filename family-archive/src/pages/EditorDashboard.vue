<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import PricingModal from '@/components/ui/PricingModal.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import MobileMemberList from '@/components/editor/MobileMemberList.vue'
import MobileMemberEditor from '@/components/editor/MobileMemberEditor.vue'
import { useMemoryStore } from '@/stores/memoryStore'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useSubscription } from '@/composables/useSubscription'
import { useAnalytics } from '@/composables/useAnalytics'
import { createFamilyArchive, saveFamilyData, fetchUserFamilies } from '@/services/memoryService'
import { useRouter } from 'vue-router'

const store = useMemoryStore()
const authStore = useAuthStore()
const subStore = useSubscriptionStore()
const subscription = useSubscription()
const router = useRouter()
const { trackArchiveCreation, trackUpgrade } = useAnalytics()

const isCreating = ref(false)
const newFamilyName = ref('')
const userFamilies = ref<any[]>([])
const isSaving = ref(false)
const showPricing = ref(false)

// Mobile State
const mobileView = ref<'list' | 'editor'>('list')

// Load user's existing families and subscription on mount
onMounted(async () => {
  if (authStore.userId) {
    await Promise.all([
      refreshFamilies(),
      subStore.fetchSubscription()
    ])
  }
})

const refreshFamilies = async () => {
  if (authStore.userId) {
    userFamilies.value = await fetchUserFamilies(authStore.userId)
  }
}

const startNewArchive = async () => {
  if (!newFamilyName.value.trim()) return
  
  // Check subscription limit
  if (!subscription.canAddFamily(userFamilies.value.length)) {
    showPricing.value = true
    return
  }
  
  isCreating.value = true
  const newFamily = await createFamilyArchive(newFamilyName.value, authStore.userId || undefined)
  
  newFamily.members.push({
    id: crypto.randomUUID(), 
    name: 'Главный герой', 
    birthDate: '', 
    biography: '', 
    photos: [], 
    quotes: [], 
    photoUrl: ''
  })
  
  store.setFamily(newFamily)
  store.toggleEditing()
  isCreating.value = false
  newFamilyName.value = ''
  await refreshFamilies()
  trackArchiveCreation(newFamily.id)
}

const loadFamily = (family: any) => {
  store.setFamily(family)
  store.toggleEditing()
  mobileView.value = 'list' // Default to list on load
}

const deleteArchive = async (e: Event, familyId: string, slug: string) => {
  e.stopPropagation()
  if (!confirm('Вы уверены? Весь архив будет удален безвозвратно.')) return
  
  await store.removeFamily(slug)
  await refreshFamilies()
}

const saveChanges = async () => {
  if (!authStore.userId) {
    alert('Ошибка: Пользователь не авторизован.')
    return
  }

  if (store.currentFamily) {
    isSaving.value = true
    try {
      const success = await saveFamilyData(store.currentFamily, authStore.userId)
      if (success) {
        alert('Сохранено успешно!')
        await refreshFamilies()
      } else {
        alert('Ошибка при сохранении.')
      }
    } catch (e) {
      console.error(e)
      alert('Ошибка при сохранении.')
    } finally {
      isSaving.value = false
    }
  }
}

const handleLogout = async () => {
  await authStore.signOut()
  store.resetStore()
  router.push('/')
}

// Member Management
const addMember = () => {
  store.addMember()
  mobileView.value = 'editor'
}

const selectMember = (id: string) => {
  store.setActiveMember(id)
}

const deleteActiveMember = async () => {
  if (!store.activeMember) return
  if (!confirm(`Удалить ${store.activeMember.name}?`)) return
  
  await store.removeMember(store.activeMember.id)
}

// Mobile Specific Handlers
const handleMobileSelect = (id: string) => {
  store.setActiveMember(id)
  mobileView.value = 'editor'
}

const handleMobileDelete = async (id: string) => {
  await store.removeMember(id)
  mobileView.value = 'list'
}

const handleMobileBack = () => {
  mobileView.value = 'list'
}

const previewLink = computed(() => {
  if (store.currentFamily) {
    return `/${store.currentFamily.id}`
  }
  return '#'
})

const planName = computed(() => {
  switch (subStore.tier) {
    case 'guardian': return 'Хранитель'
    case 'legacy': return 'Наследие'
    default: return 'Базовый'
  }
})
</script>

<template>
  <MainLayout>
    <!-- Pricing Modal -->
    <PricingModal :isOpen="showPricing" @close="showPricing = false" />

    <!-- 
      DESKTOP LAYOUT (Original) 
      Hidden on mobile (md:flex)
    -->
    <div class="hidden md:flex min-h-screen">
      
      <!-- Sidebar -->
      <aside v-if="store.isEditing && store.currentFamily" class="w-96 bg-charcoal/50 border-r border-white/5 flex flex-col h-screen sticky top-0">
        <!-- Members List -->
        <div class="p-4 border-b border-white/5 bg-obsidian/30">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider">Члены семьи</h3>
            <button @click="addMember" class="text-gold hover:text-white text-xs">+ Добавить</button>
          </div>
          
          <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <div 
              v-for="member in store.members" 
              :key="member.id"
              class="flex-shrink-0 cursor-pointer"
              @click="selectMember(member.id)"
            >
              <div 
                class="w-10 h-10 rounded-full border-2 overflow-hidden"
                :class="store.activeMemberId === member.id ? 'border-gold' : 'border-white/10 hover:border-white/30'"
              >
                <img 
                  v-if="member.photoUrl" 
                  :src="member.photoUrl" 
                  class="w-full h-full object-cover"
                >
                <div v-else class="w-full h-full bg-white/10 flex items-center justify-center text-xs text-gray-400">
                  {{ member.name[0] || '?' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Editor Form -->
        <div class="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <EditorSidebar @save="saveChanges" />
          
          <div class="mt-8 pt-6 border-t border-white/5">
            <button 
              v-if="store.members.length > 1"
              @click="deleteActiveMember"
              class="text-red-400 hover:text-red-300 text-sm flex items-center gap-2"
            >
              🗑️ Удалить этого члена семьи
            </button>
          </div>
        </div>
      </aside>

      <!-- Main Content (Desktop) -->
      <main class="flex-1 p-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 class="text-2xl font-serif text-silk">Панель управления</h1>
            <div class="flex items-center gap-3 text-sm mt-1">
              <p class="text-gray-400">
                Вы вошли как <span class="text-gold">{{ authStore.userEmail }}</span>
              </p>
              <span class="text-gray-600">|</span>
              <div class="flex items-center gap-2">
                <span class="text-gray-400">Тариф: <span :class="subStore.isPremium ? 'text-gold' : 'text-gray-300'">{{ planName }}</span></span>
                <button 
                  v-if="!subStore.isPremium"
                  class="text-xs px-2 py-0.5 bg-gold/10 border border-gold/30 text-gold rounded hover:bg-gold/20 transition-colors"
                  @click="showPricing = true"
                >
                  Улучшить
                </button>
              </div>
            </div>
          </div>
          <BaseButton variant="ghost" size="sm" @click="handleLogout">
            Выйти
          </BaseButton>
        </div>

        <!-- No Archive State (Desktop) -->
        <div v-if="!store.currentFamily" class="max-w-2xl mx-auto mt-10">
          
          <!-- Existing Archives -->
          <div v-if="userFamilies.length > 0" class="mb-10">
            <h2 class="text-xl font-serif text-silk mb-4">Ваши архивы</h2>
            <div class="grid gap-4">
              <BaseCard 
                v-for="family in userFamilies" 
                :key="family.id"
                class="p-6 cursor-pointer group relative overflow-hidden"
                @click="loadFamily(family)"
              >
                <div class="flex items-center justify-between relative z-10">
                  <div>
                    <h3 class="text-lg text-silk">{{ family.familyName }}</h3>
                    <p class="text-sm text-gray-400">{{ family.members.length }} {{ family.members.length === 1 ? 'человек' : 'людей' }}</p>
                  </div>
                  <div class="flex items-center gap-4">
                    <button 
                      @click="(e) => deleteArchive(e, family.id, family.id)"
                      class="p-2 text-gray-500 hover:text-red-400 transition-colors"
                      title="Удалить архив"
                    >
                      🗑️
                    </button>
                    <span class="text-gold">Редактировать →</span>
                  </div>
                </div>
              </BaseCard>
            </div>
          </div>

          <!-- Create New -->
          <BaseCard class="p-10 text-center">
            <div class="text-6xl mb-6">📜</div>
            <h2 class="text-3xl font-serif text-silk mb-4">Создать новый архив</h2>
            
            <div v-if="subscription.canAddFamily(userFamilies.length)" class="flex flex-col gap-4 max-w-md mx-auto">
              <input
                v-model="newFamilyName"
                type="text"
                placeholder="Название семьи"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors"
                @keyup.enter="startNewArchive"
              />
              <BaseButton 
                full
                :disabled="!newFamilyName.trim() || isCreating"
                @click="startNewArchive"
              >
                {{ isCreating ? 'Создаём...' : 'Создать архив' }}
              </BaseButton>
            </div>
            
            <div v-else class="max-w-md mx-auto">
              <p class="text-gray-400 mb-6">
                Вы достигли лимита бесплатных архивов (1). <br/>
                Обновите тариф, чтобы создать больше.
              </p>
              <BaseButton full variant="primary" @click="showPricing = true">
                Стать Хранителем (Безлимит)
              </BaseButton>
            </div>

          </BaseCard>
        </div>

        <!-- Editor View (Desktop) -->
        <div v-else>
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-serif text-silk">{{ store.familyName }}</h2>
              <p class="text-gray-400 text-sm mt-1">
                Просмотр: <router-link :to="previewLink" class="text-gold hover:underline">{{ previewLink }}</router-link>
              </p>
            </div>
            <div class="flex gap-3">
              <BaseButton variant="ghost" @click="store.resetStore()">
                ← Назад
              </BaseButton>
              <BaseButton variant="secondary" @click="store.toggleEditing">
                {{ store.isEditing ? 'Закрыть редактор' : 'Редактировать' }}
              </BaseButton>
              <BaseButton v-if="store.isEditing" @click="saveChanges" :disabled="isSaving">
                {{ isSaving ? 'Сохраняем...' : 'Сохранить' }}
              </BaseButton>
            </div>
          </div>

          <!-- Active Member Preview -->
          <EditorPreview v-if="store.activeMember" :key="store.activeMember.id" />
          <div v-else class="text-center py-20 text-gray-500">
            Выберите члена семьи слева или добавьте нового
          </div>
        </div>
      </main>
    </div>

    <!-- 
      MOBILE LAYOUT (New)
      Visible only on mobile (md:hidden)
    -->
    <div class="md:hidden h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      
      <!-- No Family Selected State (Mobile) -->
      <div v-if="!store.currentFamily" class="p-4 overflow-y-auto">
        <div class="flex items-center justify-between mb-6">
           <h1 class="text-xl font-serif text-silk">Ваши архивы</h1>
           <button @click="handleLogout" class="text-xs text-gray-400">Выйти</button>
        </div>

        <div v-if="userFamilies.length > 0" class="space-y-4 mb-8">
          <div 
            v-for="family in userFamilies" 
            :key="family.id"
            class="bg-white/5 p-4 rounded-lg border border-white/5 active:bg-white/10"
            @click="loadFamily(family)"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="text-lg text-silk font-serif">{{ family.familyName }}</h3>
                <p class="text-xs text-gray-400 mt-1">{{ family.members.length }} чел.</p>
              </div>
              <span class="text-gold text-sm">→</span>
            </div>
          </div>
        </div>

        <div class="bg-obsidian/30 p-6 rounded-lg border border-white/10 text-center">
          <h3 class="text-silk mb-4 font-serif">Новый архив</h3>
           <input
              v-model="newFamilyName"
              type="text"
              placeholder="Название семьи"
              class="w-full px-4 py-3 mb-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50"
            />
            <BaseButton 
              full
              :disabled="!newFamilyName.trim() || isCreating"
              @click="startNewArchive"
            >
              Создать
            </BaseButton>
        </div>
      </div>

      <!-- Family Editor (Mobile) -->
      <div v-else class="h-full flex flex-col">
        
        <!-- Mobile Header (when in List view) -->
        <div v-if="mobileView === 'list'" class="p-4 bg-charcoal border-b border-white/10 flex justify-between items-center shrink-0">
          <button @click="store.resetStore()" class="text-gray-400 text-sm">← Архивы</button>
          <span class="text-silk font-serif truncate max-w-[150px]">{{ store.familyName }}</span>
          <button @click="saveChanges" :disabled="isSaving" class="text-gold text-sm font-bold">
            {{ isSaving ? '...' : 'Сохр.' }}
          </button>
        </div>

        <!-- List View -->
        <MobileMemberList 
          v-if="mobileView === 'list'"
          @select="handleMobileSelect"
          @add="addMember"
        />

        <!-- Editor View -->
        <MobileMemberEditor 
          v-else-if="mobileView === 'editor' && store.activeMemberId"
          :member-id="store.activeMemberId"
          @back="handleMobileBack"
          @save="saveChanges"
          @delete="handleMobileDelete"
        />

      </div>
    </div>
  </MainLayout>
</template>