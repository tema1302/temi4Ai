<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MainLayout from '@/layouts/MainLayout.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import EditorSidebar from '@/components/editor/EditorSidebar.vue'
import EditorPreview from '@/components/editor/EditorPreview.vue'
import { useMemoryStore } from '@/stores/memoryStore'
import { useAuthStore } from '@/stores/authStore'
import { createFamilyArchive, createEmptyMember, saveFamilyData, fetchUserFamilies } from '@/services/memoryService'
import { useRouter } from 'vue-router'

const store = useMemoryStore()
const authStore = useAuthStore()
const router = useRouter()

const isCreating = ref(false)
const newFamilyName = ref('')
const userFamilies = ref<any[]>([])
const isSaving = ref(false)

onMounted(async () => {
  if (authStore.userId) {
    userFamilies.value = await fetchUserFamilies(authStore.userId)
  }
})

const startNewArchive = async () => {
  if (!newFamilyName.value.trim()) return
  
  isCreating.value = true
  const newFamily = await createFamilyArchive(newFamilyName.value, authStore.userId || undefined)
  
  const member = createEmptyMember()
  member.name = 'Новый член семьи'
  newFamily.members.push(member)
  
  store.setFamily(newFamily)
  store.toggleEditing()
  isCreating.value = false
  newFamilyName.value = ''
}

const loadFamily = (family: any) => {
  store.setFamily(family)
  store.toggleEditing()
}

const saveChanges = async () => {
  if (store.currentFamily && authStore.userId) {
    isSaving.value = true
    const success = await saveFamilyData(store.currentFamily, authStore.userId)
    isSaving.value = false
    if (success) {
      alert('Сохранено успешно!')
    } else {
      alert('Ошибка сохранения. Попробуйте снова.')
    }
  }
}

const handleLogout = async () => {
  await authStore.signOut()
  store.resetStore()
  router.push('/')
}

const previewLink = computed(() => {
  if (store.currentFamily) {
    return `/${store.currentFamily.id}`
  }
  return '#'
})
</script>

<template>
  <MainLayout>
    <div class="min-h-screen flex">
      
      <!-- Sidebar -->
      <aside v-if="store.isEditing && store.currentFamily" class="w-96 bg-charcoal/50 border-r border-white/5 p-6 overflow-y-auto">
        <EditorSidebar @save="saveChanges" />
      </aside>

      <!-- Main -->
      <main class="flex-1 p-8">
        
        <!-- Header -->
        <div class="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 class="text-2xl font-serif text-silk">Панель управления</h1>
            <p class="text-gray-400 text-sm mt-1">
              Вы вошли как <span class="text-gold">{{ authStore.userEmail }}</span>
            </p>
          </div>
          <BaseButton variant="ghost" size="sm" @click="handleLogout">
            Выйти
          </BaseButton>
        </div>

        <!-- No Archive State -->
        <div v-if="!store.currentFamily" class="max-w-2xl mx-auto mt-10">
          
          <!-- Existing Archives -->
          <div v-if="userFamilies.length > 0" class="mb-10">
            <h2 class="text-xl font-serif text-silk mb-4">Ваши архивы</h2>
            <div class="grid gap-4">
              <BaseCard 
                v-for="family in userFamilies" 
                :key="family.id"
                class="p-6 cursor-pointer"
                @click="loadFamily(family)"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <h3 class="text-lg text-silk">{{ family.familyName }}</h3>
                    <p class="text-sm text-gray-400">{{ family.members.length }} {{ family.members.length === 1 ? 'человек' : 'людей' }}</p>
                  </div>
                  <span class="text-gold">Редактировать →</span>
                </div>
              </BaseCard>
            </div>
          </div>

          <!-- Create New -->
          <BaseCard class="p-10 text-center">
            <div class="text-6xl mb-6">📜</div>
            <h2 class="text-3xl font-serif text-silk mb-4">Создать новый архив</h2>
            <p class="text-gray-400 mb-8">
              Начните сохранять историю вашей семьи уже сегодня.
            </p>
            
            <div class="flex flex-col gap-4 max-w-md mx-auto">
              <input
                v-model="newFamilyName"
                type="text"
                placeholder="Введите название семьи (например, Семья Ивановых)"
                class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
                @keyup.enter="startNewArchive"
              />
              <BaseButton 
                :disabled="!newFamilyName.trim() || isCreating"
                @click="startNewArchive"
              >
                {{ isCreating ? 'Создаём...' : 'Создать архив' }}
              </BaseButton>
            </div>
          </BaseCard>
        </div>

        <!-- Editor View -->
        <div v-else>
          <div class="flex items-center justify-between mb-8">
            <div>
              <h2 class="text-2xl font-serif text-silk">{{ store.familyName }}</h2>
              <p class="text-gray-400 text-sm mt-1">
                Просмотр: <router-link :to="previewLink" class="text-gold hover:underline">{{ previewLink }}</router-link>
              </p>
            </div>
            <div class="flex gap-3">
              <BaseButton variant="ghost" @click="store.resetStore()">
                ← Назад
              </BaseButton>
              <BaseButton variant="secondary" @click="store.toggleEditing">
                {{ store.isEditing ? 'Закрыть редактор' : 'Редактировать' }}
              </BaseButton>
              <BaseButton v-if="store.isEditing" @click="saveChanges" :disabled="isSaving">
                {{ isSaving ? 'Сохраняем...' : 'Сохранить' }}
              </BaseButton>
            </div>
          </div>

          <EditorPreview />
        </div>

      </main>
    </div>
  </MainLayout>
</template>
