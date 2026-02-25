<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { IonPage, IonContent } from '@ionic/vue';
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import PricingModal from '@/shared/ui/PricingModal.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import MobileMemberList from '@/components/editor/MobileMemberList.vue'
import MobileMemberEditor from '@/components/editor/MobileMemberEditor.vue'
import Skeleton from '@/shared/ui/Skeleton.vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useSubscription } from '@/composables/useSubscription'
import { useAnalytics } from '@/composables/useAnalytics'
import { useRouter } from 'vue-router'

const store = useMemoryStore()
const authStore = useAuthStore()
const subStore = useSubscriptionStore()
const subscription = useSubscription()
const router = useRouter()
const { trackArchiveCreation, trackUpgrade, trackEvent } = useAnalytics()

const isCreating = ref(false)
const newFamilyName = ref('')
const isSaving = ref(false)
const showPricing = ref(false)
const isShowingMemberList = ref(false)

// Mobile State
const mobileView = ref<'list' | 'editor'>('list')

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
    await store.loadUserFamilies(authStore.userId)
  }
}

const startNewArchive = async () => {
  if (!newFamilyName.value.trim()) return
  
  if (!subscription.canAddFamily(store.userFamilies.length)) {
    showPricing.value = true
    return
  }
  
  isCreating.value = true
  const newFamily = await store.createArchive(newFamilyName.value, authStore.userId!)
  
  store.setFamily(newFamily)
  store.addMember()
  isShowingMemberList.value = true
  isCreating.value = false
  newFamilyName.value = ''
  await refreshFamilies()
  trackArchiveCreation(newFamily.id)
}

const loadFamily = (family: any) => {
  store.setFamily(family)
  isShowingMemberList.value = true
  mobileView.value = 'list'
}

const selectMemberForPreview = (id: string) => {
  store.setActiveMember(id)
  isShowingMemberList.value = false
}

const backToMemberList = () => {
  isShowingMemberList.value = true
  if (store.isEditing) {
    store.toggleEditing()
  }
}

const resetToArchives = () => {
  store.resetStore()
  isShowingMemberList.value = false
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
      const success = await store.saveCurrentFamily(authStore.userId)
      if (success) {
        alert('Сохранено успешно!')
        trackEvent('save_family', { 
          family_id: store.currentFamily.id,
          member_count: store.currentFamily.members.length
        })
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

const addMember = () => {
  if (store.isEditing) {
     store.toggleEditing()
  }
  isShowingMemberList.value = true
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
  <ion-page>
    <ion-content>
      <!-- Pricing Modal -->
      <PricingModal :isOpen="showPricing" @close="showPricing = false" />

      <!-- 
        DESKTOP LAYOUT (Original) 
        Hidden on mobile (md:flex)
      -->
      <div class="hidden md:flex min-h-screen bg-obsidian">
        
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
              <h1 class="text-2xl font-serif text-silk">Мои архивы</h1>
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
            <!-- Loading State -->
            <div v-if="store.isLoading" class="mb-10 space-y-4">
               <Skeleton className="h-7 w-48 mb-4" />
               <BaseCard v-for="i in 2" :key="i" class="p-6">
                  <div class="flex items-center justify-between">
                    <div class="space-y-3">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-24 bg-white/5" />
                    </div>
                    <Skeleton className="h-4 w-20 bg-white/5" />
                  </div>
               </BaseCard>
            </div>

            <!-- Existing Archives -->
            <div v-else-if="store.userFamilies.length > 0" class="mb-10">
              <h2 class="text-xl font-serif text-silk mb-4">Мои архивы</h2>
              <div class="grid gap-4">
                <BaseCard 
                  v-for="family in store.userFamilies" 
                  :key="family.id"
                  class="p-6 cursor-pointer group relative overflow-hidden"
                  @click="loadFamily(family)"
                >
                  <div class="flex items-center justify-between relative z-10">
                    <div>
                      <h3 class="text-lg text-silk">{{ family.name }}</h3>
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
                      <span class="text-gold">Смотреть →</span>
                    </div>
                  </div>
                </BaseCard>
              </div>
            </div>

            <!-- Create New -->
            <BaseCard class="p-10 text-center">
              <div class="text-6xl mb-6">📜</div>
              <h2 class="text-3xl font-serif text-silk mb-4">Введите название семьи еще одного архива и нажмите "Создать"</h2>
              
              <div v-if="subscription.canAddFamily(store.userFamilies.length)" class="flex flex-col gap-4 max-w-md mx-auto">
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
            </BaseCard>
          </div>

          <!-- Editor View (Desktop) -->
          <div v-else>
            <div class="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <div>
                <h2 class="text-2xl font-serif text-silk">{{ store.familyName }}</h2>
                <p class="text-gray-400 text-sm mt-1">
                  Просмотр: <router-link :to="previewLink" class="text-gold hover:underline">{{ previewLink }}</router-link>
                </p>
              </div>
              <div class="flex gap-3">
                <BaseButton variant="ghost" @click="isShowingMemberList ? resetToArchives() : backToMemberList()">
                  ← {{ isShowingMemberList ? 'К архивам' : 'Все люди' }}
                </BaseButton>
                <BaseButton v-if="!isShowingMemberList" variant="secondary" @click="store.toggleEditing">
                  {{ store.isEditing ? 'Закрыть редактор' : 'Редактировать' }}
                </BaseButton>
                <BaseButton v-if="store.isEditing" @click="saveChanges" :disabled="isSaving">
                  {{ isSaving ? 'Сохраняем...' : 'Сохранить' }}
                </BaseButton>
              </div>
            </div>

            <!-- Member List View -->
            <div v-if="isShowingMemberList">
               <div class="flex items-center justify-between mb-8">
                  <h3 class="text-xl font-serif text-silk">Члены семьи</h3>
                  <BaseButton size="sm" variant="ghost" @click="addMember" class="text-gold">
                    + Добавить человека
                  </BaseButton>
               </div>
               
               <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
                  <div 
                    v-for="member in store.members" 
                    :key="member.id"
                    @click="selectMemberForPreview(member.id)"
                    class="group cursor-pointer"
                  >
                     <div class="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-gold/50 transition-all mb-4 relative shadow-2xl">
                        <img v-if="member.photoUrl" :src="member.photoUrl" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                        <div v-else class="w-full h-full bg-white/5 flex items-center justify-center text-4xl text-gray-600 font-serif">
                          {{ member.name[0] || '?' }}
                        </div>
                        <div class="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                        <div class="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                           <span class="px-4 py-2 bg-gold text-charcoal text-[10px] font-bold uppercase tracking-[0.2em] rounded-full shadow-xl">
                             Смотреть
                           </span>
                        </div>
                     </div>
                     <h4 class="text-silk font-serif text-center group-hover:text-gold transition-colors text-lg">{{ member.name }}</h4>
                     <p class="text-[10px] uppercase tracking-widest text-gray-500 text-center mt-1 font-bold">{{ member.relationship || 'Член семьи' }}</p>
                  </div>
                  
                  <!-- Add Card -->
                  <button 
                    @click="addMember"
                    class="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/10 hover:border-gold/30 hover:bg-gold/5 transition-all flex flex-col items-center justify-center gap-4 group"
                  >
                     <div class="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-gold group-hover:scale-110 transition-all">
                        <span class="text-3xl">+</span>
                     </div>
                     <span class="text-[10px] text-gray-500 group-hover:text-gold transition-colors font-bold uppercase tracking-[0.2em]">Добавить</span>
                  </button>
               </div>
            </div>

            <!-- Active Member Preview / Editor -->
            <div v-else>
              <div v-if="!store.isEditing" class="mb-6 flex justify-center">
                 <BaseButton variant="primary" @click="store.toggleEditing" class="shadow-xl shadow-gold/10">
                   ✏️ Редактировать профиль
                 </BaseButton>
              </div>
              <EditorPreview v-if="store.activeMember" :key="store.activeMember.id" />
            </div>
          </div>
        </main>
      </div>

      <!-- 
        MOBILE LAYOUT
      -->
      <div class="md:hidden min-h-screen bg-obsidian flex flex-col">
        
        <!-- No Family Selected State (Mobile) -->
        <div v-if="!store.currentFamily" class="p-4 overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
             <h1 class="text-xl font-serif text-silk">Мои архивы</h1>
             <button @click="handleLogout" class="text-xs text-gray-400">Выйти</button>
          </div>

          <div v-if="store.userFamilies.length > 0" class="space-y-4 mb-8">
            <div 
              v-for="family in store.userFamilies" 
              :key="family.id"
              class="bg-white/5 p-4 rounded-lg border border-white/5 active:bg-white/10"
              @click="loadFamily(family)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg text-silk font-serif">{{ family.name }}</h3>
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
        <div v-else class="flex-1 flex flex-col">
          <div v-if="mobileView === 'list'" class="p-4 bg-charcoal border-b border-white/10 flex justify-between items-center">
            <button @click="store.resetStore()" class="text-gray-400 text-sm">← Архивы</button>
            <span class="text-silk font-serif truncate max-w-[150px]">{{ store.familyName }}</span>
            <button @click="saveChanges" :disabled="isSaving" class="text-gold text-sm font-bold">
              {{ isSaving ? '...' : 'Сохр.' }}
            </button>
          </div>

          <MobileMemberList 
            v-if="mobileView === 'list'"
            @select="handleMobileSelect"
            @add="addMember"
          />

          <MobileMemberEditor 
            v-else-if="mobileView === 'editor' && store.activeMemberId"
            :member-id="store.activeMemberId"
            @back="handleMobileBack"
            @save="saveChanges"
            @delete="handleMobileDelete"
          />
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>
