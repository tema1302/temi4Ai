<script setup lang="ts">
import { onMounted } from 'vue'
import { useBillingStore } from '../store/billingStore'
import BaseButton from '@/shared/ui/BaseButton.vue'

const store = useBillingStore()

onMounted(() => {
  store.initSpbPayment()
})
</script>

<template>
  <div class="text-center py-6">
    
    <div v-if="store.status === 'processing'" class="py-10">
      <div class="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-gray-400">Генерируем QR-код...</p>
    </div>

    <div v-else class="animate-fade-in">
      <div class="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg relative overflow-hidden">
        <!-- Mock QR Code (CSS Pattern) -->
        <div class="w-48 h-48 bg-black relative">
            <div class="absolute inset-2 border-4 border-white"></div>
            <div class="absolute top-4 left-4 w-10 h-10 bg-white">
                <div class="absolute inset-1 bg-black"></div>
            </div>
            <div class="absolute top-4 right-4 w-10 h-10 bg-white">
                 <div class="absolute inset-1 bg-black"></div>
            </div>
            <div class="absolute bottom-4 left-4 w-10 h-10 bg-white">
                 <div class="absolute inset-1 bg-black"></div>
            </div>
            <!-- Random noise -->
            <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[8px] font-mono leading-none whitespace-pre opacity-50">
                101010101010
                010101010101
                110011001100
                001100110011
            </div>
        </div>
        
        <!-- Logo Overlay -->
        <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md">
            <span class="text-[10px] font-bold text-blue-800">СБП</span>
        </div>
      </div>

      <p class="text-silk font-medium mb-2">Отсканируйте камерой телефона</p>
      <p class="text-gray-400 text-sm mb-6">Или приложением вашего банка</p>

      <div class="flex items-center justify-center gap-2 mb-8">
        <div class="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
        <span class="text-gold text-sm">Ожидаем подтверждения оплаты...</span>
      </div>
      
      <p class="text-xs text-gray-500">ID транзакции: {{ store.transactionId }}</p>
    </div>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
