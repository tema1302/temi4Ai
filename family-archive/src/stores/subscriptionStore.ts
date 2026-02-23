import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './authStore'

export type SubscriptionTier = 'basic' | 'guardian' | 'legacy'

export const useSubscriptionStore = defineStore('subscription', () => {
  const authStore = useAuthStore()
  
  const tier = ref<SubscriptionTier>('basic')
  const status = ref<string>('active')
  const isLoading = ref(false)

  const isPremium = computed(() => tier.value === 'guardian' || tier.value === 'legacy')

  async function fetchSubscription() {
    if (!authStore.userId) return

    isLoading.value = true
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status')
        .eq('id', authStore.userId)
        .single()

      if (data) {
        tier.value = data.subscription_tier as SubscriptionTier
        status.value = data.subscription_status
      } else if (error && error.code !== 'PGRST116') {
         // PGRST116 is "Row not found", which might happen if profile trigger didn't run.
         // In that case, default to basic is fine.
         console.error('Error fetching subscription:', error)
      }
    } catch (e) {
      console.error('Subscription fetch error:', e)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update user subscription tier (optimistic + remote)
   */
  async function upgradeTier(newTier: SubscriptionTier) {
    if (!authStore.userId) return

    // Optimistic update
    const oldTier = tier.value
    tier.value = newTier

    const { error } = await supabase
      .from('profiles')
      .update({ 
        subscription_tier: newTier,
        updated_at: new Date().toISOString()
      })
      .eq('id', authStore.userId)

    if (error) {
      console.error('Failed to upgrade tier:', error)
      tier.value = oldTier // Rollback
    }
  }

  // Watch for auth changes to re-fetch
  authStore.$subscribe((mutation, state) => {
    if (state.user) {
      fetchSubscription()
    } else {
      tier.value = 'basic'
    }
  })

  return {
    tier,
    status,
    isLoading,
    isPremium,
    fetchSubscription,
    upgradeTier
  }
})
