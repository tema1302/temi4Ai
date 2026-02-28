<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import { useAuthStore } from '@/stores/authStore'
import { useRouter, useRoute } from 'vue-router'
import { useAnalytics } from '@/composables/useAnalytics'
import {
  Check,
  Eye,
  EyeOff
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

// Password visibility
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Legal checkboxes
const acceptOffer = ref(false)
const acceptPD = ref(false)
const acceptNewsletter = ref(false)

// Function to update mode based on query params
const updateModeFromQuery = () => {
  // Handle mode query param for login/signup
  if (route.query.mode === 'signup') {
    isLoginMode.value = false
    isForgotPasswordMode.value = false
    isResetPasswordMode.value = false
    showSuccess.value = false
  } else if (route.query.mode === 'login') {
    isLoginMode.value = true
    isForgotPasswordMode.value = false
    isResetPasswordMode.value = false
    showSuccess.value = false
  }
}

// Watch for query param changes
watch(() => route.query.mode, updateModeFromQuery)

onMounted(async () => {
  // Handle email verification (signup, magiclink, email_change)
  if (route.query.type === 'signup' || route.query.type === 'magiclink' || route.query.type === 'email_change') {
    // Supabase auto-processes the token, just show success
    successTitle.value = 'Email подтверждён!'
    successMessage.value = 'Ваш email успешно подтверждён. Теперь вы можете войти в систему.'
    showSuccess.value = true
    // Clear URL params
    router.replace({ query: {} })
    return
  }

  // Handle password recovery
  if (route.query.type === 'recovery') {
    isResetPasswordMode.value = true
    isLoginMode.value = false
    return
  }

  // Handle mode from query
  updateModeFromQuery()
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
  <div class="auth-form min-h-screen flex items-center justify-center px-4 relative">
    <!-- Back Button -->
    <div class="auth-form__back absolute top-6 left-6">
      <BackButton to="/" />
    </div>

    <!-- Success State -->
    <BaseCard v-if="showSuccess" class="auth-form__success w-full max-w-md p-8 text-center">
       <div class="auth-form__success-icon w-16 h-16 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-gold">
         <Check class="w-8 h-8" />
       </div>
       <h2 class="auth-form__success-title text-2xl font-serif text-silk mb-4">{{ successTitle }}</h2>
       <p class="auth-form__success-message text-gray-400 mb-8 leading-relaxed">
         {{ successMessage }}
       </p>
       <BaseButton full @click="handleSuccessContinue">
         {{ isResetPasswordMode || isForgotPasswordMode ? 'Войти' : 'Продолжить' }}
       </BaseButton>
    </BaseCard>

    <BaseCard v-else class="auth-form__card w-full max-w-md p-8">

      <!-- Header -->
      <div class="auth-form__header text-center mb-8">
        <h1 class="auth-form__title text-3xl font-serif text-silk mb-2">
          <template v-if="isForgotPasswordMode">Восстановление пароля</template>
          <template v-else-if="isResetPasswordMode">Новый пароль</template>
          <template v-else>{{ isLoginMode ? 'Вход' : 'Создать аккаунт' }}</template>
        </h1>
        <p class="auth-form__subtitle text-gray-400">
          <template v-if="isForgotPasswordMode">Введите email для получения ссылки</template>
          <template v-else-if="isResetPasswordMode">Установите новый пароль для входа</template>
          <template v-else>{{ isLoginMode ? 'Войдите, чтобы управлять архивами' : 'Начните сохранять историю вашей семьи' }}</template>
        </p>
      </div>

      <div v-if="errorMessage" class="auth-form__error mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="auth-form__form space-y-5" autocomplete="on">

        <!-- Name (Registration only) -->
        <div v-if="!isLoginMode && !isForgotPasswordMode && !isResetPasswordMode" class="auth-form__field">
          <label class="auth-form__label block text-sm text-gray-400 mb-2">Ваше имя</label>
          <input
            v-model="fullName"
            type="text"
            placeholder="Иван Иванов"
            class="auth-form__input w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
            autocomplete="name"
          />
        </div>

        <!-- Email -->
        <div v-if="!isResetPasswordMode" class="auth-form__field">
          <label class="auth-form__label block text-sm text-gray-400 mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="your@email.com"
            class="auth-form__input w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
            required
            autocomplete="email"
          />
        </div>

        <!-- Password -->
        <div v-if="!isForgotPasswordMode" class="auth-form__field">
          <div class="auth-form__label-row flex justify-between items-center mb-2">
            <label class="auth-form__label block text-sm text-gray-400">
              {{ isResetPasswordMode ? 'Новый пароль' : 'Пароль' }}
            </label>
            <button
              v-if="isLoginMode"
              type="button"
              class="auth-form__forgot-link text-xs text-gray-500 hover:text-gold transition-colors"
              @click="toggleForgotPassword"
            >
              Забыли пароль?
            </button>
          </div>
          <div class="auth-form__input-wrapper relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="auth-form__input auth-form__input--with-icon w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
              required
              :autocomplete="isLoginMode ? 'current-password' : 'new-password'"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="auth-form__toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors p-1"
              :title="showPassword ? 'Скрыть пароль' : 'Показать пароль'"
            >
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Confirm Password -->
        <div v-if="!isLoginMode && !isForgotPasswordMode" class="auth-form__field">
          <label class="auth-form__label block text-sm text-gray-400 mb-2">Подтвердите пароль</label>
          <div class="auth-form__input-wrapper relative">
            <input
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="••••••••"
              class="auth-form__input auth-form__input--with-icon w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              @click="showConfirmPassword = !showConfirmPassword"
              class="auth-form__toggle-password absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gold transition-colors p-1"
              :title="showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'"
            >
              <Eye v-if="!showConfirmPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Registration Checkboxes -->
        <div v-if="!isLoginMode && !isForgotPasswordMode && !isResetPasswordMode" class="auth-form__checkboxes space-y-4 py-2">
          <label class="auth-form__checkbox flex items-start gap-3 cursor-pointer group">
            <input
              v-model="acceptOffer"
              type="checkbox"
              class="auth-form__checkbox-input mt-1 w-5 h-5 shrink-0 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50 cursor-pointer"
            />
            <span class="auth-form__checkbox-label text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Я ознакомлен с условиями
              <router-link to="/offer" class="auth-form__link text-gold hover:underline" @click.stop>Публичной оферты</router-link>
            </span>
          </label>

          <label class="auth-form__checkbox flex items-start gap-3 cursor-pointer group">
            <input
              v-model="acceptPD"
              type="checkbox"
              class="auth-form__checkbox-input mt-1 w-5 h-5 shrink-0 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50 cursor-pointer"
            />
            <span class="auth-form__checkbox-label text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Я даю согласие на
              <router-link to="/pd-consent" class="auth-form__link text-gold hover:underline" @click.stop>Обработку персональных данных</router-link>
              в соответствии с
              <router-link to="/pd-policy" class="auth-form__link text-gold hover:underline" @click.stop>Политикой обработки персональных данных</router-link>
            </span>
          </label>

          <label class="auth-form__checkbox flex items-start gap-3 cursor-pointer group">
            <input
              v-model="acceptNewsletter"
              type="checkbox"
              class="auth-form__checkbox-input mt-1 w-5 h-5 shrink-0 rounded border-white/10 bg-white/5 text-gold focus:ring-gold/50 cursor-pointer"
            />
            <span class="auth-form__checkbox-label text-xs text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
              Я даю
              <router-link to="/newsletter-consent" class="auth-form__link text-gold hover:underline" @click.stop>Согласие на получение информационно-рекламных рассылок</router-link>
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
      <div class="auth-form__toggle mt-6 text-center">
        <template v-if="isForgotPasswordMode || isResetPasswordMode">
          <button
            @click="isForgotPasswordMode = false; isResetPasswordMode = false; isLoginMode = true"
            class="auth-form__toggle-btn text-gold hover:text-white transition-colors font-bold"
          >
            Назад к входу
          </button>
        </template>
        <p v-else class="auth-form__toggle-text text-gray-400 text-sm">
          {{ isLoginMode ? "Нет аккаунта?" : 'Уже есть аккаунт?' }}
          <button
            @click="toggleMode"
            class="auth-form__toggle-btn text-gold hover:text-white transition-colors font-bold ml-1"
          >
            {{ isLoginMode ? "Создать" : "Войти" }}
          </button>
        </p>
      </div>

    </BaseCard>
  </div>
</template>
