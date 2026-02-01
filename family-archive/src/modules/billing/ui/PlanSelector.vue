<script setup lang="ts">
import { useBillingStore } from '../store/billingStore'
import { PLANS } from '../domain/models'
import { Check } from 'lucide-vue-next'

const store = useBillingStore()
</script>

<template>
  <div class="grid md:grid-cols-2 gap-4 mb-8">
    <div 
      v-for="plan in PLANS" 
      :key="plan.id"
      class="relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 flex flex-col"
      :class="[
        store.selectedPlanId === plan.id 
          ? 'bg-gold/10 border-gold shadow-[0_0_20px_rgba(212,175,55,0.2)]' 
          : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
      ]"
      @click="store.selectPlan(plan.id)"
    >
      <!-- Popular Badge -->
      <div v-if="plan.isPopular" class="absolute -top-3 left-6 px-3 py-1 bg-gold text-charcoal text-[10px] font-bold uppercase tracking-wider rounded-full">
        Рекомендуем
      </div>

      <div class="flex justify-between items-start mb-4">
        <div>
          <h3 class="text-xl font-serif text-silk">{{ plan.name }}</h3>
        </div>
        <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors"
          :class="store.selectedPlanId === plan.id ? 'border-gold bg-gold' : 'border-gray-500'"
        >
          <div v-if="store.selectedPlanId === plan.id" class="w-2 h-2 rounded-full bg-charcoal"></div>
        </div>
      </div>

      <div class="text-3xl font-serif text-white mb-6">
        {{ plan.price.toLocaleString() }} {{ plan.currency }} <span class="text-sm text-gray-400 font-sans">/ {{ plan.period }}</span>
      </div>

      <ul class="space-y-3 mt-auto">
        <li v-for="feature in plan.features" :key="feature" class="flex items-start gap-2 text-sm text-gray-300">
          <Check class="w-4 h-4 text-gold shrink-0 mt-0.5" />
          <span>{{ feature }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
