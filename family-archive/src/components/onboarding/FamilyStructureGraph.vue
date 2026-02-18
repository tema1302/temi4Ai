<script setup lang="ts">
import { FamilyRole, FAMILY_STRUCTURE_CONFIG } from '../../modules/family/domain/constants'
import RelationCard from './RelationCard.vue'

const emit = defineEmits<{
  select: [role: FamilyRole]
}>()

const handleSelect = (role: FamilyRole) => {
  emit('select', role)
}
</script>

<template>
  <div class="w-full max-w-3xl mx-auto p-2 md:p-8 overflow-x-auto">
    <div 
      class="grid grid-cols-5 grid-rows-6 gap-2 md:gap-5 items-center min-w-[320px]"
      style="
        grid-template-areas: 
          '. . child . .'
          'sister . . . brother'
          '. . self spouse .'
          'mother . . . father'
          'g-mother . . . g-father'
          'gg-mother . . . gg-father';
      "
    >
      <RelationCard
        v-for="node in FAMILY_STRUCTURE_CONFIG"
        :key="node.role"
        v-bind="node"
        class="!p-2 md:!p-3 !text-[9px] md:!text-xs"
        @select="handleSelect"
      />
    </div>
  </div>
</template>
