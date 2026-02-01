<script setup lang="ts">
import { ref, computed } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import { useBillingStore } from '../store/billingStore'
import { CreditCard, Lock } from 'lucide-vue-next'

const store = useBillingStore()

const cardNumber = ref('')
const expiry = ref('')
const cvc = ref('')
const holder = ref('')

// Simple Luhn check simulation / formatting
const formatCardNumber = (e: Event) => {
  let val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  val = val.substring(0, 16)
  val = val.match(/.{1,4}/g)?.join(' ') || val
  cardNumber.value = val
}

const formatExpiry = (e: Event) => {
  let val = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  if (val.length >= 2) {
    val = val.substring(0, 2) + '/' + val.substring(2, 4)
  }
  expiry.value = val
}

const isValid = computed(() => {
  return cardNumber.value.length >= 19 && expiry.value.length === 5 && cvc.value.length === 3 && holder.value.length > 3
})

const handleSubmit = () => {
  if (!isValid.value) return
  store.payWithCard({
    number: cardNumber.value,
    expiry: expiry.value,
    cvc: cvc.value,
    holder: holder.value
  })
}
</script>

<template>
  <div class="space-y-4">
    <div class="relative">
      <CreditCard class="absolute left-4 top-3.5 text-gray-500 w-5 h-5" />
      <input 
        :value="cardNumber"
        @input="formatCardNumber"
        type="text" 
        placeholder="0000 0000 0000 0000"
        class="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors font-mono"
        maxlength="19"
      />
    </div>

    <div class="grid grid-cols-2 gap-4">
      <input 
        :value="expiry"
        @input="formatExpiry"
        type="text" 
        placeholder="MM/YY"
        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors text-center"
        maxlength="5"
      />
      <input 
        v-model="cvc"
        type="text" 
        placeholder="CVC"
        class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors text-center"
        maxlength="3"
      />
    </div>

    <input 
      v-model="holder"
      type="text" 
      placeholder="ИМЯ НА КАРТЕ"
      class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk focus:outline-none focus:border-gold/50 transition-colors uppercase"
    />

    <div class="flex items-center gap-2 text-xs text-gray-500 justify-center py-2">
      <Lock class="w-3 h-3" />
      Платежи защищены SSL-шифрованием
    </div>

    <BaseButton 
      full 
      :disabled="!isValid || store.status === 'processing'"
      @click="handleSubmit"
    >
      <span v-if="store.status === 'processing'">Обработка...</span>
      <span v-else>Оплатить картой</span>
    </BaseButton>
    
    <p v-if="store.error" class="text-red-400 text-sm text-center">{{ store.error }}</p>
  </div>
</template>
