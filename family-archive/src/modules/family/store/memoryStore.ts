import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { FamilyRepository } from '../api/repository'
import { useAuthStore } from '@/stores/authStore'
import { slugify } from '@/utils'
import {
  type FamilyArchive,
  type FamilyMember,
  type FamilyRelation,
  type RelationType,
  createEmptyMember,
  createEmptyRelation
} from '../domain/models'

// Simple debounce helper
function debounce<T extends (...args: any[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }) as T
}

// Пустой массив как константа для избежания создания новых ссылок
const EMPTY_ARRAY: any[] = []

export const useMemoryStore = defineStore('memory', () => {
  // State
  const currentFamily = ref<FamilyArchive | null>(null)
  const activeMemberId = ref<string | null>(null)
  const isFetching = ref(false)
  const isSaving = ref(false)
  const isEditing = ref(false)
  const isDraft = ref(false)
  const userFamilies = ref<FamilyArchive[]>([])
  const pendingRelation = ref<{ memberId: string; suggestedRole: string } | null>(null)
  const viewMode = ref<'cards' | 'tree'>('cards')
  
  // Cache for loaded families
  const archiveCache = ref<Record<string, FamilyArchive>>({})

  // Flag to skip auto-save on initial load
  let isInitialLoad = false

  // Auto-save logic
  const debouncedSave = debounce(async (userId: string) => {
    if (currentFamily.value && isDraft.value) {
      await saveCurrentFamily(userId)
      isDraft.value = false
    }
  }, 3000) // 3 seconds delay

  // Watch for changes to trigger auto-save
  watch(currentFamily, (newVal) => {
    if (newVal) {
      // Don't auto-save demo data
      if (newVal.id === 'smith-family' || newVal.id === 'example') {
        return
      }

      // If this is the initial set from a load, don't mark as draft
      if (isInitialLoad) {
        isInitialLoad = false
        return
      }

      isDraft.value = true
      // Update cache with current changes (deep clone to avoid reference issues)
      archiveCache.value[newVal.id] = JSON.parse(JSON.stringify(newVal))
      
      const authStore = useAuthStore()
      if (authStore.userId) {
        debouncedSave(authStore.userId)
      }
    }
  }, { deep: true })

  // Getters
  const isLoading = computed(() => isFetching.value) // Backward compatibility for UI skeletons
  const familyName = computed(() => currentFamily.value?.name ?? '')
  const members = computed(() => currentFamily.value?.members ?? EMPTY_ARRAY as FamilyMember[])
  const relations = computed(() => currentFamily.value?.relations ?? EMPTY_ARRAY as FamilyRelation[])

  const activeMember = computed(() => {
    if (!currentFamily.value?.members.length) return null
    if (activeMemberId.value) {
      return currentFamily.value.members.find(m => m.id === activeMemberId.value) || currentFamily.value.members[0]
    }
    return currentFamily.value.members[0]
  })

  // Получить связанные члены для данного ID
  const getRelatedMembers = computed(() => (memberId: string) => {
    const related: { member: FamilyMember; relationType: RelationType }[] = []

    relations.value.forEach(r => {
      if (r.fromMemberId === memberId) {
        const member = members.value.find(m => m.id === r.toMemberId)
        if (member) related.push({ member, relationType: r.relationType })
      } else if (r.toMemberId === memberId) {
        const member = members.value.find(m => m.id === r.fromMemberId)
        if (member) {
          // Инвертируем тип связи для отображения
          const invertedType = r.relationType === 'parent' ? 'child' as RelationType : r.relationType
          related.push({ member, relationType: invertedType })
        }
      }
    })

    return related
  })

  // Actions
  function setFamily(data: FamilyArchive, isFromLoad = false) {
    if (isFromLoad) isInitialLoad = true
    
    currentFamily.value = data
    // Also update cache (deep clone)
    archiveCache.value[data.id] = JSON.parse(JSON.stringify(data))
    
    if (data.members.length > 0) {
      activeMemberId.value = data.rootMemberId || data.members[0].id
    }
  }

  function setActiveMember(id: string) {
    activeMemberId.value = id
  }

  function updateMember(memberId: string, updates: Partial<FamilyMember>) {
    if (!currentFamily.value) return

    const index = currentFamily.value.members.findIndex(m => m.id === memberId)
    if (index !== -1) {
      currentFamily.value.members[index] = {
        ...currentFamily.value.members[index],
        ...updates
      }
      currentFamily.value.updatedAt = new Date().toISOString()
    }
  }

  // Обновление позиции члена на древе
  function updateMemberPosition(memberId: string, position: { x: number; y: number }) {
    if (!currentFamily.value) return

    const index = currentFamily.value.members.findIndex(m => m.id === memberId)
    if (index !== -1) {
      currentFamily.value.members[index] = {
        ...currentFamily.value.members[index],
        treePosition: position
      }
      currentFamily.value.updatedAt = new Date().toISOString()
    }
  }

  // Сброс всех позиций (вернуться к автоматическому layout)
  function resetAllPositions() {
    if (!currentFamily.value) return

    currentFamily.value.members = currentFamily.value.members.map(member => ({
      ...member,
      treePosition: undefined
    }))
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  function updateFamilyName(name: string) {
    if (!currentFamily.value) return
    currentFamily.value.name = name
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  async function addMember() {
    if (!currentFamily.value) return
    const newMember = createEmptyMember()
    newMember.name = 'Новый член семьи'
    currentFamily.value.members.push(newMember)
    activeMemberId.value = newMember.id
    currentFamily.value.updatedAt = new Date().toISOString()
    isEditing.value = true
    
    // Persist immediately if logged in
    const authStore = useAuthStore()
    if (authStore.userId) {
      await saveCurrentFamily(authStore.userId)
    }
  }

  // Новое: Добавление члена с ролью
  async function addMemberWithRelation(
    relatedMemberId: string,
    relationType: RelationType,
    memberData?: Partial<FamilyMember>
  ) {
    if (!currentFamily.value) return null

    const newMember = createEmptyMember()
    Object.assign(newMember, memberData, { name: memberData?.name || 'Новый член семьи' })

    currentFamily.value.members.push(newMember)
    activeMemberId.value = newMember.id
    isEditing.value = true

    // Создаем связь
    let fromId = relatedMemberId
    let toId = newMember.id

    if (relationType === 'parent') {
      // Новый член - родитель для relatedMemberId
      fromId = newMember.id
      toId = relatedMemberId
    } else if (relationType === 'child' || relationType === 'sibling' || relationType === 'spouse') {
      fromId = relatedMemberId
      toId = newMember.id
    }

    addRelation({
      fromMemberId: fromId,
      toMemberId: toId,
      relationType: relationType === 'child' ? 'parent' : relationType
    })

    currentFamily.value.updatedAt = new Date().toISOString()
    
    // Persist immediately if logged in
    const authStore = useAuthStore()
    if (authStore.userId) {
      await saveCurrentFamily(authStore.userId)
    }
    
    return newMember
  }

  // Новое: Добавление связи
  function addRelation(relation: Omit<FamilyRelation, 'id' | 'createdAt'>) {
    if (!currentFamily.value) return

    const newRelation = createEmptyRelation(
      relation.fromMemberId,
      relation.toMemberId,
      relation.relationType
    )

    // Проверяем на дубликаты
    const exists = currentFamily.value.relations.some(
      r => r.fromMemberId === relation.fromMemberId &&
        r.toMemberId === relation.toMemberId &&
        r.relationType === relation.relationType
    )

    if (!exists) {
      currentFamily.value.relations.push(newRelation)
      currentFamily.value.updatedAt = new Date().toISOString()
    }
  }

  // Новое: Удаление связи
  function removeRelation(relationId: string) {
    if (!currentFamily.value) return

    const index = currentFamily.value.relations.findIndex(r => r.id === relationId)
    if (index !== -1) {
      currentFamily.value.relations.splice(index, 1)
      currentFamily.value.updatedAt = new Date().toISOString()
    }
  }

  // Новое: Удаление всех связей члена
  function removeAllMemberRelations(memberId: string) {
    if (!currentFamily.value) return

    currentFamily.value.relations = currentFamily.value.relations.filter(
      r => r.fromMemberId !== memberId && r.toMemberId !== memberId
    )
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  async function removeMember(memberId: string) {
    if (!currentFamily.value) return

    // Удаляем все связи члена
    removeAllMemberRelations(memberId)

    // Optimistic UI update
    const index = currentFamily.value.members.findIndex(m => m.id === memberId)
    if (index !== -1) {
      currentFamily.value.members.splice(index, 1)
      currentFamily.value.updatedAt = new Date().toISOString()

      if (activeMemberId.value === memberId) {
        activeMemberId.value = currentFamily.value.members[0]?.id || null
      }
    }

    await FamilyRepository.deleteMember(memberId)
  }

  async function removeFamily(slug: string) {
    await FamilyRepository.delete(slug)
    if (currentFamily.value?.id === slug) {
      resetStore()
    }
    userFamilies.value = userFamilies.value.filter(f => f.id !== slug)
    // Also remove from cache
    delete archiveCache.value[slug]
  }

  async function checkSlugAvailability(slug: string) {
    return await FamilyRepository.checkSlugAvailability(slug)
  }

  async function saveCurrentFamily(userId: string) {
    if (!currentFamily.value) return false
    // Don't save demo data
    if (currentFamily.value.id === 'smith-family' || currentFamily.value.id === 'example') {
      return false
    }
    isSaving.value = true
    const success = await FamilyRepository.save(currentFamily.value, userId)
    isSaving.value = false
    return success
  }

  async function loadUserFamilies(userId: string) {
    // Only show loading if we don't have any families yet
    if (userFamilies.value.length === 0) isFetching.value = true
    
    userFamilies.value = await FamilyRepository.getAllByUser(userId)
    
    // Partially populate cache with what we got from getAll
    userFamilies.value.forEach(f => {
      if (!archiveCache.value[f.id]) {
        archiveCache.value[f.id] = f
      }
    })
    
    isFetching.value = false
    return userFamilies.value
  }

  async function loadFamilyBySlug(slug: string, bypassCache = false) {
    // Check cache first
    if (!bypassCache && archiveCache.value[slug]) {
      console.log(`[Store] Serving archive ${slug} from cache`)
      setFamily(archiveCache.value[slug], true) // Mark as from load to skip auto-save trigger
      return archiveCache.value[slug]
    }

    isFetching.value = true
    const family = await FamilyRepository.getBySlug(slug)
    if (family) {
      setFamily(family, true)
    }
    isFetching.value = false
    return family
  }

  async function createArchive(name: string, userId: string) {
    const baseSlug = slugify(name)
    const slug = baseSlug ? `${baseSlug}-${Date.now().toString(36).slice(-4)}` : Date.now().toString(36)

    const newFamily: FamilyArchive = {
      id: slug,
      name: name,
      heroImage: '',
      ownerId: userId,
      members: [],
      relations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await FamilyRepository.save(newFamily, userId)
    // Add to cache
    archiveCache.value[slug] = newFamily
    return newFamily
  }

  async function updateArchiveId(newId: string) {
    if (!currentFamily.value || !newId || currentFamily.value.id === newId) return true
    
    const isAvailable = await FamilyRepository.checkSlugAvailability(newId)
    if (!isAvailable) {
      throw new Error('Этот URL уже занят другим архивом. Пожалуйста, выберите другой.')
    }

    const oldId = currentFamily.value.id
    
    // Update all photo URLs in memory before saving
    const updateUrl = (url: string) => {
      if (!url) return url
      // Replace old slug with new slug in the URL path (specifically for our bucket structure)
      return url.replace(`/${oldId}/`, `/${newId}/`)
    }

    const updatedMembers = currentFamily.value.members.map(m => ({
      ...m,
      photoUrl: updateUrl(m.photoUrl),
      photos: m.photos.map(updateUrl)
    }))

    const updatedFamily = { 
      ...currentFamily.value, 
      id: newId,
      members: updatedMembers 
    }
    
    const authStore = useAuthStore()
    if (!authStore.userId) return false

    // 1. Save with new ID (and updated image paths)
    const success = await FamilyRepository.save(updatedFamily, authStore.userId)
    
    if (success) {
      // 2. Note: Ideally we should move files in Supabase Storage here.
      // But since storage renaming is complex via client, 
      // we at least updated the DB references.
      
      // 3. Delete old ID entry in DB
      await FamilyRepository.delete(oldId)
      
      // 4. Update state
      currentFamily.value = updatedFamily
      delete archiveCache.value[oldId]
      archiveCache.value[newId] = updatedFamily
      
      return true
    }
    return false
  }

  function toggleEditing() {
    isEditing.value = !isEditing.value
  }

  function setViewMode(mode: 'cards' | 'tree') {
    viewMode.value = mode
  }

  function resetStore() {
    currentFamily.value = null
    activeMemberId.value = null
    isFetching.value = false
    isSaving.value = false
    isEditing.value = false
    pendingRelation.value = null
    viewMode.value = 'cards'
    // We don't clear archiveCache here to keep it during the session
  }

  function logoutReset() {
    resetStore()
    archiveCache.value = {}
    userFamilies.value = []
  }

  return {
    // State
    currentFamily,
    activeMemberId,
    userFamilies,
    isLoading,
    isFetching,
    isSaving,
    isEditing,
    pendingRelation,
    viewMode,
    archiveCache,

    // Getters
    familyName,
    members,
    relations,
    activeMember,
    getRelatedMembers,

    // Actions
    setFamily,
    setActiveMember,
    updateMember,
    updateMemberPosition,
    resetAllPositions,
    updateFamilyName,
    addMember,
    addMemberWithRelation,
    addRelation,
    removeRelation,
    removeAllMemberRelations,
    removeMember,
    removeFamily,
    saveCurrentFamily,
    updateArchiveId,
    checkSlugAvailability,
    loadUserFamilies,
    loadFamilyBySlug,
    createArchive,
    toggleEditing,
    setViewMode,
    resetStore,
    logoutReset
  }
})
