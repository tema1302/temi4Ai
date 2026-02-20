<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import PricingModal from '@/shared/ui/PricingModal.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import MobileMemberList from '@/components/editor/MobileMemberList.vue'
import MobileMemberEditor from '@/components/editor/MobileMemberEditor.vue'
import ViewToggle from '@/components/shared/ViewToggle.vue'
import FamilyTree from '@/components/tree/FamilyTree.vue'
import AssignRoleModal from '@/components/tree/AssignRoleModal.vue'
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

// Assign role modal
const showAssignModal = ref(false)
const assignTargetMemberId = ref<string | null>(null)

// Family name editing
const isEditingFamilyName = ref(false)
const editingFamilyName = ref('')

const startEditFamilyName = () => {
  editingFamilyName.value = store.familyName
  isEditingFamilyName.value = true
}

const saveFamilyName = async () => {
  if (editingFamilyName.value.trim()) {
    store.updateFamilyName(editingFamilyName.value.trim())
    // Сохраняем изменения на сервере
    const authStore = useAuthStore()
    if (authStore.user?.id && store.currentFamily) {
      await store.saveCurrentFamily(authStore.user.id)
    }
  }
  isEditingFamilyName.value = false
}

const cancelEditFamilyName = () => {
  isEditingFamilyName.value = false
}

// Mobile State
const mobileView = ref<'list' | 'editor'>('list')

onMounted(async () => {
  await refreshFamilies()
})

const refreshFamilies = async () => {
  if (authStore.userId) {
    await store.loadUserFamilies(authStore.userId)
  }
}

const startNewArchive = async () => {
  if (!newFamilyName.value.trim()) return
  
  // Check subscription limit
  if (!subscription.canAddFamily(store.userFamilies.length)) {
    showPricing.value = true
    return
  }
  
  isCreating.value = true
  const newFamily = await store.createArchive(newFamilyName.value, authStore.userId!)
  
  store.setFamily(newFamily)
  store.addMember() // Add default member
  isCreating.value = false
  newFamilyName.value = ''
  
  // Редирект на онбординг вместо редактора
  router.push(`/archive/${newFamily.id}/onboarding`)
  
  await refreshFamilies()
  trackArchiveCreation(newFamily.id)
}

const loadFamily = (family: any) => {
  // Ensure we have all fields from the database version
  store.setFamily(family)
  isShowingMemberList.value = true
  mobileView.value = 'list' // Default to list on load
}

const selectMemberForPreview = (id: string) => {
  store.setActiveMember(id)
  isShowingMemberList.value = false
  if (!store.isEditing) store.toggleEditing() // Default to editing
}

const backToMemberList = () => {
  isShowingMemberList.value = true
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
        trackEvent('save_family', {
          family_id: store.currentFamily.id,
          member_count: store.currentFamily.members.length
        })
        await refreshFamilies()
        // Просто обновляем список, без редиректа
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

// Tree View Handlers
const handleTreeMemberSelect = (memberId: string) => {
  // Если есть ожидаемая связь - показываем модалку подтверждения
  if (store.pendingRelation) {
    showRelationConfirm(memberId)
    return
  }

  store.setActiveMember(memberId)
  // На мобильной версии переключаем на редактор
  mobileView.value = 'editor'
  if (!store.isEditing) store.toggleEditing()
}

// Обработчик назначения на древе
const handleAssignOnTree = (memberId: string) => {
  store.pendingRelation = {
    memberId,
    suggestedRole: 'parent'
  }
  // Переключаем на режим древа
  store.setViewMode('tree')
  // На мобильной версии переключаем на список (где показывается древо)
  mobileView.value = 'list'
}

// Подтверждение связи - показываем модальное окно
const showRelationConfirm = (targetMemberId: string) => {
  if (!store.pendingRelation) return

  const sourceMember = store.members.find(m => m.id === store.pendingRelation!.memberId)
  const targetMember = store.members.find(m => m.id === targetMemberId)

  if (!sourceMember || !targetMember) {
    store.pendingRelation = null
    return
  }

  // Сохраняем target ID и показываем модалку
  assignTargetMemberId.value = targetMemberId
  showAssignModal.value = true
}

// Обработка подтверждения из модалки
const handleRelationConfirm = (relationType: 'parent' | 'spouse' | 'sibling' | 'child') => {
  if (!store.pendingRelation || !assignTargetMemberId.value) return

  const sourceId = store.pendingRelation.memberId
  const targetId = assignTargetMemberId.value

  // Если выбран "ребёнок", инвертируем направление связи
  if (relationType === 'child') {
    store.addRelation({
      fromMemberId: targetId,
      toMemberId: sourceId,
      relationType: 'parent'
    })
  } else {
    store.addRelation({
      fromMemberId: sourceId,
      toMemberId: targetId,
      relationType
    })
  }

  // Закрываем модалку и сбрасываем состояние
  showAssignModal.value = false
  assignTargetMemberId.value = null
  store.pendingRelation = null

  // Возвращаемся к карточкам и редактору
  store.setViewMode('cards')
  mobileView.value = 'editor'
}

// Отмена назначения
const handleRelationCancel = () => {
  showAssignModal.value = false
  assignTargetMemberId.value = null
  store.pendingRelation = null
}

const handleTreeAddRelation = (data: { memberId: string; relationType: string }) => {
  // Create new member with relation
  const newMember = store.addMemberWithRelation(
    data.memberId,
    data.relationType as 'parent' | 'spouse' | 'sibling',
    { name: 'Новый родственник' }
  )
  if (newMember) {
    mobileView.value = 'editor'
    if (!store.isEditing) store.toggleEditing()
  }
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
  <MainLayout :fullHeight="true">
    <!-- Pricing Modal -->
    <PricingModal :isOpen="showPricing" @close="showPricing = false" />

    <!-- 
      DESKTOP LAYOUT (Original) 
      Hidden on mobile (md:flex)
    -->
    <div class="hidden md:flex h-full">
      
      <!-- Left Sidebar (Always visible when archive is open) -->
      <aside v-if="store.currentFamily" class="w-20 bg-charcoal border-r border-white/5 flex flex-col h-full sticky top-0 overflow-y-auto overflow-x-hidden items-center py-6 gap-6 scrollbar-thin">
        <div 
          v-for="member in store.members" 
          :key="member.id"
          class="flex-shrink-0 cursor-pointer relative group"
          @click="selectMemberForPreview(member.id)"
        >
          <div 
            class="w-12 h-12 rounded-full border-2 overflow-hidden transition-all duration-300"
            :class="store.activeMemberId === member.id ? 'border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-white/10 hover:border-gold/50'"
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
          <div class="absolute left-16 bg-black/80 text-silk text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {{ member.name }}
          </div>
        </div>
        
        <button 
          @click="addMember" 
          class="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold transition-all"
          title="Добавить члена семьи"
        >
          <span class="text-xl">+</span>
        </button>
      </aside>

      <!-- Main Content (Desktop) -->
      <main class="flex-1 overflow-y-auto p-8 scrollbar-thin">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <div class="flex items-center gap-3">
              <span class="text-gray-400 text-2xl font-serif">Архив:</span>
              <!-- Edit mode -->
              <input
                v-if="isEditingFamilyName"
                v-model="editingFamilyName"
                @keyup.enter="saveFamilyName"
                @keyup.escape="cancelEditFamilyName"
                @blur="saveFamilyName"
                ref="familyNameInput"
                type="text"
                class="text-2xl font-serif text-silk bg-transparent border-b-2 border-gold focus:outline-none px-1"
                placeholder="Название семьи"
              />
              <!-- View mode -->
              <h1
                v-else
                @click="startEditFamilyName"
                class="text-2xl font-serif text-silk cursor-pointer hover:text-gold transition-colors group"
                title="Нажмите для редактирования"
              >
                {{ store.familyName || 'Без названия' }}
                <span class="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">✏️</span>
              </h1>
            </div>
            <div class="flex items-center gap-3 text-sm mt-1">
              <p class="text-gray-400">
                Пользователь: <span class="text-gold">{{ authStore.userEmail }}</span>
              </p>
              <span class="text-gray-600">|</span>
              <p class="text-gray-400">Тариф: <span :class="subStore.isPremium ? 'text-gold' : 'text-gray-300'">{{ planName }}</span></p>
            </div>
          </div>
          <div class="flex gap-4">
             <BaseButton v-if="store.currentFamily" variant="ghost" size="sm" @click="resetToArchives">
               ← К моим архивам
             </BaseButton>
          </div>
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
            <h2 class="text-3xl font-serif text-silk mb-4">Создать новый архив</h2>
            
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

        <!-- Editor/Preview View (Desktop) -->
        <div v-else-if="!isShowingMemberList">
          <div class="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <div>
              <h2 class="text-xl font-serif text-silk">
                {{ store.isEditing ? 'Редактирование:' : 'Предпросмотр:' }} 
                <span class="text-gold">{{ store.activeMember?.name }}</span>
              </h2>
              <p class="text-gray-400 text-sm mt-1">
                Публичная ссылка: <router-link :to="previewLink" class="text-gold hover:underline" target="_blank">{{ previewLink }}</router-link>
              </p>
            </div>
            <div class="flex gap-3">
              <BaseButton variant="ghost" @click="backToMemberList">
                ← Все люди
              </BaseButton>
              <BaseButton variant="secondary" @click="store.toggleEditing">
                {{ store.isEditing ? '🔍 Предпросмотр' : '✏️ Редактировать' }}
              </BaseButton>
              <BaseButton v-if="store.isEditing" @click="saveChanges" :disabled="isSaving">
                {{ isSaving ? 'Сохраняем...' : 'Сохранить' }}
              </BaseButton>
            </div>
          </div>

          <!-- Content Area -->
          <div class="max-w-4xl mx-auto">
             <div v-if="store.isEditing" class="bg-charcoal/30 p-8 rounded-2xl border border-white/5 shadow-2xl">
                <EditorSidebar @save="saveChanges" @assign-on-tree="handleAssignOnTree" />
                <div class="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                  <button 
                    v-if="store.members.length > 1"
                    @click="deleteActiveMember"
                    class="text-red-400/60 hover:text-red-400 text-xs flex items-center gap-2 transition-colors"
                  >
                    🗑️ Удалить этого члена семьи
                  </button>
                  <BaseButton @click="saveChanges" :disabled="isSaving">
                    {{ isSaving ? 'Сохраняем...' : 'Сохранить изменения' }}
                  </BaseButton>
                </div>
             </div>
             <div v-else class="p-4 overflow-hidden shadow-2xl">
                <EditorPreview v-if="store.activeMember" :key="store.activeMember.id" :member="store.activeMember" :familyName="store.familyName" />
             </div>
          </div>
        </div>

        <!-- Member List View (Desktop) -->
        <div v-else>
          <div class="flex items-center justify-between mb-8">
             <ViewToggle v-model="store.viewMode" />
             <BaseButton size="sm" variant="ghost" @click="addMember" class="text-gold">
               + Добавить человека
             </BaseButton>
          </div>

          <!-- Cards View -->
          <div v-if="store.viewMode === 'cards'" class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
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
                <p class="text-[10px] uppercase tracking-widest text-gray-500 text-center mt-1 font-bold">{{ member.displayRole || member.relationship || 'Член семьи' }}</p>
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

          <!-- Tree View -->
          <div v-else class="h-[600px] bg-charcoal/30 rounded-2xl border border-white/5 overflow-hidden relative">
            <!-- Hint when assigning relation -->
            <div
              v-if="store.pendingRelation"
              class="absolute top-0 left-0 right-0 bg-gold/20 backdrop-blur-sm z-10 py-3 px-4 text-center"
            >
              <p class="text-silk text-sm">
                Нажмите на члена семьи, чтобы установить связь с
                <span class="text-gold font-bold">{{ store.members.find(m => m.id === store.pendingRelation?.memberId)?.name }}</span>
              </p>
              <button
                @click="store.pendingRelation = null"
                class="text-xs text-gray-400 hover:text-silk mt-1 underline"
              >
                Отмена
              </button>
            </div>
            <FamilyTree
              :members="store.members"
              :relations="store.relations"
              :family-name="store.familyName"
              :root-member-id="store.currentFamily?.rootMemberId"
              @select-member="handleTreeMemberSelect"
              @add-relation="handleTreeAddRelation"
            />
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
           <h1 class="text-xl font-serif text-silk">Мои архивы</h1>
        </div>

        <!-- Mobile Loading State -->
        <div v-if="store.isLoading" class="space-y-4 mb-8">
           <div v-for="i in 2" :key="i" class="bg-white/5 p-4 rounded-lg border border-white/5">
              <div class="flex justify-between items-start">
                <div class="space-y-2">
                   <Skeleton className="h-5 w-32" />
                   <Skeleton className="h-3 w-16 bg-white/5" />
                </div>
                <Skeleton className="h-4 w-4 bg-white/5" />
              </div>
           </div>
        </div>

        <div v-else-if="store.userFamilies.length > 0" class="space-y-4 mb-8">
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
      <div v-else class="h-full flex flex-col">

        <!-- Mobile Header -->
        <div v-if="mobileView === 'list'" class="p-4 bg-charcoal border-b border-white/10 shrink-0">
          <div class="flex justify-between items-center mb-3">
            <button @click="store.resetStore()" class="text-gray-400 text-sm">← Архивы</button>
            <!-- Editable family name -->
            <input
              v-if="isEditingFamilyName"
              v-model="editingFamilyName"
              @keyup.enter="saveFamilyName"
              @keyup.escape="cancelEditFamilyName"
              @blur="saveFamilyName"
              type="text"
              class="text-silk font-serif text-center bg-transparent border-b border-gold focus:outline-none max-w-[150px] text-sm"
              placeholder="Название"
            />
            <span
              v-else
              @click="startEditFamilyName"
              class="text-silk font-serif truncate max-w-[150px] cursor-pointer hover:text-gold transition-colors"
            >
              {{ store.familyName }}
            </span>
            <button @click="saveChanges" :disabled="isSaving" class="text-gold text-sm font-bold">
              {{ isSaving ? '...' : 'Сохр.' }}
            </button>
          </div>
          <!-- View Toggle for Mobile -->
          <div class="flex justify-center">
            <ViewToggle v-model="store.viewMode" />
          </div>
        </div>

        <!-- Cards/List View -->
        <MobileMemberList
          v-if="mobileView === 'list' && store.viewMode === 'cards'"
          @select="handleMobileSelect"
          @add="addMember"
        />

        <!-- Tree View (Mobile) -->
        <div v-else-if="mobileView === 'list' && store.viewMode === 'tree'" class="flex-1 overflow-hidden relative">
          <!-- Hint when assigning relation -->
          <div
            v-if="store.pendingRelation"
            class="absolute top-0 left-0 right-0 bg-gold/20 backdrop-blur-sm z-10 py-3 px-4 text-center"
          >
            <p class="text-silk text-sm">
              Нажмите на члена семьи для связи с
              <span class="text-gold font-bold">{{ store.members.find(m => m.id === store.pendingRelation?.memberId)?.name }}</span>
            </p>
            <button
              @click="store.pendingRelation = null"
              class="text-xs text-gray-400 hover:text-silk mt-1 underline"
            >
              Отмена
            </button>
          </div>
          <FamilyTree
            :members="store.members"
            :relations="store.relations"
            :family-name="store.familyName"
            :root-member-id="store.currentFamily?.rootMemberId"
            @select-member="handleTreeMemberSelect"
            @add-relation="handleTreeAddRelation"
          />
          <!-- FAB for adding -->
          <button
            @click="addMember"
            class="absolute bottom-20 right-4 w-14 h-14 rounded-full bg-gold text-charcoal shadow-lg flex items-center justify-center text-2xl font-bold z-20"
          >
            +
          </button>
        </div>

        <!-- Editor View -->
        <MobileMemberEditor
          v-else-if="mobileView === 'editor'"
          :key="store.activeMemberId"
          :member-id="store.activeMemberId || ''"
          @back="handleMobileBack"
          @save="saveChanges"
          @delete="handleMobileDelete"
          @assign-on-tree="handleAssignOnTree"
        />

      </div>
    </div>

    <!-- Assign Role Modal -->
    <AssignRoleModal
      :is-open="showAssignModal"
      :member="store.members.find(m => m.id === store.pendingRelation?.memberId) || null"
      :target-member-name="store.members.find(m => m.id === assignTargetMemberId)?.name"
      :suggested-role="store.pendingRelation?.suggestedRole"
      @confirm="handleRelationConfirm"
      @cancel="handleRelationCancel"
    />
  </MainLayout>
</template>
