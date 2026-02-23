import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ArchiveRole, ROLE_CAPABILITIES, type Capability } from '../constants/roles'
import type { AccessMember, AccessRequest } from '../types'

export const usePermissionsStore = defineStore('permissions', () => {
  // State
  const userRole = ref<ArchiveRole | null>(null)
  const members = ref<AccessMember[]>([])
  const requests = ref<AccessRequest[]>([])
  const isLoading = ref(false)

  // Getters
  const currentCapabilities = computed(() => {
    if (!userRole.value) return []
    return ROLE_CAPABILITIES[userRole.value] || []
  })

  const can = computed(() => (capability: Capability) => {
    return currentCapabilities.value.includes(capability)
  })

  // Basic flags for cleaner templates
  const isOwner = computed(() => userRole.value === ArchiveRole.OWNER)
  const canEdit = computed(() => can.value('canEditTree'))
  const canManage = computed(() => can.value('canManageUsers'))

  // Actions
  async function fetchPermissions(archiveId: string) {
    isLoading.value = true
    try {
      // API Call Placeholder
      // const response = await AccessRepository.getPermissions(archiveId)
      // userRole.value = response.role
      // members.value = response.members
      
      // For MVP Demo, default to OWNER if you are the user
      // This will be replaced by actual Supabase/DB logic
      userRole.value = ArchiveRole.OWNER 
    } finally {
      isLoading.value = false
    }
  }

  function resetPermissions() {
    userRole.value = null
    members.value = []
    requests.value = []
  }

  return {
    userRole,
    members,
    requests,
    isLoading,
    isOwner,
    canEdit,
    canManage,
    can,
    fetchPermissions,
    resetPermissions
  }
})
