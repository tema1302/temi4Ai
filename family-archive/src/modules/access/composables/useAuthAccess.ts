import { computed } from 'vue'
import { usePermissionsStore } from '../store/usePermissionsStore'
import type { Capability } from '../constants/roles'

export function useAuthAccess() {
  const store = usePermissionsStore()

  // Capabilities check
  const canEditTree = computed(() => store.isOwner || store.canEdit)
  const canManageUsers = computed(() => store.isOwner || store.canManage)
  const canDeleteNodes = computed(() => store.isOwner || store.canEdit) // Later can be fine-tuned
  const canEditContent = computed(() => store.can('canEditContent'))

  // UI state-based properties
  const isOwner = computed(() => store.isOwner)
  const currentRole = computed(() => store.userRole)

  // API Guard
  const verifyAccess = (requiredCapability: Capability): boolean => {
    const hasAccess = store.can(requiredCapability)
    if (!hasAccess) {
      console.warn(`[Access] Access denied for capability: ${requiredCapability}`)
      // Trigger global toast if needed
    }
    return hasAccess
  }

  return {
    isOwner,
    currentRole,
    canEditTree,
    canManageUsers,
    canDeleteNodes,
    canEditContent,
    verifyAccess
  }
}
