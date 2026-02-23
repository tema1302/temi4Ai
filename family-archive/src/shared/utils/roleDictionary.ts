export type RelationRole = 'parent' | 'child' | 'spouse' | 'sibling' | 'husband' | 'wife' | 'brother' | 'sister' | 'father' | 'mother' | 'son' | 'daughter'

export interface RoleOption {
  value: RelationRole
  label: string
  gender?: 'male' | 'female'
}

/**
 * ROLE DICTIONARY
 * TODO: Unify with src/modules/family/domain/models.ts:getRelationLabel
 * and the BFS-based calculateDisplayRole to avoid source of truth mismatch.
 */
export const ROLE_DICTIONARY: RoleOption[] = [
  { value: 'father', label: 'Отец', gender: 'male' },
  { value: 'mother', label: 'Мать', gender: 'female' },
  { value: 'son', label: 'Сын', gender: 'male' },
  { value: 'daughter', label: 'Дочь', gender: 'female' },
  { value: 'husband', label: 'Муж', gender: 'male' },
  { value: 'wife', label: 'Жена', gender: 'female' },
  { value: 'brother', label: 'Брат', gender: 'male' },
  { value: 'sister', label: 'Сестра', gender: 'female' },
  { value: 'parent', label: 'Родитель' },
  { value: 'child', label: 'Ребенок' },
  { value: 'spouse', label: 'Супруг(а)' },
  { value: 'sibling', label: 'Брат/Сестра' }
]

export const getRoleLabel = (role: string): string => {
  return ROLE_DICTIONARY.find(r => r.value === role)?.label || role
}
