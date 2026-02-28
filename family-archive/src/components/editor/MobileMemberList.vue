<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMemoryStore } from '@/modules/family/store/memoryStore'
import { useAuthAccess } from '@/modules/access/composables/useAuthAccess'
import { useDialogStore } from '@/stores/dialogStore'
import { Trash2, Eye, Search } from 'lucide-vue-next'

const store = useMemoryStore()
const access = useAuthAccess()
const dialogs = useDialogStore()

const emit = defineEmits<{
  select: [id: string]
  add: []
  delete: [id: string, name: string]
}>()

const handleDelete = async (e: Event, id: string, name: string) => {
  e.stopPropagation()
  emit('delete', id, name)
}

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
  <div class="mobile-list h-full flex flex-col bg-charcoal">
    <!-- Header / Search -->
    <div class="mobile-list__header p-4 bg-obsidian/50 border-b border-white/10 sticky top-0 z-10 backdrop-blur-sm">
      <div class="mobile-list__search relative mb-3">
        <Search class="mobile-list__search-icon absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по имени..."
          class="mobile-list__search-input w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-silk placeholder:text-gray-500 focus:outline-none focus:border-gold/50 transition-colors"
        />
      </div>
      <div class="mobile-list__stats text-xs text-gray-400 flex justify-between">
        <span>Всего: {{ filteredMembers.length }}</span>
        <span v-if="totalPages > 1">Стр. {{ currentPage }} из {{ totalPages }}</span>
      </div>
    </div>

    <!-- List -->
    <div class="mobile-list__content flex-1 overflow-y-auto p-4 space-y-3">
      <div
        v-for="member in paginatedMembers"
        :key="member.id"
        @click="onSelect(member.id)"
        class="mobile-list__item flex items-center gap-4 p-3 rounded-lg bg-white/5 border border-white/5 active:bg-white/10 transition-colors cursor-pointer"
      >
        <!-- Avatar -->
        <div class="mobile-list__avatar w-12 h-12 rounded-full overflow-hidden bg-charcoal flex-shrink-0 border border-white/10">
          <img
            v-if="member.photoUrl"
            :src="member.photoUrl"
            loading="lazy"
            decoding="async"
            class="mobile-list__avatar-img w-full h-full object-cover"
          >
          <div v-else class="mobile-list__avatar-placeholder w-full h-full flex items-center justify-center text-gray-500 font-bold">
            {{ member.name[0] || '?' }}
          </div>
        </div>

        <!-- Info -->
        <div class="mobile-list__info flex-1 min-w-0">
          <h3 class="mobile-list__name text-silk font-medium truncate">{{ member.name }}</h3>
          <p class="mobile-list__role text-[10px] text-gold uppercase tracking-widest font-bold mb-0.5" v-if="member.relationship">
            {{ member.relationship }}
          </p>
          <p class="mobile-list__dates text-xs text-gray-400 truncate">
            {{ member.birthDate ? new Date(member.birthDate).getFullYear() : '???' }}
            -
            {{ member.deathDate ? new Date(member.deathDate).getFullYear() : 'н.в.' }}
          </p>
        </div>

        <!-- Actions -->
        <div class="mobile-list__actions flex items-center gap-2">
          <a
            :href="`/${store.currentFamily?.id}?member=${member.id}`"
            target="_blank"
            class="mobile-list__action mobile-list__action--view p-2 text-gold hover:bg-gold/10 rounded-full transition-colors"
            @click.stop
          >
            <Eye class="w-4 h-4" />
          </a>
          <button
            v-if="access.canEditTree.value"
            @click="handleDelete($event, member.id, member.name)"
            class="mobile-list__action mobile-list__action--delete p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
          >
            <Trash2 class="w-4 h-4" />
          </button>
          <div class="mobile-list__arrow text-gray-600">
            →
          </div>
        </div>
      </div>

      <div v-if="paginatedMembers.length === 0" class="mobile-list__empty text-center py-10 text-gray-500">
        Никого не найдено
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mobile-list__pagination p-4 border-t border-white/10 flex justify-center gap-4 bg-obsidian/30">
      <button
        @click="prevPage"
        :disabled="currentPage === 1"
        class="mobile-list__page-btn mobile-list__page-btn--prev w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 hover:bg-gold/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>
      <span class="mobile-list__page-info flex items-center text-sm text-gray-400">{{ currentPage }} / {{ totalPages }}</span>
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="mobile-list__page-btn mobile-list__page-btn--next w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-gold hover:border-gold/50 hover:bg-gold/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  </div>
</template>
