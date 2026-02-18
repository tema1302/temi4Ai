<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { FamilyRole } from '@/modules/family/domain/constants'
import MainLayout from '@/layouts/MainLayout.vue'
import FamilyStructureGraph from '@/components/onboarding/FamilyStructureGraph.vue'
import { Sparkles } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const store = useMemoryStore()

const archiveId = route.params.id as string

onMounted(async () => {
  if (!store.currentFamily || store.currentFamily.id !== archiveId) {
    await store.loadFamilyBySlug(archiveId)
  }
})

const handleRoleSelect = async (role: FamilyRole) => {
  if (!store.currentFamily) return

  // Находим "нового" члена семьи, который был создан по умолчанию
  const firstMember = store.members[0]
  if (firstMember) {
    // Маппинг ролей на человеческие названия для инициализации
    const roleLabels: Record<FamilyRole, string> = {
      [FamilyRole.SELF]: 'Это Вы',
      [FamilyRole.MOTHER]: 'Мама',
      [FamilyRole.FATHER]: 'Папа',
      [FamilyRole.SPOUSE]: 'Супруг(а)',
      [FamilyRole.CHILD]: 'Ребенок',
      [FamilyRole.BROTHER]: 'Брат',
      [FamilyRole.SISTER]: 'Сестра',
      [FamilyRole.GRANDMOTHER]: 'Бабушка',
      [FamilyRole.GRANDFATHER]: 'Дедушка',
      [FamilyRole.GREAT_GRANDMOTHER]: 'Прабабушка',
      [FamilyRole.GREAT_GRANDFATHER]: 'Прадедушка',
    }

    store.updateMember(firstMember.id, { 
      relationship: roleLabels[role],
      name: role === FamilyRole.SELF ? '' : roleLabels[role] // Очищаем имя для SELF, чтобы пользователь ввел свое
    })
    
    // Устанавливаем его активным
    store.setActiveMember(firstMember.id)
    
    // Редирект в редактор
    router.push('/editor')
  }
}
</script>

<template>
  <MainLayout>
    <div class="min-h-[80vh] flex flex-col items-center justify-center py-6 md:py-10 px-4">
      <div class="text-center mb-8 md:mb-12 max-w-2xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 mb-4 md:mb-6 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] md:text-xs font-bold uppercase tracking-widest">
          <Sparkles class="w-3 h-3" /> Шаг 2: Выберите персону
        </div>
        <h1 class="text-2xl md:text-5xl font-serif text-silk mb-3 md:mb-4">С кого начнем?</h1>
        <p class="text-gray-400 text-sm md:text-lg">
          Выберите роль первого человека, чью историю вы хотите сохранить в архиве семьи «<span class="text-gold">{{ store.familyName }}</span>».
        </p>
      </div>

      <FamilyStructureGraph @select="handleRoleSelect" />

      <div class="mt-12 text-gray-500 text-sm italic">
        * Вы сможете добавить остальных родственников позже в любое время.
      </div>
    </div>
  </MainLayout>
</template>
