<script setup lang="ts">
import { ref, watch } from 'vue'
import BaseButton from '@/shared/ui/BaseButton.vue'
import type { FamilyMember, RelationType } from '@/modules/family/domain/models'

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

const relationOptions = [
  { value: 'parent' as RelationType, label: 'Родитель', icon: '👤', description: 'Мать или отец' },
  { value: 'child' as RelationType, label: 'Ребенок', icon: '👶', description: 'Сын или дочь' },
  { value: 'spouse' as RelationType, label: 'Супруг(а)', icon: '💑', description: 'Муж или жена' },
  { value: 'sibling' as RelationType, label: 'Брат/Сестра', icon: '👥', description: 'Брат или сестра' },
]

const selectedRelation = ref<RelationType>('parent')

// Reset selection when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && props.suggestedRole) {
    // Map suggested role to relation type
    const roleMap: Record<string, RelationType> = {
      'parent': 'parent',
      'child': 'child',
      'spouse': 'spouse',
      'sibling': 'sibling',
      'Мама': 'parent',
      'Папа': 'parent',
      'Ребенок': 'child',
      'Супруг(а)': 'spouse',
      'Брат': 'sibling',
      'Сестра': 'sibling',
    }
    selectedRelation.value = roleMap[props.suggestedRole] || 'parent'
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
          <div class="grid grid-cols-2 gap-3 mb-6">
            <button
              v-for="option in relationOptions"
              :key="option.value"
              @click="selectedRelation = option.value"
              class="p-4 rounded-xl border transition-all text-left"
              :class="selectedRelation === option.value
                ? 'border-gold bg-gold/10 text-silk'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'"
            >
              <span class="text-2xl mb-2 block">{{ option.icon }}</span>
              <span class="text-sm font-bold block">{{ option.label }}</span>
              <span class="text-[10px] text-gray-500">{{ option.description }}</span>
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
