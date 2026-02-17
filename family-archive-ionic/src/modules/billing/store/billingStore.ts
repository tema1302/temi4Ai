import { defineStore } from 'pinia'
import { ref } from 'vue'
import { type PlanId, type PaymentMethod, type PaymentStatus, PLANS } from '../domain/models'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useAnalytics } from '@/composables/useAnalytics'

export const useBillingStore = defineStore('billing', () => {
  const subStore = useSubscriptionStore()
  const { trackEvent, trackUpgrade } = useAnalytics()

  const selectedPlanId = ref<PlanId>('guardian')
  const status = ref<PaymentStatus>('idle')
  const error = ref<string | null>(null)
  
  // Fake Transaction ID
  const transactionId = ref<string>('')

  function selectPlan(id: PlanId) {
    selectedPlanId.value = id
    status.value = 'idle'
    error.value = null
  }

  // Эмуляция оплаты картой
  async function payWithCard(cardData: any) {
    status.value = 'processing'
    error.value = null
    
    // Имитация запроса к банку
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Простая валидация "успеха" (например, если CVC != 000)
    if (cardData.cvc !== '000') {
      finalizeSuccess()
    } else {
      status.value = 'failed'
      error.value = 'Банк отклонил транзакцию. Попробуйте другую карту.'
      trackEvent('payment_failed', { method: 'card', reason: 'declined' })
    }
  }

  // Эмуляция СБП (Генерация QR и пуллинг статуса)
  async function initSpbPayment() {
    status.value = 'processing'
    await new Promise(resolve => setTimeout(resolve, 1000)) // Получение ссылки
    
    status.value = 'waiting_for_confirmation'
    transactionId.value = 'spb_' + Math.random().toString(36).substring(7)
    
    // Запускаем поллинг статуса
    pollSpbStatus()
  }

  function pollSpbStatus() {
    if (status.value !== 'waiting_for_confirmation') return

    setTimeout(() => {
      // 30% шанс успеха на каждом тике (для демо)
      if (Math.random() > 0.7) {
        finalizeSuccess()
      } else {
        pollSpbStatus()
      }
    }, 2000)
  }

  function finalizeSuccess() {
    const plan = PLANS.find(p => p.id === selectedPlanId.value)
    
    status.value = 'success'
    // Обновляем глобальную подписку пользователя
    subStore.upgradeTier(selectedPlanId.value)
    
    trackUpgrade(selectedPlanId.value, plan?.price || 0)
    trackEvent('payment_success', { 
      method: status.value === 'waiting_for_confirmation' ? 'spb' : 'card',
      plan: selectedPlanId.value
    })
  }

  function reset() {
    status.value = 'idle'
    error.value = null
    transactionId.value = ''
  }

  return {
    selectedPlanId,
    status,
    error,
    transactionId,
    selectPlan,
    payWithCard,
    initSpbPayment,
    reset
  }
})
