import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { createEmptyMember, deleteFamily, deleteMember } from '@/services/memoryService'

// Types
export interface FamilyMember {
  id: string
  name: string
  birthDate: string
  deathDate?: string
  biography: string
  photoUrl: string
  photos: string[]
  quotes: string[]
}

export interface FamilyData {
  id: string
  familyName: string
  members: FamilyMember[]
  heroImage: string
  createdAt: string
  updatedAt: string
}

export const useMemoryStore = defineStore('memory', () => {
  // State
  const currentFamily = ref<FamilyData | null>(null)
  const activeMemberId = ref<string | null>(null)
  const isLoading = ref(false)
  const isEditing = ref(false)

  // Getters
  const familyName = computed(() => currentFamily.value?.familyName ?? '')
  const members = computed(() => currentFamily.value?.members ?? [])
  
  // Active member is either the one selected by ID, or the first one, or null
  const activeMember = computed(() => {
    if (!currentFamily.value?.members.length) return null
    if (activeMemberId.value) {
      return currentFamily.value.members.find(m => m.id === activeMemberId.value) || currentFamily.value.members[0]
    }
    return currentFamily.value.members[0]
  })

  // For backward compatibility (the viewer mostly shows one person for now)
  const primaryMember = computed(() => members.value[0] ?? null)

  // Actions
  function setFamily(data: FamilyData) {
    currentFamily.value = data
    // Reset active member to first one
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
    activeMemberId.value = newMember.id // Switch to new member
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  async function removeMember(memberId: string) {
    if (!currentFamily.value) return

    // DB delete
    await deleteMember(memberId)

    // Local state delete
    const index = currentFamily.value.members.findIndex(m => m.id === memberId)
    if (index !== -1) {
      currentFamily.value.members.splice(index, 1)
      currentFamily.value.updatedAt = new Date().toISOString()
      
      // If we deleted the active member, switch to another
      if (activeMemberId.value === memberId) {
        activeMemberId.value = currentFamily.value.members[0]?.id || null
      }
    }
  }

  async function removeFamily(slug: string) {
    await deleteFamily(slug)
    if (currentFamily.value?.id === slug) {
      resetStore()
    }
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
    // State
    currentFamily,
    activeMemberId,
    isLoading,
    isEditing,
    // Getters
    familyName,
    members,
    activeMember,
    primaryMember,
    // Actions
    setFamily,
    setActiveMember,
    updateMember,
    addMember,
    removeMember,
    removeFamily,
    toggleEditing,
    resetStore,
  }
})
