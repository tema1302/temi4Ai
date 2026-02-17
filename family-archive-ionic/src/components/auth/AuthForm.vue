<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { useAnalytics } from '@/composables/useAnalytics'

const authStore = useAuthStore()
const router = useRouter()
const { trackSignUp, trackLogin } = useAnalytics()

const isLoginMode = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

// Legal checkboxes
const acceptOffer = ref(false)
const acceptPD = ref(false)
const acceptNewsletter = ref(false)

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

  if (!isLoginMode.value) {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Пароли не совпадают'
      return
    }
    if (!acceptOffer.value || !acceptPD.value || !acceptNewsletter.value) {
      errorMessage.value = 'Необходимо принять все условия для продолжения'
      return
    }
  }

  isSubmitting.value = true

  try {
    let result
    if (isLoginMode.value) {
      result = await authStore.signIn(email.value, password.value)
      if (result.success) {
        trackLogin('email')
      }
    } else {
      result = await authStore.signUp(email.value, password.value)
      if (result.success) {
        trackSignUp('email')
      }
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
      
      <!-- ... (error message) ... -->
      <div v-if="errorMessage" class="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-5">
        
        <!-- ... (inputs) ... -->
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
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm text-gray-400">Пароль</label>
            <button 
              v-if="isLoginMode"
              type="button"
              class="text-xs text-gray-500 hover:text-gold transition-colors"
              @click="errorMessage = 'Функционал восстановления пароля будет доступен скоро'"
            >
              Забыли пароль?
            </button>
          </div>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
          />
        </div>

        <!-- Confirm Password -->
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

        <!-- Registration Checkboxes -->
        <div v-if="!isLoginMode" class="space-y-4 py-2">
          <label class="flex items-start gap-3 cursor-pointer group">
            <input 
              v-model="acceptOffer"
              type="checkbox" 
              class="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50"
            />
            <span class="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Я ознакомлен с условиями 
              <router-link to="/offer" class="text-gold hover:underline" @click.stop>Публичной оферты</router-link>
            </span>
          </label>

          <label class="flex items-start gap-3 cursor-pointer group">
            <input 
              v-model="acceptPD"
              type="checkbox" 
              class="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50"
            />
            <span class="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Я даю согласие на 
              <router-link to="/pd-consent" class="text-gold hover:underline" @click.stop>Обработку персональных данных</router-link> 
              в соответствии с 
              <router-link to="/pd-policy" class="text-gold hover:underline" @click.stop>Политикой обработки персональных данных</router-link>
            </span>
          </label>

          <label class="flex items-start gap-3 cursor-pointer group">
            <input 
              v-model="acceptNewsletter"
              type="checkbox" 
              class="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50"
            />
            <span class="text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Я даю 
              <router-link to="/newsletter-consent" class="text-gold hover:underline" @click.stop>Согласие на получение информационно-рекламных рассылок</router-link>
            </span>
          </label>
        </div>

        <!-- Submit Button -->
        <BaseButton 
          type="submit" 
          full
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Подождите...' : (isLoginMode ? 'Войти' : 'Зарегистрироваться') }}
        </BaseButton>

      </form>

      <!-- Toggle Mode -->
      <div class="mt-6 text-center">
        <p class="text-gray-400 text-sm">
          {{ isLoginMode ? "Нет аккаунта?" : 'Уже есть аккаунт?' }}
          <button 
            @click="toggleMode"
            class="text-gold hover:text-white transition-colors font-bold ml-1"
          >
            {{ isLoginMode ? "Создать" : "Войти" }}
          </button>
        </p>
      </div>

    </BaseCard>
  </div>
</template>
