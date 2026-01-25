<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
}

const handleSubmit = async () => {
  errorMessage.value = ''
  
  if (!email.value || !password.value) {
    errorMessage.value = 'Пожалуйста, заполните все поля'
    return
  }

  if (!isLoginMode.value && password.value !== confirmPassword.value) {
    errorMessage.value = 'Пароли не совпадают'
    return
  }

  isSubmitting.value = true

  try {
    let result
    if (isLoginMode.value) {
      result = await authStore.signIn(email.value, password.value)
    } else {
      result = await authStore.signUp(email.value, password.value)
    }

    if (result.success) {
      router.push('/editor')
    } else {
      errorMessage.value = result.error || 'Ошибка авторизации'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4">
    <BaseCard class="w-full max-w-md p-8">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-serif text-silk mb-2">
          {{ isLoginMode ? 'С возвращением' : 'Создать аккаунт' }}
        </h1>
        <p class="text-gray-400">
          {{ isLoginMode ? 'Войдите, чтобы управлять архивами' : 'Начните сохранять историю вашей семьи' }}
        </p>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        
        <!-- Email -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
          />
        </div>

        <!-- Password -->
        <div>
          <label class="block text-sm text-gray-400 mb-2">Пароль</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
          />
        </div>

        <!-- Confirm Password (Register only) -->
        <div v-if="!isLoginMode">
          <label class="block text-sm text-gray-400 mb-2">Подтвердите пароль</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
          />
        </div>

        <!-- Submit Button -->
        <BaseButton 
          type="submit" 
          class="w-full"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Подождите...' : (isLoginMode ? 'Войти' : 'Зарегистрироваться') }}
        </BaseButton>

      </form>

      <!-- Toggle Mode -->
      <div class="mt-6 text-center">
        <button 
          @click="toggleMode"
          class="text-gray-400 hover:text-gold transition-colors text-sm"
        >
          {{ isLoginMode ? "Нет аккаунта? Создать" : 'Уже есть аккаунт? Войти' }}
        </button>
      </div>

    </BaseCard>
  </div>
</template>
