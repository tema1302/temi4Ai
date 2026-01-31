import { supabase } from '@/lib/supabase'

export interface PaymentIntent {
  amount: number
  currency: string
  planId: 'guardian' | 'legacy'
}

// Mock payment processing
export const processPayment = async (planId: 'guardian' | 'legacy'): Promise<boolean> => {
  return new Promise((resolve) => {
    console.log(`Processing payment for ${planId}...`)
    
    // Simulate network delay
    setTimeout(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User not logged in')

        // In a real app, this would be a backend webhook.
        // For prototype, we update the profile directly (assuming RLS allows it or we are admin)
        // Note: In production, NEVER allow client-side subscription updates.
        const { error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            subscription_tier: planId,
            subscription_status: 'active',
            subscription_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
          })

        if (error) throw error

        resolve(true)
      } catch (err) {
        console.error('Payment failed', err)
        resolve(false)
      }
    }, 1500)
  })
}
