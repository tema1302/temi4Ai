<script setup lang="ts">
import { ref } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseCard from '@/shared/ui/BaseCard.vue'
import BaseSelect from '@/shared/ui/BaseSelect.vue'
import { ArchiveRole } from '../constants/roles'

const props = defineProps<{
  isOpen: boolean
  archiveId: string
}>()

const emit = defineEmits(['close', 'invite'])

const email = ref('')
const selectedRole = ref<ArchiveRole>(ArchiveRole.EDITOR)
const isSubmitting = ref(false)

const roleOptions = [
  { value: ArchiveRole.EDITOR, label: 'Редактор (может изменять всё)' },
  { value: ArchiveRole.CONTRIBUTOR, label: 'Участник (может добавлять контент)' },
  { value: ArchiveRole.VIEWER, label: 'Наблюдатель (только чтение)' }
]

const handleInvite = async () => {
  if (!email.value) return
  
  isSubmitting.value = true
  try {
    // API Placeholder
    // await AccessRepository.sendInvite(props.archiveId, email.value, selectedRole.value)
    emit('invite', { email: email.value, role: selectedRole.value })
    email.value = ''
    emit('close')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-obsidian/90 backdrop-blur-sm" @click="emit('close')"></div>
    
    <BaseCard class="w-full max-w-md relative z-10 p-8 shadow-2xl border-white/10">
      <h2 class="text-2xl font-serif text-silk mb-6">Пригласить близких</h2>
      
      <div class="space-y-6">
        <div>
          <BaseInput 
            v-model="email" 
            label="Email участника"
            placeholder="example@mail.ru" 
            type="email"
            class="w-full"
          />
        </div>
        
        <div>
          <BaseSelect
            v-model="selectedRole"
            label="Роль"
            :options="roleOptions"
          />
          <p class="text-[10px] text-gray-500 mt-3 px-1 leading-relaxed">
            Редактор может изменять структуру древа и профили. Участник — только добавлять фото и истории.
          </p>
        </div>
        
        <div class="flex gap-4 pt-4">
          <BaseButton variant="ghost" :full="true" @click="emit('close')">
            Отмена
          </BaseButton>
          <BaseButton :full="true" @click="handleInvite" :disabled="!email || isSubmitting">
            {{ isSubmitting ? 'Отправка...' : 'Отправить' }}
          </BaseButton>
        </div>
      </div>
    </BaseCard>
  </div>
</template>
