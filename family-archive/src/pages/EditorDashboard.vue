<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import PricingModal from '@/shared/ui/PricingModal.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import MobileMemberList from '@/components/editor/MobileMemberList.vue'
import MobileMemberEditor from '@/components/editor/MobileMemberEditor.vue'
import ViewToggle from '@/shared/ui/ViewToggle.vue'
import FamilyTree from '@/components/tree/FamilyTree.vue'
import AssignRoleModal from '@/components/tree/AssignRoleModal.vue'
import Skeleton from '@/shared/ui/Skeleton.vue'
import InviteMemberModal from '@/modules/access/ui/InviteMemberModal.vue'
import { BackButton } from '@/shared/ui'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useSubscription } from '@/composables/useSubscription'
import { useAnalytics } from '@/composables/useAnalytics'
import { usePermissionsStore } from '@/modules/access/store/usePermissionsStore'
import { useAuthAccess } from '@/modules/access/composables/useAuthAccess'
import { useDialogStore } from '@/stores/dialogStore'
import { Trash2, Eye, Plus } from 'lucide-vue-next'
import type { RelationType } from '@/modules/family/domain/models'

const store = useMemoryStore()
const authStore = useAuthStore()
const subStore = useSubscriptionStore()
const subscription = useSubscription()
const permissions = usePermissionsStore()
const access = useAuthAccess()
const dialogs = useDialogStore()
const router = useRouter()
const route = useRoute()
const { trackArchiveCreation, trackEvent } = useAnalytics()

const isCreating = ref(false)
const newFamilyName = ref('')
const isSaving = ref(false)
const showSaved = ref(false)
const showPricing = ref(false)

// Active route state
const isAtDashboard = computed(() => route.name === 'ArchiveDashboard')
const currentArchiveId = computed(() => route.params.archiveId as string)
const isAtMemberEditor = computed(() => route.name === 'MemberEditor')
const isAtAccessManager = computed(() => route.name === 'AccessManagement')

// Sync Archive data with Route
watch(currentArchiveId, async (newId) => {
  if (newId) {
    // Load archive if not loaded or different
    if (store.currentFamily?.id !== newId) {
      await store.loadFamilyBySlug(newId)
      await permissions.fetchPermissions(newId)
    }
  } else if (isAtDashboard.value) {
    store.resetStore()
    permissions.resetPermissions()
  }
}, { immediate: true })

// Sync member editor state
watch(() => route.params.memberId, (newMemberId) => {
  if (newMemberId) {
    store.setActiveMember(newMemberId as string)
  }
}, { immediate: true })

// Sync viewMode with route
watch(() => route.name, (newName) => {
  if (newName === 'ArchiveTree' || newName === 'ArchiveRoot') {
    store.setViewMode('tree')
  } else if (newName === 'ArchiveList') {
    store.setViewMode('cards')
  }
}, { immediate: true })

const handleViewChange = (mode: 'cards' | 'tree') => {
  if (!currentArchiveId.value) return
  
  if (mode === 'tree') {
    router.push({ name: 'ArchiveTree', params: { archiveId: currentArchiveId.value } })
  } else {
    router.push({ name: 'ArchiveList', params: { archiveId: currentArchiveId.value } })
  }
}

// Assign role modal
const showAssignModal = ref(false)
const assignTargetMemberId = ref<string | null>(null)

// Access Management (Invitations)
const showInviteModal = ref(false)
const handleMemberInvite = (data: { email: string, role: any }) => {
  // Logic is in AccessRepository, currently mocked
  dialogs.alert(`Приглашение отправлено на ${data.email}`, 'Доступ предоставлен')
}

// Family name and URL editing
const isEditingSettings = ref(false)
const editingFamilyName = ref('')
const editingSlug = ref('')

const startEditSettings = () => {
  if (!access.canEditTree.value) return
  editingFamilyName.value = store.familyName
  editingSlug.value = store.currentFamily?.id || ''
  isEditingSettings.value = true
}

const saveSettings = async () => {
  if (!editingFamilyName.value.trim() || !editingSlug.value.trim()) return
  
  const authStore = useAuthStore()
  if (!authStore.userId || !store.currentFamily) return

  isSaving.value = true
  try {
    // 1. Update Name
    if (editingFamilyName.value !== store.familyName) {
      store.updateFamilyName(editingFamilyName.value.trim())
    }

    // 2. Update Slug if changed
    if (editingSlug.value !== store.currentFamily.id) {
      const slugSuccess = await store.updateArchiveId(editingSlug.value.trim())
      if (slugSuccess) {
        // Redirect to new URL
        router.replace({ 
          name: route.name as string, 
          params: { ...route.params, archiveId: editingSlug.value } 
        })
      }
    } else {
      // Just save the name change
      await store.saveCurrentFamily(authStore.userId)
    }
    
    isEditingSettings.value = false
    showSaved.value = true
    setTimeout(() => { showSaved.value = false }, 2000)
  } catch (error: any) {
    dialogs.alert(error.message || 'Произошла ошибка при сохранении настроек.', 'Ошибка')
  } finally {
    isSaving.value = false
  }
}

const cancelEditSettings = () => {
  isEditingSettings.value = false
}

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
  
  if (newFamily) {
    store.setFamily(newFamily)
    await store.addMember() 
    isCreating.value = false
    newFamilyName.value = ''
    
    router.push(`/archive/${newFamily.id}/onboarding`)
    await refreshFamilies()
    trackArchiveCreation(newFamily.id)
  }
}

const loadFamily = (family: any) => {
  router.push({ name: 'ArchiveTree', params: { archiveId: family.id } })
}

const selectMemberForPreview = (id: string) => {
  router.push({ 
    name: 'MemberEditor', 
    params: { 
      archiveId: currentArchiveId.value, 
      memberId: id 
    } 
  })
}

const backToMemberList = () => {
  // If we are at the archive root level (List or Tree), go back to dashboard
  if (route.name === 'ArchiveList' || route.name === 'ArchiveTree' || route.name === 'ArchiveRoot') {
    resetToArchives()
    return
  }
  
  // Otherwise, we are likely in an editor or manager, go back to the archive view
  if (currentArchiveId.value) {
    if (store.viewMode === 'tree') {
      router.push({ name: 'ArchiveTree', params: { archiveId: currentArchiveId.value } })
    } else {
      router.push({ name: 'ArchiveList', params: { archiveId: currentArchiveId.value } })
    }
  } else {
    resetToArchives()
  }
}

const resetToArchives = () => {
  router.push({ name: 'ArchiveDashboard' })
}

const deleteArchive = async (e: Event, familyId: string, slug: string) => {
  e.stopPropagation()
  if (!access.isOwner.value) {
    dialogs.alert('Только владелец может удалить архив.', 'Нет доступа')
    return
  }
  
  const confirmed = await dialogs.confirm(
    'Вы уверены? Весь архив будет удален безвозвратно. Это действие невозможно отменить.',
    'Удаление архива'
  )
  
  if (!confirmed) return
  
  await store.removeFamily(slug)
  await refreshFamilies()
  if (currentArchiveId.value === slug) {
    resetToArchives()
  }
}

const saveChanges = async () => {
  if (!access.canEditTree.value) {
    dialogs.alert('У вас нет прав для редактирования.', 'Доступ ограничен')
    return
  }

  if (store.currentFamily) {
    isSaving.value = true
    try {
      const success = await store.saveCurrentFamily(authStore.userId!)
      if (success) {
        trackEvent('save_family', {
          family_id: store.currentFamily.id,
          member_count: store.currentFamily.members.length
        })
        await refreshFamilies()
        showSaved.value = true
        setTimeout(() => {
          showSaved.value = false
        }, 2000)
      }
    } finally {
      isSaving.value = false
    }
  }
}

const handleLogout = async () => {
  await authStore.signOut()
  store.resetStore()
  permissions.resetPermissions()
  router.push('/')
}

// Member Management
const addMember = async () => {
  if (!access.canEditTree.value) return
  await store.addMember()
  if (store.activeMemberId) {
    selectMemberForPreview(store.activeMemberId)
  }
}

const deleteActiveMember = async () => {
  if (!store.activeMember || !access.canEditTree.value) return
  
  const confirmed = await dialogs.confirm(
    `Удалить ${store.activeMember.name} из семейного архива? Все фотографии и истории будут потеряны.`,
    'Удаление участника'
  )
  
  if (!confirmed) return
  
  await store.removeMember(store.activeMember.id)
  backToMemberList()
}

const handleDeleteMemberById = async (id: string, name: string) => {
  if (!access.canEditTree.value) return
  
  const confirmed = await dialogs.confirm(
    `Удалить ${name} из семейного архива? Это действие невозможно отменить.`,
    'Удаление участника'
  )
  
  if (!confirmed) return
  
  await store.removeMember(id)
}

// Tree View Handlers
const handleTreeMemberSelect = (memberId: string) => {
  if (store.pendingRelation) {
    showRelationConfirm(memberId)
    return
  }
  selectMemberForPreview(memberId)
}

// Обработчик назначения на древе
const handleAssignOnTree = (memberId: string) => {
  store.pendingRelation = {
    memberId,
    suggestedRole: 'parent'
  }
  router.push({ name: 'ArchiveTree', params: { archiveId: currentArchiveId.value } })
}

// Подтверждение связи - показываем модальное окно
const showRelationConfirm = (targetMemberId: string) => {
  if (!store.pendingRelation) return
  assignTargetMemberId.value = targetMemberId
  showAssignModal.value = true
}

// Обработка подтверждения из модалки
const handleRelationConfirm = (relationType: RelationType) => {
  if (!store.pendingRelation || !assignTargetMemberId.value) return

  const sourceId = store.pendingRelation.memberId
  const targetId = assignTargetMemberId.value

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

  showAssignModal.value = false
  assignTargetMemberId.value = null
  store.pendingRelation = null

  // Вернуться в список или редактор? ТЗ говорит вернуться в редактор
  router.push({ 
    name: 'MemberEditor', 
    params: { archiveId: currentArchiveId.value, memberId: sourceId } 
  })
}

// Отмена назначения
const handleRelationCancel = () => {
  showAssignModal.value = false
  assignTargetMemberId.value = null
  store.pendingRelation = null
}

const handleTreeAddRelation = (data: { memberId: string; relationType: string; gender?: 'male' | 'female' }) => {
  if (!access.canEditTree.value) return
  
  const sourceMember = store.members.find(m => m.id === data.memberId)
  let treePosition: { x: number; y: number } | undefined

  if (sourceMember?.treePosition) {
    const offset = 220 
    const verticalOffset = 180 

    switch (data.relationType) {
      case 'parent':
        treePosition = { x: sourceMember.treePosition.x, y: sourceMember.treePosition.y - verticalOffset }
        break
      case 'child':
        treePosition = { x: sourceMember.treePosition.x, y: sourceMember.treePosition.y + verticalOffset }
        break
      case 'spouse':
      case 'sibling':
        treePosition = { x: sourceMember.treePosition.x + offset, y: sourceMember.treePosition.y }
        break
    }
  }

  const newMember = store.addMemberWithRelation(
    data.memberId,
    data.relationType as any,
    { name: 'Новый родственник', gender: data.gender, treePosition }
  )
  
  if (newMember) {
    selectMemberForPreview(newMember.id)
  }
}

// Обработчик обновления позиции узла на древе
const handleUpdatePosition = (data: { memberId: string; position: { x: number; y: number } }) => {
  if (!access.canEditTree.value) return
  store.updateMemberPosition(data.memberId, data.position)

  if (authStore.userId && store.currentFamily) {
    store.saveCurrentFamily(authStore.userId)
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
    <!-- Saved Toast -->
    <Transition name="toast">
      <div
        v-if="showSaved"
        class="dashboard__toast fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        Сохранено
      </div>
    </Transition>

    <!-- Pricing Modal -->
    <PricingModal :isOpen="showPricing" @close="showPricing = false" />

    <!-- 
      DESKTOP LAYOUT (Route-Driven) 
      Hidden on mobile (md:flex)
    -->
    <div class="dashboard dashboard--desktop hidden md:flex h-full">
      
      <!-- Left Sidebar (Archives Context) -->
      <aside v-if="currentArchiveId" class="dashboard__sidebar w-20 bg-charcoal border-r border-white/5 flex flex-col h-full sticky top-0 overflow-y-auto overflow-x-hidden items-center py-6 gap-6 scrollbar-thin">
        <div 
          v-for="member in store.members" 
          :key="member.id"
          class="dashboard__sidebar-item flex-shrink-0 cursor-pointer relative group"
          @click="selectMemberForPreview(member.id)"
        >
          <div
            class="dashboard__sidebar-avatar w-12 h-12 rounded-full border-2 overflow-hidden transition-all duration-300"
            :class="store.activeMemberId === member.id ? 'dashboard__sidebar-avatar--active border-gold shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'border-white/10 hover:border-gold/50'"
          >
            <img
              v-if="member.photoUrl"
              :src="member.photoUrl"
              loading="lazy"
              decoding="async"
              class="dashboard__sidebar-img w-full h-full object-cover"
            >
            <div v-else class="dashboard__sidebar-placeholder w-full h-full bg-white/10 flex items-center justify-center text-xs text-gray-400">
              {{ member.name[0] || '?' }}
            </div>
          </div>
          <div class="dashboard__sidebar-tooltip absolute left-16 bg-black/80 text-silk text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
            {{ member.name }}
          </div>
        </div>
        
        <button 
          v-if="access.canEditTree.value"
          @click="addMember" 
          class="dashboard__sidebar-add w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold transition-all"
          title="Добавить члена семьи"
        >
          <span class="text-xl">+</span>
        </button>
      </aside>

      <!-- Main Content (Desktop) -->
      <main class="dashboard__main flex-1 overflow-y-auto p-8 scrollbar-thin flex flex-col">
        
        <!-- Top Header (Contextual) -->
        <div class="dashboard__header flex items-center justify-between mb-8 pb-6 border-b border-white/10 shrink-0">
          <div class="flex items-center gap-6">
            <BackButton 
              v-if="!currentArchiveId"
              to="/" 
              label="На главную" 
              class="dashboard__header-back px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/5" 
            />
            <BaseButton 
              v-else
              variant="ghost" 
              size="sm" 
              @click="backToMemberList" 
              class="dashboard__header-btn"
            >
              ← Назад
            </BaseButton>

            <div v-if="currentArchiveId" class="dashboard__header-info">
              <div v-if="isEditingSettings" class="dashboard__settings flex flex-col gap-3 max-w-xl">
                <div class="dashboard__settings-row flex items-center gap-3">
                  <span class="dashboard__settings-label text-gray-400 text-xl font-serif">Название:</span>
                  <input
                    v-model="editingFamilyName"
                    type="text"
                    class="dashboard__settings-input text-xl font-serif text-silk bg-transparent border-b border-gold focus:outline-none px-1 flex-1"
                    placeholder="Название семьи"
                  />
                </div>
                <div class="dashboard__settings-row flex items-center gap-3">
                  <span class="dashboard__settings-label text-gray-400 text-sm">URL ID:</span>
                  <input
                    v-model="editingSlug"
                    type="text"
                    class="dashboard__settings-input dashboard__settings-input--slug text-sm text-gold bg-transparent border-b border-white/20 focus:border-gold outline-none px-1 flex-1"
                    placeholder="URL-идентификатор"
                  />
                </div>
                <div class="dashboard__settings-actions flex gap-2 mt-1">
                  <BaseButton size="sm" @click="saveSettings" :disabled="isSaving">Сохранить</BaseButton>
                  <BaseButton variant="ghost" size="sm" @click="cancelEditSettings">Отмена</BaseButton>
                </div>
              </div>
              <div v-else class="dashboard__header-title-group flex flex-col">
                  <div class="flex items-center gap-3">
                    <span class="dashboard__header-context text-gray-400 text-xl font-serif">Архив:</span>
                    <h1
                      @click="startEditSettings"
                      class="dashboard__header-title text-xl font-serif text-silk transition-colors group cursor-pointer hover:text-gold"
                    >
                      {{ store.familyName || 'Без названия' }}
                      <span v-if="access.canEditTree.value" class="dashboard__header-edit-icon text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">✏️</span>
                    </h1>
                  </div>
                  <div v-if="!isEditingSettings" class="dashboard__header-meta text-xs mt-1">
                    <p class="dashboard__header-tariff text-gray-500 italic">Тариф: <span :class="subStore.isPremium ? 'text-gold' : 'text-gray-400'">{{ planName }}</span></p>
                  </div>
              </div>
            </div>
            <div v-else class="dashboard__header-info">
              <h1 class="dashboard__header-title text-2xl font-serif text-silk">Мои архивы</h1>
            </div>
          </div>

          <div class="dashboard__header-right flex items-center gap-4">
             <template v-if="currentArchiveId">
               <BaseButton variant="ghost" size="sm" @click="router.push({ name: 'AccessManagement', params: { archiveId: currentArchiveId } })" class="dashboard__header-btn">
                 👥 Доступ
               </BaseButton>
             </template>
          </div>
        </div>

        <!-- Dashboard (Archive List) View -->
        <div v-if="isAtDashboard" class="dashboard__view dashboard__view--archives max-w-4xl mx-auto w-full">
          
          <!-- Loading State -->
          <div v-if="store.isFetching" class="dashboard__loading space-y-4">
             <Skeleton className="h-7 w-48 mb-4" />
             <BaseCard v-for="i in 2" :key="i" class="dashboard__loading-card p-6">
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
          <div v-else-if="store.userFamilies.length > 0" class="dashboard__archive-grid grid gap-6">
            <BaseCard 
              v-for="family in store.userFamilies" 
              :key="family.id"
              class="dashboard__archive-card p-6 cursor-pointer group relative overflow-hidden transition-all duration-500"
              :class="store.currentFamily?.id === family.id 
                ? 'dashboard__archive-card--active border-gold bg-gold/10 ring-2 ring-gold/20 shadow-[0_0_30px_rgba(212,175,55,0.15)] scale-[1.02]' 
                : 'hover:border-gold/30 hover:bg-white/[0.02]'"
              @click="loadFamily(family)"
            >
              <div class="dashboard__archive-content flex items-center justify-between relative z-10">
                <div class="dashboard__archive-info flex flex-col gap-1">
                  <div class="flex items-center gap-3">
                    <h3 class="dashboard__archive-name text-lg text-silk" :class="{ 'text-gold font-bold': store.currentFamily?.id === family.id }">
                      {{ family.name }}
                    </h3>
                    <span v-if="store.currentFamily?.id === family.id" class="px-2 py-0.5 rounded-full bg-gold text-charcoal text-[8px] font-bold uppercase tracking-widest animate-pulse">
                      Текущий
                    </span>
                  </div>
                  <p class="dashboard__archive-meta text-sm text-gray-400">{{ family.members.length }} чел. • Создан {{ new Date(family.createdAt).toLocaleDateString() }}</p>
                </div>
                <div class="dashboard__archive-actions flex items-center gap-4">
                  <button 
                    v-if="family.ownerId === authStore.userId"
                    @click="(e) => deleteArchive(e, family.id, family.id)"
                    class="dashboard__archive-delete p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                  <span class="dashboard__archive-link text-gold font-bold" :class="{ 'translate-x-1': store.currentFamily?.id === family.id }">Открыть →</span>
                </div>
              </div>
              
              <!-- Left Accent for Active -->
              <div v-if="store.currentFamily?.id === family.id" class="absolute left-0 top-0 bottom-0 w-1 bg-gold shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
            </BaseCard>

            <!-- Create New CTA -->
            <div class="dashboard__create-cta mt-8 pt-8 border-t border-white/5 text-center">
              <h3 class="dashboard__create-title text-silk font-serif mb-6">Создать новый архив</h3>
              <div class="dashboard__create-form flex gap-4 max-w-md mx-auto">
                <input
                  v-model="newFamilyName"
                  type="text"
                  placeholder="Фамилия или название"
                  class="dashboard__create-input flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk focus:border-gold/50 outline-none transition-colors"
                />
                <BaseButton @click="startNewArchive" :disabled="!newFamilyName.trim() || isCreating" class="dashboard__create-btn">
                  Создать
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Pure Empty State -->
          <BaseCard v-else class="dashboard__empty-view p-20 text-center">
            <div class="dashboard__empty-icon text-6xl mb-6">🏛️</div>
            <h2 class="dashboard__empty-headline text-3xl font-serif text-silk mb-4">Начните вашу историю</h2>
            <p class="dashboard__empty-text text-gray-400 mb-10 max-w-sm mx-auto">Создайте ваш первый семейный архив и пригласите близких для совместного наполнения.</p>
            <div class="dashboard__empty-form flex flex-col gap-4 max-w-xs mx-auto">
               <input v-model="newFamilyName" placeholder="Название семьи" class="dashboard__empty-input px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk text-center" />
               <BaseButton @click="startNewArchive" :disabled="!newFamilyName.trim() || isCreating" class="dashboard__empty-btn">Создать архив</BaseButton>
            </div>
          </BaseCard>
        </div>

        <!-- Archive Content View (Route-Driven) -->
        <div v-else-if="currentArchiveId" class="dashboard__content-view flex-1 flex flex-col h-full">
          
          <!-- View Toggle Area -->
          <div v-if="!isAtMemberEditor && !isAtAccessManager" class="dashboard__toggle-area flex items-center justify-center gap-6 mb-12 shrink-0">
             <ViewToggle :modelValue="store.viewMode" @update:modelValue="handleViewChange" />
             <BaseButton v-if="route.name === 'ArchiveList' && access.canEditTree.value" size="sm" @click="addMember" class="dashboard__add-btn-desktop">
                <Plus class="w-4 h-4 mr-2" :stroke-width="3" /> Добавить человека
             </BaseButton>
          </div>

          <!-- Cards List -->
          <div v-if="route.name === 'ArchiveList'" class="dashboard__member-list flex-1">
            <div v-if="store.isFetching" class="dashboard__member-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-8 max-w-[1600px] mx-auto">
               <div v-for="i in 5" :key="i" class="dashboard__member-skeleton space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-2xl w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
               </div>
            </div>
            <div v-else-if="store.members.length === 0" class="dashboard__empty-state text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10 flex flex-col items-center">
              <h3 class="dashboard__empty-title text-2xl font-serif text-silk mb-6">В архиве пока пусто</h3>
              <BaseButton v-if="access.canEditTree.value" @click="addMember" class="dashboard__add-btn">+ Добавить человека</BaseButton>
            </div>
            <div v-else class="dashboard__member-grid grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-8 max-w-[1600px] mx-auto">
               <div v-for="member in store.members" :key="member.id" class="dashboard__member-card group relative">
                  <!-- Floating Action Buttons -->
                  <div class="absolute -top-2 -right-2 z-20 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all">
                    <!-- Public View Link -->
                    <a 
                      :href="`/${currentArchiveId}?member=${member.id}`"
                      target="_blank"
                      class="w-8 h-8 bg-gold text-charcoal rounded-full flex items-center justify-center hover:scale-110 shadow-xl"
                      title="Открыть страницу памяти"
                      @click.stop
                    >
                      <Eye class="w-4 h-4" />
                    </a>

                    <!-- Delete Button -->
                    <button 
                      v-if="access.canEditTree.value"
                      @click.stop="handleDeleteMemberById(member.id, member.name)"
                      class="dashboard__member-delete w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:scale-110 shadow-xl"
                      title="Удалить"
                    >
                      <Trash2 class="w-4 h-4" />
                    </button>
                  </div>

                  <div @click="selectMemberForPreview(member.id)" class="dashboard__member-inner cursor-pointer">
                    <div class="dashboard__member-image-wrapper aspect-[3/4] max-h-[350px] rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-gold/50 transition-all mb-4 relative shadow-2xl">
                       <img v-if="member.photoUrl" :src="member.photoUrl" class="dashboard__member-img w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                       <div v-else class="dashboard__member-placeholder w-full h-full bg-white/5 flex items-center justify-center text-4xl text-gray-600 font-serif">{{ member.name[0] }}</div>
                       <div class="dashboard__member-overlay absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60"></div>
                       <div class="dashboard__member-action absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                          <span class="dashboard__member-btn px-4 py-2 bg-gold text-charcoal text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl">Открыть</span>
                       </div>
                    </div>
                    <h4 class="dashboard__member-name text-silk font-serif text-center group-hover:text-gold transition-colors truncate px-2">{{ member.name }}</h4>
                  </div>
               </div>
            </div>
          </div>

          <!-- Tree Canvas -->
          <div v-else-if="route.name === 'ArchiveTree'" class="dashboard__tree-canvas flex-1 min-h-[500px] rounded-3xl border border-white/5 overflow-hidden bg-obsidian relative">
            <div v-if="store.isFetching" class="dashboard__tree-loading absolute inset-0 flex items-center justify-center bg-obsidian z-10">
               <div class="space-y-8 w-full max-w-2xl px-10">
                  <div class="flex justify-center"><Skeleton className="h-20 w-40 rounded-xl" /></div>
                  <div class="flex justify-around">
                     <Skeleton className="h-20 w-40 rounded-xl" />
                     <Skeleton className="h-20 w-40 rounded-xl" />
                  </div>
                  <div class="flex justify-between">
                     <Skeleton className="h-20 w-40 rounded-xl" />
                     <Skeleton className="h-20 w-40 rounded-xl" />
                     <Skeleton className="h-20 w-40 rounded-xl" />
                  </div>
               </div>
            </div>
            <FamilyTree
              :members="store.members"
              :relations="store.relations"
              :family-name="store.familyName"
              :root-member-id="store.currentFamily?.rootMemberId"
              @select-member="handleTreeMemberSelect"
              @add-relation="handleTreeAddRelation"
              @update-position="handleUpdatePosition"
              @add-member="addMember"
            />
          </div>

          <!-- Member Editor -->
          <div v-else-if="isAtMemberEditor" class="dashboard__editor-view max-w-4xl mx-auto w-full pb-20">
             <div class="dashboard__editor-header flex items-center justify-end mb-8 pb-4 border-b border-white/5">
                <div class="dashboard__editor-actions flex gap-3">
                   <BaseButton variant="ghost" @click="store.toggleEditing" class="dashboard__editor-toggle">
                     {{ store.isEditing ? '🔍 Предпросмотр' : '✏️ Редактировать' }}
                   </BaseButton>
                </div>
             </div>
             
             <div v-if="store.isEditing && access.canEditTree.value" class="dashboard__editor-container bg-charcoal/30 p-8 rounded-3xl border border-white/5 shadow-2xl">
                <EditorSidebar 
                  @save="saveChanges" 
                  @delete="deleteActiveMember"
                  @assign-on-tree="handleAssignOnTree" 
                />
             </div>
             <EditorPreview v-else-if="store.activeMember" :member="store.activeMember" :familyName="store.familyName" class="dashboard__editor-preview" />
          </div>

          <!-- Access Management View -->
          <div v-else-if="isAtAccessManager" class="dashboard__access-view max-w-3xl mx-auto w-full py-10">
             <div class="dashboard__access-header flex items-center justify-between mb-8">
                <div class="dashboard__access-info">
                   <h2 class="dashboard__access-title text-2xl font-serif text-silk">Участники архива</h2>
                   <p class="dashboard__access-subtitle text-gray-400 text-sm mt-1">Приглашайте близких для совместной работы над вашей историей.</p>
                </div>
                <BaseButton v-if="access.canManageUsers.value" @click="showInviteModal = true" class="dashboard__access-invite">
                  + Пригласить
                </BaseButton>
             </div>

             <!-- List of current participants -->
             <div class="dashboard__access-list space-y-4">
                <BaseCard class="dashboard__access-card p-4 bg-white/5 border-white/5 flex items-center justify-between">
                   <div class="flex items-center gap-4">
                      <div class="dashboard__access-avatar w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                        {{ authStore.user?.email?.[0]?.toUpperCase() || 'Я' }}
                      </div>
                      <div class="dashboard__access-user-info">
                         <p class="dashboard__access-email text-silk font-medium">{{ authStore.user?.email }}</p>
                         <p class="dashboard__access-role text-[10px] text-gold uppercase tracking-widest font-bold">Владелец</p>
                      </div>
                   </div>
                   <div class="dashboard__access-status text-xs text-gray-500">
                      Полный доступ
                   </div>
                </BaseCard>

                <p v-if="permissions.members.length === 0" class="dashboard__access-empty text-center py-12 text-gray-500 italic border border-dashed border-white/5 rounded-3xl">
                  Пока нет других участников.
                </p>
             </div>

             <div class="dashboard__access-footer mt-12 pt-8 border-t border-white/5">
                <button @click="backToMemberList" class="dashboard__access-back text-gray-400 hover:text-gold transition-colors text-sm flex items-center gap-2">
                   ← Вернуться в архив
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>

    <!-- MOBILE LAYOUT (Sync with Router) -->
    <div class="dashboard dashboard--mobile md:hidden h-[calc(100vh-64px)] overflow-hidden flex flex-col">
       <!-- Similar Route-Driven logic for Mobile -->
       <div v-if="isAtDashboard" class="dashboard__mobile-archives p-4 overflow-y-auto">
          <BackButton to="/" label="На главную" class="dashboard__mobile-back mb-4" />
          
          <!-- Loading State (Mobile) -->
          <div v-if="store.isFetching" class="dashboard__mobile-loading space-y-4">
             <Skeleton className="h-6 w-32 mb-6" />
             <BaseCard v-for="i in 3" :key="i" class="p-4 bg-white/5 border-white/5">
                <div class="flex justify-between items-center">
                   <div class="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-3 w-20 opacity-50" />
                   </div>
                   <Skeleton className="h-4 w-4" />
                </div>
             </BaseCard>
          </div>

          <!-- Existing Archives (Mobile) -->
          <div v-else-if="store.userFamilies.length > 0">
            <h1 class="dashboard__mobile-title text-xl font-serif text-silk mb-6">Мои архивы</h1>
            <div 
              v-for="family in store.userFamilies" 
              :key="family.id" 
              @click="loadFamily(family)" 
              class="dashboard__mobile-archive-card p-4 rounded-xl mb-3 border border-gold/30 transition-all relative overflow-hidden"
              :class="store.currentFamily?.id === family.id 
                ? 'dashboard__mobile-archive-card--active border-gold bg-gold/10 ring-2 ring-gold/30 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                : 'bg-white/5 active:bg-white/10'"
            >
               <div class="flex justify-between items-center relative z-10">
                  <div class="flex flex-col gap-1">
                    <span class="dashboard__mobile-archive-name text-silk font-serif">{{ family.name }}</span>
                    <span v-if="store.currentFamily?.id === family.id" class="text-[8px] text-gold font-bold uppercase tracking-widest">Текущий</span>
                  </div>
                  <span class="dashboard__mobile-archive-arrow text-gold" :class="{ 'translate-x-1': store.currentFamily?.id === family.id }">→</span>
               </div>
               <!-- Left accent line for mobile active -->
               <div v-if="store.currentFamily?.id === family.id" class="absolute left-0 top-0 bottom-0 w-1 bg-gold"></div>
            </div>

            <!-- Create New CTA (Mobile) -->
            <div class="dashboard__mobile-create mt-10 pt-8 border-t border-white/5 text-center">
              <h3 class="dashboard__mobile-create-title text-silk font-serif mb-6">Создать новый архив</h3>
              <div class="dashboard__mobile-create-form flex flex-col gap-4">
                <input
                  v-model="newFamilyName"
                  type="text"
                  placeholder="Название семьи"
                  class="dashboard__mobile-create-input px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk focus:border-gold/50 outline-none transition-colors text-center"
                />
                <BaseButton @click="startNewArchive" :disabled="!newFamilyName.trim() || isCreating" class="dashboard__mobile-create-btn">
                  Создать архив
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Pure Empty State (Mobile) -->
          <BaseCard v-else class="dashboard__mobile-empty p-10 text-center">
            <div class="dashboard__empty-icon text-5xl mb-6">🏛️</div>
            <h2 class="dashboard__empty-headline text-2xl font-serif text-silk mb-4">Начните вашу историю</h2>
            <p class="dashboard__empty-text text-gray-400 mb-8 text-sm leading-relaxed">Создайте ваш первый семейный архив и пригласите близких для совместного наполнения.</p>
            <div class="dashboard__empty-form flex flex-col gap-4">
               <input v-model="newFamilyName" placeholder="Название семьи" class="dashboard__empty-input px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk text-center" />
               <BaseButton @click="startNewArchive" :disabled="!newFamilyName.trim() || isCreating" class="dashboard__empty-btn">Создать архив</BaseButton>
            </div>
          </BaseCard>
       </div>
       <div v-else class="dashboard__mobile-content h-full flex flex-col">
          <!-- Mobile Archive View based on route.name -->
          <div class="dashboard__mobile-header p-4 bg-charcoal border-b border-white/10 flex items-center justify-between shrink-0">
             <div class="flex items-center gap-3 min-w-0">
                <button @click="backToMemberList" class="dashboard__mobile-back-btn text-gray-400 text-xs flex-shrink-0">← Назад</button>
                <span class="dashboard__mobile-family-name text-silk font-serif text-sm truncate">{{ store.familyName }}</span>
             </div>
             <div class="flex items-center gap-2 flex-shrink-0">
                <BaseButton v-if="access.canEditTree.value" size="sm" @click="saveChanges" :disabled="isSaving" class="dashboard__mobile-save-btn">{{ isSaving ? '...' : 'Сохр.' }}</BaseButton>
             </div>
          </div>

          <!-- Mobile View Toggle -->
          <div v-if="!isAtMemberEditor && !isAtAccessManager" class="dashboard__mobile-toggle px-4 py-3 flex justify-center bg-charcoal/50 border-b border-white/5 shrink-0">
             <ViewToggle :modelValue="store.viewMode" @update:modelValue="handleViewChange" />
          </div>
          
          <div class="dashboard__mobile-view-wrapper flex-1 min-h-0 flex flex-col overflow-hidden relative">
             <!-- Mobile View Selector using router-view or conditions -->
             <MobileMemberList v-if="route.name === 'ArchiveList'" @select="selectMemberForPreview" @add="addMember" @delete="handleDeleteMemberById" class="dashboard__mobile-list" />
             <div v-else-if="route.name === 'ArchiveTree'" class="dashboard__mobile-tree h-full relative">
                <FamilyTree :members="store.members" :relations="store.relations" :family-name="store.familyName" @select-member="handleTreeMemberSelect" />
             </div>
             <MobileMemberEditor 
               v-else-if="isAtMemberEditor" 
               :member-id="route.params.memberId as string" 
               @back="backToMemberList" 
               @save="saveChanges" 
               @delete="deleteActiveMember"
               @assign-on-tree="handleAssignOnTree"
               class="dashboard__mobile-editor"
             />

             <!-- Fixed CTA for adding member (Mobile) -->
             <div v-if="(route.name === 'ArchiveList' || route.name === 'ArchiveTree') && access.canEditTree.value" class="dashboard__mobile-fab absolute bottom-6 right-6 z-20">
                <button 
                  @click="addMember"
                  class="flex items-center gap-2 px-6 py-4 rounded-full bg-gold text-charcoal shadow-2xl shadow-gold/40 active:scale-95 transition-all font-bold uppercase text-xs tracking-widest"
                >
                  <Plus class="w-5 h-5" :stroke-width="3" />
                  <span>Добавить</span>
                </button>
             </div>
          </div>
       </div>
    </div>

    <!-- Modals -->
    <InviteMemberModal
      :isOpen="showInviteModal"
      :archiveId="currentArchiveId"
      @close="showInviteModal = false"
      @invite="handleMemberInvite"
    />
    <AssignRoleModal
      :is-open="showAssignModal"
      :member="store.members.find(m => m.id === store.pendingRelation?.memberId) || null"
      :target-member-name="store.members.find(m => m.id === assignTargetMemberId)?.name"
      @confirm="handleRelationConfirm"
      @cancel="handleRelationCancel"
    />
  </MainLayout>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
