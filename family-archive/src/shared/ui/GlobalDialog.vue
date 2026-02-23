<script setup lang="ts">
import { useDialogStore } from '@/stores/dialogStore'
import BaseButton from './BaseButton.vue'
import BaseCard from './BaseCard.vue'
import BaseInput from './BaseInput.vue'
import { AlertCircle, HelpCircle, FileEdit, X } from 'lucide-vue-next'
import { ref, watch, nextTick } from 'vue'

const store = useDialogStore()
const inputRef = ref<any>(null)

// Focus input when prompt opens
watch(() => store.state.isOpen, (isOpen) => {
  if (isOpen && store.state.type === 'prompt') {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

const handleConfirm = () => {
  if (store.state.type === 'prompt') {
    store.close(store.state.inputValue)
  } else if (store.state.type === 'confirm') {
    store.close(true)
  } else {
    store.close(null)
  }
}

const handleCancel = () => {
  if (store.state.type === 'confirm' || store.state.type === 'prompt') {
    store.close(false)
  } else {
    store.close(null)
  }
}

const getIcon = () => {
  switch (store.state.type) {
    case 'alert': return AlertCircle
    case 'confirm': return HelpCircle
    case 'prompt': return FileEdit
    default: return AlertCircle
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="store.state.isOpen" class="fixed inset-0 z-[200] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-obsidian/90 backdrop-blur-md" @click="handleCancel"></div>
        
        <!-- Dialog Card -->
        <BaseCard class="w-full max-w-md relative z-10 p-8 shadow-2xl border-white/10 animate-scale-up">
          <!-- Header -->
          <div class="flex items-start justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-gold/10 flex items-center justify-center">
                <component :is="getIcon()" class="w-5 h-5 text-gold" />
              </div>
              <h3 class="text-xl font-serif text-silk">{{ store.state.title }}</h3>
            </div>
            <button @click="handleCancel" class="text-gray-500 hover:text-silk transition-colors">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Message -->
          <div class="mb-8">
            <p class="text-gray-400 leading-relaxed">{{ store.state.message }}</p>
          </div>

          <!-- Prompt Input -->
          <div v-if="store.state.type === 'prompt'" class="mb-8">
            <BaseInput
              v-model="store.state.inputValue"
              :placeholder="store.state.placeholder"
              ref="inputRef"
              @keyup.enter="handleConfirm"
              @keyup.escape="handleCancel"
              class="w-full"
            />
          </div>

          <!-- Actions -->
          <div class="flex gap-4">
            <BaseButton 
              v-if="store.state.type !== 'alert'" 
              variant="ghost" 
              full 
              @click="handleCancel"
            >
              {{ store.state.cancelText }}
            </BaseButton>
            <BaseButton 
              variant="primary" 
              full 
              @click="handleConfirm"
              :class="{ 'bg-gold hover:bg-white text-charcoal': store.state.type === 'confirm' }"
            >
              {{ store.state.confirmText }}
            </BaseButton>
          </div>
        </BaseCard>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes scaleUp {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
</style>
