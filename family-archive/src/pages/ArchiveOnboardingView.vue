<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { FamilyRole } from '@/modules/family/domain/constants'
import MainLayout from '@/layouts/MainLayout.vue'
import FamilyTree from '@/components/tree/FamilyTree.vue'
import { Sparkles, ArrowLeft } from 'lucide-vue-next'

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
  // Или создаем нового, если текущих нет
  let targetMember = store.members.find(m => !m.relationship || m.name === 'Новый член семьи')
  
  if (!targetMember) {
    store.addMember()
    targetMember = store.members[store.members.length - 1]
  }

  if (targetMember) {
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

    store.updateMember(targetMember.id, { 
      relationship: roleLabels[role],
      name: role === FamilyRole.SELF ? '' : roleLabels[role] // Очищаем имя для SELF, чтобы пользователь ввел свое
    })
    
    // Устанавливаем его активным
    store.setActiveMember(targetMember.id)
    
    // Редирект в редактор
    router.push('/editor')
  }
}

const handleMemberSelect = (memberId: string) => {
  store.setActiveMember(memberId)
  router.push('/editor')
}

const goBack = () => {
  router.push('/editor')
}
</script>

<template>
  <MainLayout>
    <div class="h-[calc(100vh-64px)] flex flex-col p-4 md:p-8">
      
      <!-- Header Area -->
      <div class="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <div class="flex flex-col items-center md:items-start text-center md:text-left">
          <div class="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-gold/10 border border-gold/20 text-gold text-[10px] font-bold uppercase tracking-widest">
            <Sparkles class="w-3 h-3" /> Личный кабинет архива
          </div>
          <h1 class="text-2xl md:text-4xl font-serif text-silk mb-1">
            Семья <span class="text-gold">{{ store.familyName }}</span>
          </h1>
          <p class="text-gray-400 text-xs md:text-sm">
            Выберите родственника на древе, чтобы заполнить или отредактировать его историю.
          </p>
        </div>

        <div class="flex gap-4">
           <button 
             @click="goBack"
             class="px-6 py-2.5 rounded-full border border-white/10 text-silk text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
           >
             <ArrowLeft class="w-3 h-3" /> К списку
           </button>
        </div>
      </div>

      <!-- Main Interactive Tree -->
      <div class="flex-1 min-h-0">
        <FamilyTree 
          :members="store.members" 
          :family-name="store.familyName"
          @select-role="handleRoleSelect"
          @select-member="handleMemberSelect"
        />
      </div>

      <!-- Footer Info -->
      <div class="mt-6 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
        <span>Масштабируйте колесиком мыши</span>
        <span class="hidden md:inline">•</span>
        <span>Перемещайте зажав левую кнопку</span>
        <span class="hidden md:inline">•</span>
        <span>Клик по узлу — редактор</span>
      </div>
    </div>
  </MainLayout>
</template>
