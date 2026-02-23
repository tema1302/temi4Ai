import { useGtag } from 'vue-gtag-next'
import { AnalyticsRepository } from '@/modules/admin/api/repository'
import { useAuthStore } from '@/stores/authStore'

declare global {
  interface Window {
    dataLayer: any[]
  }
}

export function useAnalytics() {
  const { event } = useGtag()
  
  const pushToDataLayer = (event_name: string, params: Record<string, any> = {}) => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || []
      window.dataLayer.push({
        event: event_name,
        ...params
      })
    }
  }

  const trackEvent = (name: string, params: Record<string, any> = {}) => {
    // Check if analytics is enabled (e.g. via cookie consent)
    const consent = localStorage.getItem('cookie-consent')
    
    // Always log to console in dev or if specific debug flag is set
    if (import.meta.env.DEV) {
      console.log('[Analytics]', name, params)
    }

    // 1. Internal Analytics (Self-hosted) - Always track minimal stats
    try {
       // Only track key metrics internally to save DB space
       const trackedInternally = ['page_view', 'sign_up', 'login', 'create_archive', 'purchase', 'cta_click']
       if (trackedInternally.includes(name) || name.startsWith('cta_')) {
          const authStore = useAuthStore() // Access store inside action to avoid early init issues
          AnalyticsRepository.logEvent(name, params, authStore.userId || undefined)
       }
    } catch (e) {
      console.warn('Internal analytics failed', e)
    }

    if (consent === 'accepted') {
      try {
        // 2. Direct GA4 Event (via vue-gtag)
        event(name, params)
        
        // 3. GTM Data Layer Event
        pushToDataLayer(name, params)
      } catch (e) {
        console.warn('External Analytics event failed', e)
      }
    }
  }

  const trackSignUp = (method: string = 'email') => {
    trackEvent('sign_up', { method })
  }

  const trackLogin = (method: string = 'email') => {
    trackEvent('login', { method })
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

  const trackFeatureUse = (feature: string, details?: Record<string, any>) => {
    trackEvent('feature_use', { feature_name: feature, ...details })
  }
  
  const trackPageScroll = (sectionId: string, depthPercentage: number) => {
    trackEvent('scroll_tracking', { section: sectionId, depth: depthPercentage })
  }

  const trackCtaClick = (location: string, label: string) => {
    trackEvent('cta_click', { location, label })
  }

  return {
    trackEvent,
    trackSignUp,
    trackLogin,
    trackArchiveCreation,
    trackUpgrade,
    trackFeatureUse,
    trackPageScroll,
    trackCtaClick
  }
}