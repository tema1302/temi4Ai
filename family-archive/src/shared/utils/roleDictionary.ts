export type RelationRole =
  | 'parent' | 'child' | 'spouse' | 'sibling'
  | 'husband' | 'wife' | 'brother' | 'sister'
  | 'father' | 'mother' | 'son' | 'daughter'
  | 'grandfather' | 'grandmother' | 'grandson' | 'granddaughter'
  | 'great_grandfather' | 'great_grandmother' | 'great_grandson' | 'great_granddaughter'
  | 'uncle' | 'aunt' | 'nephew' | 'niece'
  | 'cousin_male' | 'cousin_female'
  | 'ancestor' | 'descendant'

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
  // Родители
  { value: 'father', label: 'Отец', gender: 'male' },
  { value: 'mother', label: 'Мать', gender: 'female' },
  { value: 'parent', label: 'Родитель' },

  // Дети
  { value: 'son', label: 'Сын', gender: 'male' },
  { value: 'daughter', label: 'Дочь', gender: 'female' },
  { value: 'child', label: 'Ребёнок' },

  // Супруги
  { value: 'husband', label: 'Муж', gender: 'male' },
  { value: 'wife', label: 'Жена', gender: 'female' },
  { value: 'spouse', label: 'Супруг(а)' },

  // Братья/сёстры
  { value: 'brother', label: 'Брат', gender: 'male' },
  { value: 'sister', label: 'Сестра', gender: 'female' },
  { value: 'sibling', label: 'Брат/Сестра' },

  // Дедушки/бабушки
  { value: 'grandfather', label: 'Дедушка', gender: 'male' },
  { value: 'grandmother', label: 'Бабушка', gender: 'female' },

  // Внуки
  { value: 'grandson', label: 'Внук', gender: 'male' },
  { value: 'granddaughter', label: 'Внучка', gender: 'female' },

  // Прадедушки/прабабушки
  { value: 'great_grandfather', label: 'Прадедушка', gender: 'male' },
  { value: 'great_grandmother', label: 'Прабабушка', gender: 'female' },

  // Правнуки
  { value: 'great_grandson', label: 'Правнук', gender: 'male' },
  { value: 'great_granddaughter', label: 'Правнучка', gender: 'female' },

  // Дяди/тёти
  { value: 'uncle', label: 'Дядя', gender: 'male' },
  { value: 'aunt', label: 'Тётя', gender: 'female' },

  // Племянники
  { value: 'nephew', label: 'Племянник', gender: 'male' },
  { value: 'niece', label: 'Племянница', gender: 'female' },

  // Двоюродные
  { value: 'cousin_male', label: 'Двоюродный брат', gender: 'male' },
  { value: 'cousin_female', label: 'Двоюродная сестра', gender: 'female' },

  // Для дальних родственников
  { value: 'ancestor', label: 'Предок (старшее поколение)', gender: 'male' },
  { value: 'descendant', label: 'Потомок', gender: 'male' }
]

export const getRoleLabel = (role: string): string => {
  return ROLE_DICTIONARY.find(r => r.value === role)?.label || role
}
