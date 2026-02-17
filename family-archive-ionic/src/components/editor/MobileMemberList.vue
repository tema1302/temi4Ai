<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import BaseInput from '@/shared/ui/BaseInput.vue'
import BaseButton from '@/shared/ui/BaseButton.vue'

const store = useMemoryStore()
const emit = defineEmits<{
  select: [id: string]
  add: []
}>()

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

// Filtered members
const filteredMembers = computed(() => {
  if (!searchQuery.value) return store.members
  const query = searchQuery.value.toLowerCase()
  return store.members.filter(m => m.name.toLowerCase().includes(query))
})

// Paginated members
const paginatedMembers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredMembers.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(filteredMembers.value.length / itemsPerPage))

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

const onSelect = (id: string) => {
  emit('select', id)
}
</script>

<template>
  <div class="h-full flex flex-col bg-charcoal">
    <!-- Header / Search -->
    <div class="p-4 bg-obsidian/50 border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm">
      <div class="flex gap-2 mb-3">
        <BaseInput 
          v-model="searchQuery" 
          placeholder="Поиск по имени..." 
          class="flex-1"
        />
        <BaseButton @click="emit('add')" size="sm" class="shrink-0">
          +
        </BaseButton>
      </div>
      <div class="text-xs text-gray-400 flex justify-between">
        <span>Всего: {{ filteredMembers.length }}</span>
        <span v-if="totalPages > 1">Стр. {{ currentPage }} из {{ totalPages }}</span>
      </div>
    </div>

    <!-- List -->
    <div class="flex-1 overflow-y-auto p-4 space-y-3">
      <div 
        v-for="member in paginatedMembers" 
        :key="member.id"
        @click="onSelect(member.id)"
        class="flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 active:bg-white/10 transition-colors cursor-pointer"
      >
        <!-- Avatar -->
        <div class="w-12 h-12 rounded-full overflow-hidden bg-charcoal flex-shrink-0 border border-white/10">
          <img 
            v-if="member.photoUrl" 
            :src="member.photoUrl" 
            class="w-full h-full object-cover"
          >
          <div v-else class="w-full h-full flex items-center justify-center text-gray-500 font-bold">
            {{ member.name[0] || '?' }}
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h3 class="text-silk font-medium truncate">{{ member.name }}</h3>
          <p class="text-[10px] text-gold uppercase tracking-widest font-bold mb-0.5" v-if="member.relationship">
            {{ member.relationship }}
          </p>
          <p class="text-xs text-gray-400 truncate">
            {{ member.birthDate ? new Date(member.birthDate).getFullYear() : '???' }} 
            - 
            {{ member.deathDate ? new Date(member.deathDate).getFullYear() : 'н.в.' }}
          </p>
        </div>

        <!-- Arrow -->
        <div class="text-gray-600">
          →
        </div>
      </div>
      
      <div v-if="paginatedMembers.length === 0" class="text-center py-10 text-gray-500">
        Никого не найдено
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="p-4 border-t border-white/10 flex justify-center gap-4 bg-obsidian/30">
      <button 
        @click="prevPage" 
        :disabled="currentPage === 1"
        class="px-4 py-2 rounded bg-white/5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
      >
        ← Назад
      </button>
      <button 
        @click="nextPage" 
        :disabled="currentPage === totalPages"
        class="px-4 py-2 rounded bg-white/5 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
      >
        Вперед →
      </button>
    </div>
  </div>
</template>
