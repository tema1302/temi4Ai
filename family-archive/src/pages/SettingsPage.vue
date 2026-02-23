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
import { useAuthAccess } from '@/modules/access/composables/useAuthAccess'
import { User, CheckCircle, AlertCircle } from 'lucide-vue-next'

const router = useRouter()
const dialogs = useDialogStore()
const authStore = useAuthStore()
const access = useAuthAccess()
const isSaving = ref(false)
const newPassword = ref('')
const confirmPassword = ref('')

const isVerified = computed(() => !!authStore.user?.email_confirmed_at)

onMounted(async () => {
  // Refresh user data to get latest email verification status from server
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    authStore.user = user
  }
})

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
</script>

<template>
  <MainLayout :fullHeight="true">
    <div class="max-w-2xl mx-auto p-4 md:p-8">
      <BackButton class="mb-6" />

      <h1 class="text-2xl md:text-3xl font-serif text-silk mb-8">Настройки аккаунта</h1>

      <div class="space-y-8 pb-20">
        <!-- Account Info & Role -->
        <BaseCard class="p-8">
          <div class="flex items-start gap-4">
             <div class="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                <User class="w-6 h-6" />
             </div>
             <div class="flex-1">
                <h2 class="text-xl font-serif text-silk mb-2">Информация об аккаунте</h2>
                <div class="space-y-2">
                  <p class="text-sm text-gray-400 flex items-center gap-2 flex-wrap">
                    Email: <span class="text-silk font-medium">{{ authStore.userEmail }}</span>
                    <span v-if="isVerified" class="text-[10px] bg-green-500/10 text-green-400 px-2 py-0.5 rounded border border-green-500/20 flex items-center gap-1">
                      <CheckCircle class="w-3 h-3" /> Подтвержден
                    </span>
                    <span v-else class="text-[10px] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                      <AlertCircle class="w-3 h-3" /> Не подтвержден
                    </span>
                  </p>
                  <p class="text-sm text-gray-400">Роль в архиве: <span class="text-gold font-bold uppercase tracking-widest text-[10px] ml-2 px-2 py-0.5 bg-gold/5 rounded border border-gold/10">{{ access.currentRoleLabel.value }}</span></p>
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
