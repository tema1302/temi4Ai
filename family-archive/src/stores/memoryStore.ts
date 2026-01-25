import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

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
  const isLoading = ref(false)
  const isEditing = ref(false)

  // Getters
  const familyName = computed(() => currentFamily.value?.familyName ?? '')
  const members = computed(() => currentFamily.value?.members ?? [])
  const primaryMember = computed(() => members.value[0] ?? null)

  // Actions
  function setFamily(data: FamilyData) {
    currentFamily.value = data
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

  function addMember(member: FamilyMember) {
    if (!currentFamily.value) return
    currentFamily.value.members.push(member)
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  function toggleEditing() {
    isEditing.value = !isEditing.value
  }

  function resetStore() {
    currentFamily.value = null
    isLoading.value = false
    isEditing.value = false
  }

  return {
    // State
    currentFamily,
    isLoading,
    isEditing,
    // Getters
    familyName,
    members,
    primaryMember,
    // Actions
    setFamily,
    updateMember,
    addMember,
    toggleEditing,
    resetStore,
  }
})
