import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FamilyRepository } from '../api/repository'
import { type FamilyArchive, type FamilyMember, createEmptyMember } from '../domain/models'

export const useMemoryStore = defineStore('memory', () => {
  // State
  const currentFamily = ref<FamilyArchive | null>(null)
  const activeMemberId = ref<string | null>(null)
  const isLoading = ref(false)
  const isEditing = ref(false)
  const userFamilies = ref<FamilyArchive[]>([]) // New: Store list of families

  // Getters
  const familyName = computed(() => currentFamily.value?.name ?? '')
  const members = computed(() => currentFamily.value?.members ?? [])
  
  const activeMember = computed(() => {
    if (!currentFamily.value?.members.length) return null
    if (activeMemberId.value) {
      return currentFamily.value.members.find(m => m.id === activeMemberId.value) || currentFamily.value.members[0]
    }
    return currentFamily.value.members[0]
  })

  // Actions
  function setFamily(data: FamilyArchive) {
    currentFamily.value = data
    if (data.members.length > 0) {
      activeMemberId.value = data.members[0].id
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

  function addMember() {
    if (!currentFamily.value) return
    const newMember = createEmptyMember()
    newMember.name = 'Новый член семьи'
    currentFamily.value.members.push(newMember)
    activeMemberId.value = newMember.id
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  async function removeMember(memberId: string) {
    if (!currentFamily.value) return

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
    // Update list if exists
    userFamilies.value = userFamilies.value.filter(f => f.id !== slug)
  }
  
  async function saveCurrentFamily(userId: string) {
    if (!currentFamily.value) return false
    isLoading.value = true
    const success = await FamilyRepository.save(currentFamily.value, userId)
    isLoading.value = false
    return success
  }

  async function loadUserFamilies(userId: string) {
    isLoading.value = true
    userFamilies.value = await FamilyRepository.getAllByUser(userId)
    isLoading.value = false
    return userFamilies.value
  }

  async function loadFamilyBySlug(slug: string) {
    isLoading.value = true
    const family = await FamilyRepository.getBySlug(slug)
    if (family) {
      setFamily(family)
    }
    isLoading.value = false
    return family
  }

  async function createArchive(name: string, userId: string) {
     // Generate generic slug
     const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36)
     
     const newFamily: FamilyArchive = {
       id: slug,
       name: name,
       heroImage: '',
       members: [],
       createdAt: new Date().toISOString(),
       updatedAt: new Date().toISOString()
     }
     
     // Save immediately to persist
     await FamilyRepository.save(newFamily, userId)
     return newFamily
  }

  function toggleEditing() {
    isEditing.value = !isEditing.value
  }

  function resetStore() {
    currentFamily.value = null
    activeMemberId.value = null
    isLoading.value = false
    isEditing.value = false
  }

  return {
    currentFamily,
    activeMemberId,
    userFamilies,
    isLoading,
    isEditing,
    familyName,
    members,
    activeMember,
    setFamily,
    setActiveMember,
    updateMember,
    addMember,
    removeMember,
    removeFamily,
    saveCurrentFamily,
    loadUserFamilies,
    loadFamilyBySlug,
    createArchive,
    toggleEditing,
    resetStore,
  }
})