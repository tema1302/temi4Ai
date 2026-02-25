<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import { useAnalytics } from '@/composables/useAnalytics'
import {
  Check,
  X,
  Play
} from 'lucide-vue-next'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { trackSignUp, trackLogin } = useAnalytics()

const isLoginMode = ref(true)
const isForgotPasswordMode = ref(false)
const isResetPasswordMode = ref(false)
const showSuccess = ref(false)
const successTitle = ref('')
const successMessage = ref('')

const email = ref('')
const password = ref('')
const fullName = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const isSubmitting = ref(false)

// Legal checkboxes
const acceptOffer = ref(false)
const acceptPD = ref(false)
const acceptNewsletter = ref(false)

onMounted(() => {
  // Handle password recovery
  if (route.query.type === 'recovery') {
    isResetPasswordMode.value = true
    isLoginMode.value = false
  }
  // Handle mode query param for login/signup
  if (route.query.mode === 'signup') {
    isLoginMode.value = false
  } else if (route.query.mode === 'login') {
    isLoginMode.value = true
  }
})

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  isForgotPasswordMode.value = false
  errorMessage.value = ''
  fullName.value = ''
}

const toggleForgotPassword = () => {
  isForgotPasswordMode.value = !isForgotPasswordMode.value
  isLoginMode.value = !isForgotPasswordMode.value
  errorMessage.value = ''
}

const handleSubmit = async () => {
  if (isSubmitting.value) return
  errorMessage.value = ''
  
  if (isForgotPasswordMode.value) {
    if (!email.value) {
      errorMessage.value = 'Пожалуйста, введите Email'
      return
    }
  } else if (!isResetPasswordMode.value) {
    if (isLoginMode.value) {
      if (!email.value || !password.value) {
        errorMessage.value = 'Пожалуйста, заполните все поля'
        return
      }
    } else {
      if (!email.value || !password.value || !fullName.value) {
        errorMessage.value = 'Пожалуйста, заполните все поля, включая имя'
        return
      }
    }
  } else {
    if (!password.value) {
      errorMessage.value = 'Пожалуйста, введите новый пароль'
      return
    }
  }

  if (!isLoginMode.value && !isForgotPasswordMode.value) {
    if (password.value !== confirmPassword.value) {
      errorMessage.value = 'Пароли не совпадают'
      return
    }
    
    if (!isResetPasswordMode.value && (!acceptOffer.value || !acceptPD.value || !acceptNewsletter.value)) {
      errorMessage.value = 'Необходимо принять все условия для продолжения'
      return
    }
  }

  isSubmitting.value = true

  try {
    let result
    
    if (isForgotPasswordMode.value) {
      result = await authStore.resetPassword(email.value)
      if (result.success) {
        successTitle.value = 'Письмо отправлено'
        successMessage.value = 'Инструкции по восстановлению пароля отправлены на ваш Email.'
        showSuccess.value = true
      }
    } else if (isResetPasswordMode.value) {
      result = await authStore.updatePassword(password.value)
      if (result.success) {
        successTitle.value = 'Пароль изменен'
        successMessage.value = 'Ваш пароль был успешно обновлен. Теперь вы можете войти с новым паролем.'
        showSuccess.value = true
      }
    } else if (isLoginMode.value) {
      result = await authStore.signIn(email.value, password.value)
      if (result.success) {
        trackLogin('email')
      }
    } else {
      result = await authStore.signUp(email.value, password.value, fullName.value)
      if (result.success) {
        trackSignUp('email')
        successTitle.value = 'Спасибо за регистрацию!'
        successMessage.value = 'Мы отправили вам на почту письмо для подтверждения вашего email. Вы можете продолжить работу прямо сейчас, но подтверждение обязательно для полной безопасности.'
        showSuccess.value = true
      }
    }

    if (result && result.success && isLoginMode.value && !isForgotPasswordMode.value && !isResetPasswordMode.value) {
       router.push('/editor')
    } else if (result && !result.success) {
      errorMessage.value = result.error || 'Ошибка'
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleSuccessContinue = () => {
  if (isResetPasswordMode.value || isForgotPasswordMode.value) {
    isResetPasswordMode.value = false
    isForgotPasswordMode.value = false
    isLoginMode.value = true
    showSuccess.value = false
    router.replace({ query: {} })
  } else {
    router.push('/editor')
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center px-4 relative">
    <!-- Back Button -->
    <div class="absolute top-6 left-6">
      <BackButton to="/" />
    </div>

    <!-- Success State -->
    <BaseCard v-if="showSuccess" class="w-full max-w-md p-8 text-center">
       <div class="w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
         <Check class="w-8 h-8" />
       </div>
       <h2 class="text-2xl font-serif text-silk mb-4">{{ successTitle }}</h2>
       <p class="text-gray-400 mb-8 leading-relaxed">
         {{ successMessage }}
       </p>
       <BaseButton full @click="handleSuccessContinue">
         {{ isResetPasswordMode || isForgotPasswordMode ? 'Войти' : 'Продолжить' }}
       </BaseButton>
    </BaseCard>

    <BaseCard v-else class="w-full max-w-md p-8">
      
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-serif text-silk mb-2">
          <template v-if="isForgotPasswordMode">Восстановление пароля</template>
          <template v-else-if="isResetPasswordMode">Новый пароль</template>
          <template v-else>{{ isLoginMode ? 'Вход' : 'Создать аккаунт' }}</template>
        </h1>
        <p class="text-gray-400">
          <template v-if="isForgotPasswordMode">Введите email для получения ссылки</template>
          <template v-else-if="isResetPasswordMode">Установите новый пароль для входа</template>
          <template v-else>{{ isLoginMode ? 'Войдите, чтобы управлять архивами' : 'Начните сохранять историю вашей семьи' }}</template>
        </p>
      </div>
      
      <div v-if="errorMessage" class="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-5" autocomplete="on">
        
        <!-- Name (Registration only) -->
        <div v-if="!isLoginMode && !isForgotPasswordMode && !isResetPasswordMode">
          <label class="block text-sm text-gray-400 mb-2">Ваше имя</label>
          <input
            v-model="fullName"
            type="text"
            placeholder="Иван Иванов"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
            autocomplete="name"
          />
        </div>

        <!-- Email -->
        <div v-if="!isResetPasswordMode">
          <label class="block text-sm text-gray-400 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
            autocomplete="email"
          />
        </div>

        <!-- Password -->
        <div v-if="!isForgotPasswordMode">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm text-gray-400">
              {{ isResetPasswordMode ? 'Новый пароль' : 'Пароль' }}
            </label>
            <button 
              v-if="isLoginMode"
              type="button"
              class="text-xs text-gray-500 hover:text-gold transition-colors"
              @click="toggleForgotPassword"
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
            :autocomplete="isLoginMode ? 'current-password' : 'new-password'"
          />
        </div>

        <!-- Confirm Password -->
        <div v-if="!isLoginMode && !isForgotPasswordMode">
          <label class="block text-sm text-gray-400 mb-2">Подтвердите пароль</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
            autocomplete="new-password"
          />
        </div>

        <!-- Registration Checkboxes -->
        <div v-if="!isLoginMode && !isForgotPasswordMode && !isResetPasswordMode" class="space-y-4 py-2">
          <label class="flex items-start gap-3 cursor-pointer group">
            <input 
              v-model="acceptOffer"
              type="checkbox" 
              class="mt-1 w-5 h-5 shrink-0 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50 cursor-pointer"
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
              class="mt-1 w-5 h-5 shrink-0 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50 cursor-pointer"
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
              class="mt-1 w-5 h-5 shrink-0 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50 cursor-pointer"
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
          <template v-if="isSubmitting">Подождите...</template>
          <template v-else-if="isForgotPasswordMode">Отправить ссылку</template>
          <template v-else-if="isResetPasswordMode">Обновить пароль</template>
          <template v-else>{{ isLoginMode ? 'Войти' : 'Зарегистрироваться' }}</template>
        </BaseButton>

      </form>

      <!-- Toggle Mode -->
      <div class="mt-6 text-center">
        <template v-if="isForgotPasswordMode || isResetPasswordMode">
          <button 
            @click="isForgotPasswordMode = false; isResetPasswordMode = false; isLoginMode = true"
            class="text-gold hover:text-white transition-colors font-bold"
          >
            Назад к входу
          </button>
        </template>
        <p v-else class="text-gray-400 text-sm">
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
