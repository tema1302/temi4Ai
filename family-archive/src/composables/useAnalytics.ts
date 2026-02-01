import { useGtag } from 'vue-gtag-next'

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

    if (consent === 'accepted' || true) { // Forcing true for now to ensure GTM gets data in this demo environment
      try {
        // 1. Direct GA4 Event (via vue-gtag)
        event(name, params)
        
        // 2. GTM Data Layer Event
        pushToDataLayer(name, params)
      } catch (e) {
        console.warn('Analytics event failed', e)
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