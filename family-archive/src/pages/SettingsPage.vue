<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BackButton from '@/shared/ui/BackButton.vue'
import { supabase } from '@/lib/supabase'
import { useDialogStore } from '@/stores/dialogStore'
import { useAuthStore } from '@/stores/authStore'
import { useSubscriptionStore } from '@/stores/subscriptionStore'
import { useAuthAccess } from '@/modules/access/composables/useAuthAccess'
import { 
  User, 
  CheckCircle, 
  AlertCircle, 
  CreditCard, 
  Calendar,
  ShieldCheck,
  ArrowUpCircle,
  Edit2,
  Save,
  X
} from 'lucide-vue-next'

const router = useRouter()
const dialogs = useDialogStore()
const authStore = useAuthStore()
const subStore = useSubscriptionStore()
const access = useAuthAccess()
const isSaving = ref(false)
const isSavingName = ref(false)
const isEditingName = ref(false)
const newFullName = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const isVerified = computed(() => !!authStore.user?.email_confirmed_at)

onMounted(async () => {
  // Strict auth check
  if (!authStore.isAuthenticated) {
    router.push('/auth')
    return
  }

  // Refresh user data to get latest email verification status from server
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    authStore.user = user
    await subStore.fetchSubscription()
    newFullName.value = authStore.userName
  } else {
    router.push('/auth')
  }
})

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Бессрочно'
  return new Date(dateString).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const startEditingName = () => {
  newFullName.value = authStore.userName
  isEditingName.value = true
}

const saveName = async () => {
  if (!newFullName.value.trim() || newFullName.value === authStore.userName) {
    isEditingName.value = false
    return
  }

  isSavingName.value = true
  try {
    const result = await authStore.updateProfile({ fullName: newFullName.value.trim() })
    if (result.success) {
      isEditingName.value = false
    } else {
      dialogs.alert(result.error || 'Ошибка при обновлении имени', 'Ошибка')
    }
  } finally {
    isSavingName.value = false
  }
}

const handlePasswordChange = async () => {
  if (newPassword.value.length < 6) {
    dialogs.alert('Пароль должен быть не менее 6 символов.', 'Ошибка')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    dialogs.alert('Пароли не совпадают.', 'Ошибка')
    return
  }

  isSaving.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    })

    if (error) throw error

    dialogs.alert('Пароль успешно изменен.', 'Успех')
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error: any) {
    dialogs.alert(error.message || 'Произошла ошибка при смене пароля.', 'Ошибка')
  } finally {
    isSaving.value = false
  }
}

// Focus directive
const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}
</script>

<template>
  <MainLayout :fullHeight="true">
    <div class="max-w-2xl mx-auto p-4 md:p-8">
      <BackButton class="mb-6" />

      <div class="mb-8 group">
        <div v-if="!isEditingName" class="flex items-center gap-4">
          <h1 
            @click="startEditingName"
            class="text-3xl md:text-4xl font-serif text-silk cursor-pointer hover:text-gold transition-colors flex items-center gap-3"
          >
            {{ authStore.userName }}
            <Edit2 class="w-5 h-5 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h1>
        </div>
        <div v-else class="flex items-center gap-3">
          <input
            v-model="newFullName"
            type="text"
            class="text-3xl md:text-4xl font-serif text-silk bg-transparent border-b border-gold outline-none px-1 flex-1"
            @keyup.enter="saveName"
            @keyup.esc="isEditingName = false"
            v-focus
          />
          <button 
            @click="saveName"
            :disabled="isSavingName"
            class="p-2 text-gold hover:bg-gold/10 rounded-full transition-colors"
            title="Сохранить"
          >
            <Save v-if="!isSavingName" class="w-6 h-6" />
            <span v-else class="text-xs animate-pulse">...</span>
          </button>
          <button 
            @click="isEditingName = false"
            class="p-2 text-gray-500 hover:bg-white/10 rounded-full transition-colors"
            title="Отмена"
          >
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>

      <div class="space-y-8 pb-20">
        <!-- Account Info & Role -->
        <BaseCard class="p-8">
          <div class="flex flex-col gap-6">
             <!-- Basic Info -->
             <div class="flex items-start gap-4 pb-6 border-b border-white/5">
                <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold shrink-0">
                   <User class="w-6 h-6" />
                </div>
                <div class="flex-1 space-y-3">
                   <div class="flex flex-col gap-1">
                      <span class="text-xs text-gray-500 uppercase tracking-widest font-bold">Email адрес</span>
                      <p class="text-silk font-medium flex items-center gap-2 flex-wrap">
                        {{ authStore.userEmail }}
                        <span v-if="isVerified" class="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                          <CheckCircle class="w-3 h-3" /> Подтвержден
                        </span>
                        <span v-else class="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                          <AlertCircle class="w-3 h-3" /> Не подтвержден
                        </span>
                      </p>
                   </div>
                   <div class="flex flex-col gap-1">
                      <span class="text-xs text-gray-500 uppercase tracking-widest font-bold">Роль в архиве</span>
                      <p class="text-silk font-medium flex items-center gap-2">
                        <ShieldCheck class="w-4 h-4 text-gold" />
                        {{ access.currentRoleLabel.value }}
                      </p>
                   </div>
                </div>
             </div>

             <!-- Subscription Info -->
             <div class="flex items-start gap-4">
                <div class="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                   <CreditCard class="w-6 h-6" />
                </div>
                <div class="flex-1 space-y-4">
                   <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div class="flex flex-col gap-1">
                         <span class="text-xs text-gray-500 uppercase tracking-widest font-bold">Текущий тариф</span>
                         <p class="text-silk font-bold flex items-center gap-2">
                           {{ subStore.tierLabel }}
                           <span class="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 uppercase">
                             {{ subStore.status === 'active' ? 'Оплачен' : subStore.status }}
                           </span>
                         </p>
                      </div>
                      <div class="flex flex-col gap-1">
                         <span class="text-xs text-gray-500 uppercase tracking-widest font-bold">Действует до</span>
                         <p class="text-silk font-medium flex items-center gap-2">
                           <Calendar class="w-4 h-4 text-gray-500" />
                           {{ formatDate(subStore.periodEnd) }}
                         </p>
                      </div>
                   </div>

                   <div class="pt-2">
                      <button 
                        @click="router.push({ path: '/', hash: '#pricing' })"
                        class="flex items-center gap-2 text-sm text-gold hover:text-white transition-colors group font-bold"
                      >
                        <ArrowUpCircle class="w-4 h-4 group-hover:scale-110 transition-transform" />
                        Сменить тариф
                      </button>
                   </div>
                </div>
             </div>
          </div>
        </BaseCard>

        <!-- Password Change Section -->
        <BaseCard class="p-8">
          <h2 class="text-xl font-serif text-silk mb-6">Смена пароля</h2>
          <form @submit.prevent="handlePasswordChange" class="space-y-6">
            <div class="space-y-2">
              <label class="text-sm text-gray-400">Новый пароль</label>
              <input
                v-model="newPassword"
                type="password"
                required
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk focus:border-gold/50 outline-none transition-colors"
                placeholder="Минимум 6 символов"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm text-gray-400">Подтвердите пароль</label>
              <input
                v-model="confirmPassword"
                type="password"
                required
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk focus:border-gold/50 outline-none transition-colors"
                placeholder="Повторите новый пароль"
              />
            </div>

            <div class="pt-4">
              <BaseButton type="submit" :disabled="isSaving" :full="true">
                {{ isSaving ? 'Сохранение...' : 'Обновить пароль' }}
              </BaseButton>
            </div>
          </form>
        </BaseCard>

        <!-- Other settings placeholders can go here -->
      </div>
    </div>
  </MainLayout>
</template>
