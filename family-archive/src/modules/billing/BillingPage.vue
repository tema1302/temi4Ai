<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import PlanSelector from './ui/PlanSelector.vue'
import PaymentForm from './ui/PaymentForm.vue'
import SpbPayment from './ui/SpbPayment.vue'
import { useBillingStore } from './store/billingStore'
import { CreditCard, QrCode, CheckCircle, ArrowLeft } from 'lucide-vue-next'

const router = useRouter()
const store = useBillingStore()
const activeTab = ref<'card' | 'spb'>('card')

const goBack = () => {
  store.reset()
  router.back()
}

const goToDashboard = () => {
  store.reset()
  router.push('/editor')
}
</script>

<template>
  <MainLayout>
    <div class="min-h-screen py-12 px-4 flex flex-col items-center">
      
      <!-- Back Link -->
      <div class="w-full max-w-4xl mb-8">
        <button @click="goBack" class="text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
          <ArrowLeft class="w-4 h-4" /> Назад
        </button>
      </div>

      <!-- Success State -->
      <div v-if="store.status === 'success'" class="text-center animate-fade-in py-20">
        <div class="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle class="w-12 h-12 text-green-500" />
        </div>
        <h1 class="text-4xl font-serif text-silk mb-4">Оплата прошла успешно!</h1>
        <p class="text-gray-400 text-lg mb-8">Ваш тариф обновлен. Спасибо, что вы с нами.</p>
        <button 
          @click="goToDashboard"
          class="px-8 py-3 bg-gold text-charcoal font-bold rounded-lg hover:bg-white transition-colors"
        >
          Вернуться к архиву
        </button>
      </div>

      <!-- Billing Content -->
      <div v-else class="w-full max-w-4xl grid md:grid-cols-2 gap-12">
        
        <!-- Left: Plan Selection -->
        <div>
          <h1 class="text-3xl font-serif text-silk mb-2">Выберите тариф</h1>
          <p class="text-gray-400 mb-8">Инвестируйте в память вашей семьи.</p>
          <PlanSelector />
        </div>

        <!-- Right: Payment Method -->
        <div>
          <BaseCard class="p-8 sticky top-8">
            <h2 class="text-xl font-serif text-silk mb-6">Оплата</h2>

            <!-- Tabs -->
            <div class="flex p-1 bg-white/5 rounded-lg mb-8">
              <button 
                class="flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all"
                :class="activeTab === 'card' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'"
                @click="activeTab = 'card'"
              >
                <CreditCard class="w-4 h-4" /> Карта
              </button>
              <button 
                class="flex-1 py-2 text-sm font-medium rounded-md flex items-center justify-center gap-2 transition-all"
                :class="activeTab === 'spb' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'"
                @click="activeTab = 'spb'"
              >
                <QrCode class="w-4 h-4" /> СБП
              </button>
            </div>

            <!-- Forms -->
            <div v-if="activeTab === 'card'">
              <PaymentForm />
            </div>
            <div v-else>
              <SpbPayment />
            </div>

            <!-- Footer Secure Info -->
            <div class="mt-8 pt-6 border-t border-white/5 text-center">
              <p class="text-[10px] text-gray-500 leading-relaxed">
                Нажимая кнопку оплаты, вы соглашаетесь с условиями рекуррентных платежей. 
                Отменить подписку можно в любой момент в личном кабинете.
              </p>
            </div>
          </BaseCard>
        </div>

      </div>
    </div>
  </MainLayout>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
