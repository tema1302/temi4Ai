import { useGtag } from 'vue-gtag-next'

export function useAnalytics() {
  const { event } = useGtag()
  
  const trackEvent = (name: string, params: Record<string, any> = {}) => {
    // Check if analytics is enabled (e.g. via cookie consent)
    const consent = localStorage.getItem('cookie-consent')
    if (consent === 'accepted') {
      try {
        event(name, params)
      } catch (e) {
        console.warn('Analytics event failed', e)
      }
    } else {
      console.log('[Analytics Mock]', name, params)
    }
  }

  const trackSignUp = (method: string = 'email') => {
    trackEvent('sign_up', { method })
  }

  const trackArchiveCreation = (familyId: string) => {
    trackEvent('create_archive', { family_id: familyId })
  }

  const trackUpgrade = (plan: string, value: number) => {
    trackEvent('purchase', { 
      currency: 'RUB',
      value: value,
      items: [{ item_name: plan, price: value }]
    })
  }

  const trackFeatureUse = (feature: string) => {
    trackEvent('feature_use', { feature_name: feature })
  }

  return {
    trackEvent,
    trackSignUp,
    trackArchiveCreation,
    trackUpgrade,
    trackFeatureUse
  }
}
