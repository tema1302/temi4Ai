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
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useSubscription } from '@/composables/useSubscription'
import { useAnalytics } from '@/composables/useAnalytics'
import { usePermissionsStore } from '@/modules/access/store/usePermissionsStore'
import { useAuthAccess } from '@/modules/access/composables/useAuthAccess'
import { useDialogStore } from '@/stores/dialogStore'

const store = useMemoryStore()
const authStore = useAuthStore()
const subStore = useSubscriptionStore()
const subscription = useSubscription()
const permissions = usePermissionsStore()
const access = useAuthAccess()
const dialogs = useDialogStore()
const router = useRouter()
const route = useRoute()
const { trackArchiveCreation, trackUpgrade, trackEvent } = useAnalytics()

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

// Family name editing
const isEditingFamilyName = ref(false)
const editingFamilyName = ref('')

const startEditFamilyName = () => {
  if (!access.canEditTree.value) return
  editingFamilyName.value = store.familyName
  isEditingFamilyName.value = true
}

const saveFamilyName = async () => {
  if (editingFamilyName.value.trim() && access.canEditTree.value) {
    store.updateFamilyName(editingFamilyName.value.trim())
    if (authStore.user?.id && store.currentFamily) {
      await store.saveCurrentFamily(authStore.user.id)
    }
  }
  isEditingFamilyName.value = false
}

const cancelEditFamilyName = () => {
  isEditingFamilyName.value = false
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
  
  store.setFamily(newFamily)
  await store.addMember() 
  isCreating.value = false
  newFamilyName.value = ''
  
  router.push(`/archive/${newFamily.id}/onboarding`)
  await refreshFamilies()
  trackArchiveCreation(newFamily.id)
}

const loadFamily = (family: any) => {
  router.push({ name: 'ArchiveList', params: { archiveId: family.id } })
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
const handleRelationConfirm = (relationType: 'parent' | 'spouse' | 'sibling' | 'child') => {
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
        class="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-500/90 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
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
    <div class="hidden md:flex h-full">
      
      <!-- Left Sidebar (Archives Context) -->
      <aside v-if="currentArchiveId" class="w-20 bg-charcoal border-r border-white/5 flex flex-col h-full sticky top-0 overflow-y-auto overflow-x-hidden items-center py-6 gap-6 scrollbar-thin">
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
              loading="lazy"
              decoding="async"
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
          v-if="access.canEditTree.value"
          @click="addMember" 
          class="w-12 h-12 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-gray-500 hover:border-gold hover:text-gold transition-all"
          title="Добавить члена семьи"
        >
          <span class="text-xl">+</span>
        </button>
      </aside>

      <!-- Main Content (Desktop) -->
      <main class="flex-1 overflow-y-auto p-8 scrollbar-thin flex flex-col">
        
        <!-- Top Header (Contextual) -->
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-white/10 shrink-0">
          <div v-if="currentArchiveId">
            <div class="flex items-center gap-3">
              <span class="text-gray-400 text-2xl font-serif">Архив:</span>
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
              <h1
                v-else
                @click="startEditFamilyName"
                class="text-2xl font-serif text-silk transition-colors group"
                :class="{ 'cursor-pointer hover:text-gold': access.canEditTree.value }"
              >
                {{ store.familyName || 'Без названия' }}
                <span v-if="access.canEditTree.value" class="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2">✏️</span>
              </h1>
            </div>
            <div class="flex items-center gap-3 text-sm mt-1">
              <p class="text-gray-400">Роль: <span class="text-gold capitalize">{{ access.currentRole.value }}</span></p>
              <span class="text-gray-600">|</span>
              <p class="text-gray-400">Тариф: <span :class="subStore.isPremium ? 'text-gold' : 'text-gray-300'">{{ planName }}</span></p>
            </div>
          </div>
          <div v-else>
            <h1 class="text-2xl font-serif text-silk">Мои архивы</h1>
            <p class="text-gray-400 text-sm">Управляйте вашими семейными историями</p>
          </div>

          <div class="flex gap-4">
             <template v-if="currentArchiveId">
               <BaseButton variant="ghost" size="sm" @click="router.push({ name: 'AccessManagement', params: { archiveId: currentArchiveId } })">
                 👥 Доступ
               </BaseButton>
               <BaseButton variant="ghost" size="sm" @click="backToMemberList">
                 ← Назад
               </BaseButton>
             </template>
             <BaseButton v-else variant="primary" size="sm" @click="handleLogout">
               Выйти
             </BaseButton>
          </div>
        </div>

        <!-- Dashboard (Archive List) View -->
        <div v-if="isAtDashboard" class="max-w-4xl mx-auto w-full">
          
          <!-- Loading State -->
          <div v-if="store.isFetching" class="space-y-4">
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
          <div v-else-if="store.userFamilies.length > 0" class="grid gap-6">
            <BaseCard 
              v-for="family in store.userFamilies" 
              :key="family.id"
              class="p-6 cursor-pointer group relative overflow-hidden transition-all duration-300"
              :class="store.currentFamily?.id === family.id ? 'border-gold bg-gold/5 ring-1 ring-gold/20' : 'hover:border-gold/30'"
              @click="loadFamily(family)"
            >
              <div class="flex items-center justify-between relative z-10">
                <div>
                  <h3 class="text-lg text-silk" :class="{ 'text-gold': store.currentFamily?.id === family.id }">
                    {{ family.name }}
                  </h3>
                  <p class="text-sm text-gray-400">{{ family.members.length }} чел. • Создан {{ new Date(family.createdAt).toLocaleDateString() }}</p>
                </div>
                <div class="flex items-center gap-4">
                  <button 
                    v-if="family.ownerId === authStore.userId"
                    @click="(e) => deleteArchive(e, family.id, family.id)"
                    class="p-2 text-gray-500 hover:text-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                  <span class="text-gold font-bold">Открыть →</span>
                </div>
              </div>
            </BaseCard>

            <!-- Create New CTA -->
            <div class="mt-8 pt-8 border-t border-white/5 text-center">
              <h3 class="text-silk font-serif mb-6">Создать новый архив</h3>
              <div class="flex gap-4 max-w-md mx-auto">
                <input
                  v-model="newFamilyName"
                  type="text"
                  placeholder="Фамилия или название"
                  class="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk focus:border-gold/50 outline-none transition-colors"
                />
                <BaseButton @click="startNewArchive" :disabled="!newFamilyName.trim() || isCreating">
                  Создать
                </BaseButton>
              </div>
            </div>
          </div>

          <!-- Pure Empty State -->
          <BaseCard v-else class="p-20 text-center">
            <div class="text-6xl mb-6">🏛️</div>
            <h2 class="text-3xl font-serif text-silk mb-4">Начните вашу историю</h2>
            <p class="text-gray-400 mb-10 max-w-sm mx-auto">Создайте ваш первый семейный архив и пригласите близких для совместного наполнения.</p>
            <div class="flex flex-col gap-4 max-w-xs mx-auto">
               <input v-model="newFamilyName" placeholder="Название семьи" class="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk text-center" />
               <BaseButton @click="startNewArchive" :disabled="!newFamilyName.trim() || isCreating">Создать архив</BaseButton>
            </div>
          </BaseCard>
        </div>

        <!-- Archive Content View (Route-Driven) -->
        <div v-else-if="currentArchiveId" class="flex-1 flex flex-col h-full">
          
          <!-- View Toggle Area -->
          <div v-if="!isAtMemberEditor && !isAtAccessManager" class="flex items-center justify-center mb-12 shrink-0">
             <ViewToggle :modelValue="store.viewMode" @update:modelValue="handleViewChange" />
          </div>

          <!-- Cards List -->
          <div v-if="route.name === 'ArchiveList'" class="flex-1">
            <div v-if="store.isFetching" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
               <div v-for="i in 5" :key="i" class="space-y-4">
                  <Skeleton className="aspect-[3/4] rounded-2xl w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
               </div>
            </div>
            <div v-else-if="store.members.length === 0" class="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <h3 class="text-2xl font-serif text-silk mb-2">В архиве пока пусто</h3>
              <BaseButton v-if="access.canEditTree.value" @click="addMember">+ Добавить человека</BaseButton>
            </div>
            <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
               <div v-for="member in store.members" :key="member.id" @click="selectMemberForPreview(member.id)" class="group cursor-pointer">
                  <div class="aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/5 group-hover:border-gold/50 transition-all mb-4 relative shadow-2xl">
                     <img v-if="member.photoUrl" :src="member.photoUrl" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                     <div v-else class="w-full h-full bg-white/5 flex items-center justify-center text-4xl text-gray-600 font-serif">{{ member.name[0] }}</div>
                     <div class="absolute inset-0 bg-gradient-to-t from-obsidian via-transparent to-transparent opacity-60"></div>
                     <div class="absolute inset-0 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100 transition-all translate-y-4 group-hover:translate-y-0">
                        <span class="px-4 py-2 bg-gold text-charcoal text-[10px] font-bold uppercase tracking-widest rounded-full shadow-xl">Открыть</span>
                     </div>
                  </div>
                  <h4 class="text-silk font-serif text-center group-hover:text-gold transition-colors">{{ member.name }}</h4>
               </div>
            </div>
          </div>

          <!-- Tree Canvas -->
          <div v-else-if="route.name === 'ArchiveTree'" class="flex-1 min-h-[500px] rounded-3xl border border-white/5 overflow-hidden bg-obsidian relative">
            <div v-if="store.isFetching" class="absolute inset-0 flex items-center justify-center bg-obsidian z-10">
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
            />
          </div>

          <!-- Member Editor -->
          <div v-else-if="isAtMemberEditor" class="max-w-4xl mx-auto w-full pb-20">
             <div class="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                <button @click="backToMemberList" class="text-gray-400 hover:text-silk transition-colors text-sm">← К списку</button>
                <div class="flex gap-3">
                   <BaseButton variant="ghost" @click="store.toggleEditing">
                     {{ store.isEditing ? '🔍 Предпросмотр' : '✏️ Редактировать' }}
                   </BaseButton>
                </div>
             </div>
             
             <div v-if="store.isEditing && access.canEditTree.value" class="bg-charcoal/30 p-8 rounded-3xl border border-white/5 shadow-2xl">
                <EditorSidebar 
                  @save="saveChanges" 
                  @delete="deleteActiveMember"
                  @assign-on-tree="handleAssignOnTree" 
                />
             </div>
             <EditorPreview v-else-if="store.activeMember" :member="store.activeMember" :familyName="store.familyName" />
          </div>

          <!-- Access Management View -->
          <div v-else-if="isAtAccessManager" class="max-w-3xl mx-auto w-full py-10">
             <div class="flex items-center justify-between mb-8">
                <div>
                   <h2 class="text-2xl font-serif text-silk">Участники архива</h2>
                   <p class="text-gray-400 text-sm mt-1">Приглашайте близких для совместной работы над вашей историей.</p>
                </div>
                <BaseButton v-if="access.canManageUsers.value" @click="showInviteModal = true">
                  + Пригласить
                </BaseButton>
             </div>

             <!-- List of current participants -->
             <div class="space-y-4">
                <BaseCard class="p-4 bg-white/5 border-white/5 flex items-center justify-between">
                   <div class="flex items-center gap-4">
                      <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center text-gold font-bold">
                        {{ authStore.user?.email?.[0]?.toUpperCase() || 'Я' }}
                      </div>
                      <div>
                         <p class="text-silk font-medium">{{ authStore.user?.email }}</p>
                         <p class="text-[10px] text-gold uppercase tracking-widest font-bold">Владелец</p>
                      </div>
                   </div>
                   <div class="text-xs text-gray-500">
                      Полный доступ
                   </div>
                </BaseCard>

                <p v-if="permissions.members.length === 0" class="text-center py-12 text-gray-500 italic border border-dashed border-white/5 rounded-3xl">
                  Пока нет других участников.
                </p>
             </div>

             <div class="mt-12 pt-8 border-t border-white/5">
                <button @click="backToMemberList" class="text-gray-400 hover:text-gold transition-colors text-sm flex items-center gap-2">
                   ← Вернуться в архив
                </button>
             </div>
          </div>
        </div>
      </main>
    </div>

    <!-- MOBILE LAYOUT (Sync with Router) -->
    <div class="md:hidden h-[calc(100vh-64px)] overflow-hidden flex flex-col">
       <!-- Similar Route-Driven logic for Mobile -->
       <div v-if="isAtDashboard" class="p-4 overflow-y-auto">
          <h1 class="text-xl font-serif text-silk mb-6">Мои архивы</h1>
          <div v-for="family in store.userFamilies" :key="family.id" @click="loadFamily(family)" class="bg-white/5 p-4 rounded-xl mb-3 border border-white/5 active:bg-white/10">
             <div class="flex justify-between items-center">
                <span class="text-silk font-serif">{{ family.name }}</span>
                <span class="text-gold">→</span>
             </div>
          </div>
          <!-- Mobile Create Archive UI... -->
       </div>
       <div v-else class="h-full flex flex-col">
          <!-- Mobile Archive View based on route.name -->
          <div class="p-4 bg-charcoal border-b border-white/10 flex justify-between items-center shrink-0">
             <button @click="backToMemberList" class="text-gray-400 text-xs">← Назад</button>
             <span class="text-silk font-serif text-sm truncate max-w-[150px]">{{ store.familyName }}</span>
             <BaseButton v-if="access.canEditTree.value" size="sm" @click="saveChanges" :disabled="isSaving">{{ isSaving ? '...' : 'Сохр.' }}</BaseButton>
          </div>
          
          <div class="flex-1 overflow-hidden">
             <!-- Mobile View Selector using router-view or conditions -->
             <MobileMemberList v-if="route.name === 'ArchiveList'" @select="selectMemberForPreview" @add="addMember" />
             <div v-else-if="route.name === 'ArchiveTree'" class="h-full relative">
                <FamilyTree :members="store.members" :relations="store.relations" :family-name="store.familyName" @select-member="handleTreeMemberSelect" />
             </div>
             <MobileMemberEditor v-else-if="isAtMemberEditor" :member-id="route.params.memberId as string" @back="backToMemberList" @save="saveChanges" />
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
