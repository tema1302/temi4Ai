export type PlanId = 'free' | 'guardian' | 'legacy'
export type PaymentMethod = 'card' | 'spb'
export type PaymentStatus = 'idle' | 'processing' | 'waiting_for_confirmation' | 'success' | 'failed'

export interface PricingPlan {
  id: PlanId
  name: string
  price: number
  currency: string
  period: string
  features: string[]
  isPopular?: boolean
}

export const PLANS: PricingPlan[] = [
  {
    id: 'guardian',
    name: 'Хранитель',
    price: 2990,
    currency: '₽',
    period: 'год',
    features: ['Безлимитные страницы', 'Семейное древо', 'Безлимитные фото', 'Приоритетная поддержка'],
    isPopular: true
  },
  {
    id: 'legacy',
    name: 'Наследие',
    price: 3990,
    currency: '₽',
    period: 'год',
    features: ['Всё из тарифа Хранитель', 'Видео и аудио истории', 'Ежегодный бэкап архива на почту', 'Персональный менеджер'],
    isPopular: false
  }
]
