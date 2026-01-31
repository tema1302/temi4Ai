<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import BaseCard from './BaseCard.vue'
import { Check } from 'lucide-vue-next'
import { processPayment } from '@/services/paymentService'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { ref } from 'vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits(['close'])
const store = useSubscriptionStore()
const isProcessing = ref(false)

const handleUpgrade = async (plan: 'guardian' | 'legacy') => {
  isProcessing.value = true
  try {
    const success = await processPayment(plan)
    if (success) {
      await store.fetchSubscription()
      emit('close')
      alert('Подписка успешно обновлена! Спасибо за доверие.')
    } else {
      alert('Ошибка при оплате. Попробуйте еще раз.')
    }
  } finally {
    isProcessing.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-obsidian/90 backdrop-blur-sm" @click="emit('close')"></div>
    
    <!-- Content -->
    <BaseCard class="relative w-full max-w-2xl bg-charcoal border-gold/20 p-8 shadow-2xl animate-fade-in-up">
      <button @click="emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
      
      <div class="text-center mb-8">
        <h2 class="text-3xl font-serif text-silk mb-2">Обновите тариф</h2>
        <p class="text-gray-400">Чтобы сохранить больше историй</p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <!-- Guardian -->
        <div class="p-6 rounded-xl border border-gold/30 bg-gold/5 flex flex-col">
          <div class="mb-4">
            <h3 class="text-xl font-bold text-silk">Хранитель</h3>
            <div class="text-2xl text-gold font-serif mt-1">2 990 ₽ <span class="text-sm text-gray-500">/ год</span></div>
          </div>
          <ul class="space-y-3 mb-6 flex-1">
            <li class="flex gap-2 text-sm text-gray-300"><Check class="w-4 h-4 text-gold"/> Безлимит архивов</li>
            <li class="flex gap-2 text-sm text-gray-300"><Check class="w-4 h-4 text-gold"/> Безлимит фото</li>
            <li class="flex gap-2 text-sm text-gray-300"><Check class="w-4 h-4 text-gold"/> Семейное древо</li>
            <li class="flex gap-2 text-sm text-gray-300"><Check class="w-4 h-4 text-gold"/> Ежегодный бэкап</li>
          </ul>
          <BaseButton :disabled="isProcessing" full @click="handleUpgrade('guardian')">
            {{ isProcessing ? 'Обработка...' : 'Выбрать Хранитель' }}
          </BaseButton>
        </div>

        <!-- Legacy -->
        <div class="p-6 rounded-xl border border-white/10 bg-white/5 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
          <div class="mb-4">
            <h3 class="text-xl font-bold text-silk">Наследие</h3>
            <div class="text-2xl text-white font-serif mt-1">5 990 ₽ <span class="text-sm text-gray-500">/ год</span></div>
          </div>
          <ul class="space-y-3 mb-6 flex-1">
            <li class="flex gap-2 text-sm text-gray-300"><Check class="w-4 h-4 text-gold"/> Всё из Хранителя</li>
            <li class="flex gap-2 text-sm text-gray-300"><Check class="w-4 h-4 text-gold"/> Приоритетная поддержка</li>
            <li class="flex gap-2 text-sm text-gray-300"><Check class="w-4 h-4 text-gold"/> Видео и аудио (скоро)</li>
          </ul>
          <BaseButton variant="secondary" :disabled="isProcessing" full @click="handleUpgrade('legacy')">
            {{ isProcessing ? 'Обработка...' : 'Выбрать Наследие' }}
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<style scoped>
.animate-fade-in-up {
  animation: fadeInUp 0.3s ease-out;
}
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
