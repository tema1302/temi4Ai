import { computed } from 'vue'
import { useSubscriptionStore } from '@/stores/subscriptionStore'

export function useSubscription() {
  const store = useSubscriptionStore()

  const limits = {
    basic: {
      families: 1,
      photosPerFamily: 30,
      hasTree: false,
      hasBackup: false
    },
    guardian: {
      families: Infinity,
      photosPerFamily: Infinity,
      hasTree: true,
      hasBackup: true
    },
    legacy: {
      families: Infinity,
      photosPerFamily: Infinity,
      hasTree: true,
      hasBackup: true
    }
  }

  const currentLimits = computed(() => limits[store.tier || 'basic'])

  const canAddFamily = (currentCount: number) => {
    return currentCount < currentLimits.value.families
  }

  const canAddPhoto = (currentCount: number) => {
    return currentCount < currentLimits.value.photosPerFamily
  }

  const hasTreeAccess = computed(() => currentLimits.value.hasTree)
  const hasBackupAccess = computed(() => currentLimits.value.hasBackup)

  return {
    tier: computed(() => store.tier),
    isPremium: store.isPremium,
    canAddFamily,
    canAddPhoto,
    hasTreeAccess,
    hasBackupAccess,
    limits: currentLimits
  }
}
