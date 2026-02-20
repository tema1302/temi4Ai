import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { FamilyRepository } from '../api/repository'
import {
  type FamilyArchive,
  type FamilyMember,
  type FamilyRelation,
  type RelationType,
  createEmptyMember,
  createEmptyRelation
} from '../domain/models'

export const useMemoryStore = defineStore('memory', () => {
  // State
  const currentFamily = ref<FamilyArchive | null>(null)
  const activeMemberId = ref<string | null>(null)
  const isLoading = ref(false)
  const isEditing = ref(false)
  const userFamilies = ref<FamilyArchive[]>([])
  const pendingRelation = ref<{ memberId: string; suggestedRole: string } | null>(null)
  const viewMode = ref<'cards' | 'tree'>('cards')

  // Getters
  const familyName = computed(() => currentFamily.value?.name ?? '')
  const members = computed(() => currentFamily.value?.members ?? [])
  const relations = computed(() => currentFamily.value?.relations ?? [])

  const activeMember = computed(() => {
    if (!currentFamily.value?.members.length) return null
    if (activeMemberId.value) {
      return currentFamily.value.members.find(m => m.id === activeMemberId.value) || currentFamily.value.members[0]
    }
    return currentFamily.value.members[0]
  })

  // Получить связанные члены для данного ID
  const getRelatedMembers = computed(() => (memberId: string) => {
    const related: { member: FamilyMember; relationType: RelationType }[] = []

    relations.value.forEach(r => {
      if (r.fromMemberId === memberId) {
        const member = members.value.find(m => m.id === r.toMemberId)
        if (member) related.push({ member, relationType: r.relationType })
      } else if (r.toMemberId === memberId) {
        const member = members.value.find(m => m.id === r.fromMemberId)
        if (member) {
          // Инвертируем тип связи для отображения
          const invertedType = r.relationType === 'parent' ? 'child' as RelationType : r.relationType
          related.push({ member, relationType: invertedType })
        }
      }
    })

    return related
  })

  // Actions
  function setFamily(data: FamilyArchive) {
    currentFamily.value = data
    if (data.members.length > 0) {
      activeMemberId.value = data.rootMemberId || data.members[0].id
    }
  }

  function setActiveMember(id: string) {
    activeMemberId.value = id
  }

  function updateMember(memberId: string, updates: Partial<FamilyMember>) {
    if (!currentFamily.value) return

    const index = currentFamily.value.members.findIndex(m => m.id === memberId)
    if (index !== -1) {
      currentFamily.value.members[index] = {
        ...currentFamily.value.members[index],
        ...updates
      }
      currentFamily.value.updatedAt = new Date().toISOString()
    }
  }

  function updateFamilyName(name: string) {
    if (!currentFamily.value) return
    currentFamily.value.name = name
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  function addMember() {
    if (!currentFamily.value) return
    const newMember = createEmptyMember()
    newMember.name = 'Новый член семьи'
    currentFamily.value.members.push(newMember)
    activeMemberId.value = newMember.id
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  // Новое: Добавление члена с ролью
  function addMemberWithRelation(
    relatedMemberId: string,
    relationType: RelationType,
    memberData?: Partial<FamilyMember>
  ) {
    if (!currentFamily.value) return null

    const newMember = createEmptyMember()
    Object.assign(newMember, memberData, { name: memberData?.name || 'Новый член семьи' })

    currentFamily.value.members.push(newMember)
    activeMemberId.value = newMember.id

    // Создаем связь
    let fromId = relatedMemberId
    let toId = newMember.id

    if (relationType === 'parent') {
      // Новый член - родитель для relatedMemberId
      fromId = newMember.id
      toId = relatedMemberId
    } else if (relationType === 'child' || relationType === 'sibling' || relationType === 'spouse') {
      fromId = relatedMemberId
      toId = newMember.id
    }

    addRelation({
      fromMemberId: fromId,
      toMemberId: toId,
      relationType: relationType === 'child' ? 'parent' : relationType
    })

    currentFamily.value.updatedAt = new Date().toISOString()
    return newMember
  }

  // Новое: Добавление связи
  function addRelation(relation: Omit<FamilyRelation, 'id' | 'createdAt'>) {
    if (!currentFamily.value) return

    const newRelation = createEmptyRelation(
      relation.fromMemberId,
      relation.toMemberId,
      relation.relationType
    )

    // Проверяем на дубликаты
    const exists = currentFamily.value.relations.some(
      r => r.fromMemberId === relation.fromMemberId &&
        r.toMemberId === relation.toMemberId &&
        r.relationType === relation.relationType
    )

    if (!exists) {
      currentFamily.value.relations.push(newRelation)
      currentFamily.value.updatedAt = new Date().toISOString()
    }
  }

  // Новое: Удаление связи
  function removeRelation(relationId: string) {
    if (!currentFamily.value) return

    const index = currentFamily.value.relations.findIndex(r => r.id === relationId)
    if (index !== -1) {
      currentFamily.value.relations.splice(index, 1)
      currentFamily.value.updatedAt = new Date().toISOString()
    }
  }

  // Новое: Удаление всех связей члена
  function removeAllMemberRelations(memberId: string) {
    if (!currentFamily.value) return

    currentFamily.value.relations = currentFamily.value.relations.filter(
      r => r.fromMemberId !== memberId && r.toMemberId !== memberId
    )
    currentFamily.value.updatedAt = new Date().toISOString()
  }

  async function removeMember(memberId: string) {
    if (!currentFamily.value) return

    // Удаляем все связи члена
    removeAllMemberRelations(memberId)

    // Optimistic UI update
    const index = currentFamily.value.members.findIndex(m => m.id === memberId)
    if (index !== -1) {
      currentFamily.value.members.splice(index, 1)
      currentFamily.value.updatedAt = new Date().toISOString()

      if (activeMemberId.value === memberId) {
        activeMemberId.value = currentFamily.value.members[0]?.id || null
      }
    }

    await FamilyRepository.deleteMember(memberId)
  }

  async function removeFamily(slug: string) {
    await FamilyRepository.delete(slug)
    if (currentFamily.value?.id === slug) {
      resetStore()
    }
    userFamilies.value = userFamilies.value.filter(f => f.id !== slug)
  }

  async function saveCurrentFamily(userId: string) {
    if (!currentFamily.value) return false
    isLoading.value = true
    const success = await FamilyRepository.save(currentFamily.value, userId)
    isLoading.value = false
    return success
  }

  async function loadUserFamilies(userId: string) {
    isLoading.value = true
    userFamilies.value = await FamilyRepository.getAllByUser(userId)
    isLoading.value = false
    return userFamilies.value
  }

  async function loadFamilyBySlug(slug: string) {
    isLoading.value = true
    const family = await FamilyRepository.getBySlug(slug)
    if (family) {
      setFamily(family)
    }
    isLoading.value = false
    return family
  }

  async function createArchive(name: string, userId: string) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36)

    const newFamily: FamilyArchive = {
      id: slug,
      name: name,
      heroImage: '',
      members: [],
      relations: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await FamilyRepository.save(newFamily, userId)
    return newFamily
  }

  function toggleEditing() {
    isEditing.value = !isEditing.value
  }

  function setViewMode(mode: 'cards' | 'tree') {
    viewMode.value = mode
  }

  function resetStore() {
    currentFamily.value = null
    activeMemberId.value = null
    isLoading.value = false
    isEditing.value = false
    pendingRelation.value = null
    viewMode.value = 'cards'
  }

  return {
    // State
    currentFamily,
    activeMemberId,
    userFamilies,
    isLoading,
    isEditing,
    pendingRelation,
    viewMode,

    // Getters
    familyName,
    members,
    relations,
    activeMember,
    getRelatedMembers,

    // Actions
    setFamily,
    setActiveMember,
    updateMember,
    updateFamilyName,
    addMember,
    addMemberWithRelation,
    addRelation,
    removeRelation,
    removeAllMemberRelations,
    removeMember,
    removeFamily,
    saveCurrentFamily,
    loadUserFamilies,
    loadFamilyBySlug,
    createArchive,
    toggleEditing,
    setViewMode,
    resetStore,
  }
})
