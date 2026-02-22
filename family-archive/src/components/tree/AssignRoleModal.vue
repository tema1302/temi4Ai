<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import type { FamilyMember, RelationType } from '@/modules/family/domain/models'
import { ROLE_DICTIONARY } from '@/shared/utils/roleDictionary'

interface Props {
  isOpen: boolean
  member: FamilyMember | null
  targetMemberName?: string
  suggestedRole?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  confirm: [relationType: RelationType]
  cancel: []
}>()

const getIcon = (role: string) => {
  const icons: Record<string, string> = {
    father: '👴', mother: '👵', husband: '🤵', wife: '👰',
    son: '👦', daughter: '👧', brother: '👱', sister: '👩',
    parent: '👤', child: '👶', spouse: '💑', sibling: '👥'
  }
  return icons[role] || '👤'
}

const relationOptions = ROLE_DICTIONARY.filter(r => 
  !['parent', 'child', 'spouse', 'sibling'].includes(r.value)
)

const selectedRelation = ref<RelationType>('father')

// Reset selection when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.suggestedRole) {
    // Map suggested role to relation type
    const roleMap: Record<string, RelationType> = {
      'parent': 'father',
      'father': 'father',
      'mother': 'mother',
      'child': 'son',
      'son': 'son',
      'daughter': 'daughter',
      'spouse': 'husband',
      'husband': 'husband',
      'wife': 'wife',
      'sibling': 'brother',
      'brother': 'brother',
      'sister': 'sister',
    }
    selectedRelation.value = roleMap[props.suggestedRole] || 'father'
  }
})

const handleConfirm = () => {
  emit('confirm', selectedRelation.value)
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        @click.self="emit('cancel')"
      >
        <div class="bg-charcoal rounded-3xl border border-white/10 p-6 max-w-md w-full shadow-2xl">
          <!-- Header -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 mx-auto rounded-full bg-gold/10 flex items-center justify-center text-3xl mb-4">
              🌳
            </div>
            <h3 class="text-xl font-serif text-silk mb-2">Подтвердите связь</h3>
            <p class="text-gray-400 text-sm leading-relaxed">
              <span class="text-gold font-medium">{{ member?.name || 'Участник' }}</span>
              приходится для
              <span class="text-gold font-medium">{{ targetMemberName || 'выбранного члена' }}</span>
            </p>
          </div>

          <!-- Relation Selection -->
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6 max-h-[40vh] overflow-y-auto pr-2 scrollbar-thin">
            <button
              v-for="option in relationOptions"
              :key="option.value"
              @click="selectedRelation = option.value as RelationType"
              class="p-3 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1"
              :class="selectedRelation === option.value
                ? 'border-gold bg-gold/10 text-silk'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'"
            >
              <span class="text-xl block">{{ getIcon(option.value) }}</span>
              <span class="text-[10px] font-bold block uppercase tracking-tighter">{{ option.label }}</span>
            </button>
          </div>

          <!-- Actions -->
          <div class="flex gap-3">
            <BaseButton variant="ghost" full @click="emit('cancel')">
              Отмена
            </BaseButton>
            <BaseButton full @click="handleConfirm">
              Подтвердить
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from > div,
.modal-leave-to > div {
  transform: scale(0.95);
}
</style>
