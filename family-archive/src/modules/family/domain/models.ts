// Чистая бизнес-сущность. Не зависит от базы данных.

// Типы родственных связей (в БД сохраняются только базовые: parent, spouse, sibling)
export type RelationType = 
  | 'parent' | 'spouse' | 'sibling' | 'child'
  | 'father' | 'mother' | 'son' | 'daughter' 
  | 'husband' | 'wife' | 'brother' | 'sister'

// Тип пола
export type Gender = 'male' | 'female' | 'unknown'

// Связь между членами семьи
export interface FamilyRelation {
  id: string
  fromMemberId: string    // UUID члена семьи (от кого)
  toMemberId: string      // UUID члена семьи (к кому)
  relationType: RelationType
  createdAt: string
}

export interface FamilyMember {
  id: string
  name: string
  relationship?: string      // Устарело, оставлено для совместимости
  gender?: Gender
  generation?: number        // Поколение (0 = текущий, -1 = родители, +1 = дети)
  displayRole?: string       // Отображаемая роль (для UI)
  birthDate: string
  deathDate?: string
  biography: string
  lifePath?: { year: string; title: string; description: string }[]
  photoUrl: string
  photos: string[]
  videos?: string[]
  quotes: string[]
  // Позиция на семейном древе (сохраняется при drag-and-drop)
  treePosition?: { x: number; y: number }
}

export interface FamilyArchive {
  id: string // slug
  name: string
  heroImage: string
  ownerId?: string              // ID владельца (user_id в БД)
  members: FamilyMember[]
  relations: FamilyRelation[]   // Связи между членами
  rootMemberId?: string         // ID корневого члена (обычно "self")
  createdAt: string
  updatedAt: string
}

// Фабрика для создания пустого члена семьи
export function createEmptyMember(): FamilyMember {
  return {
    id: crypto.randomUUID(),
    name: '',
    relationship: '',
    gender: 'unknown',
    generation: 0,
    displayRole: '',
    birthDate: '',
    biography: '',
    lifePath: [],
    photoUrl: '',
    photos: [],
    videos: [],
    quotes: []
  }
}

// Фабрика для создания пустой связи
export function createEmptyRelation(
  fromMemberId: string,
  toMemberId: string,
  relationType: RelationType
): FamilyRelation {
  return {
    id: crypto.randomUUID(),
    fromMemberId,
    toMemberId,
    relationType,
    createdAt: new Date().toISOString()
  }
}

// Хелпер для получения названия роли на русском
export function getRelationLabel(type: RelationType, gender?: Gender): string {
  switch (type) {
    case 'parent':
      return gender === 'female' ? 'Мать' : 'Отец'
    case 'spouse':
      return gender === 'female' ? 'Супруга' : 'Супруг'
    case 'sibling':
      return gender === 'female' ? 'Сестра' : 'Брат'
    default:
      return 'Родственник'
  }
}

// Хелпер для инвертирования типа связи
export function invertRelationType(type: RelationType): RelationType {
  switch (type) {
    case 'parent':
      return 'child' as RelationType  // будет обработано как parent в обратную сторону
    case 'spouse':
      return 'spouse'
    case 'sibling':
      return 'sibling'
    default:
      return type
  }
}

// Вычислить роль относительно корневого члена ("меня")
// Возвращает роль в формате: "Бабушка", "Дедушка", "Отец", "Мать", etc.
export function calculateDisplayRole(
  memberId: string,
  rootMemberId: string | undefined,
  members: FamilyMember[],
  relations: FamilyRelation[]
): string {
  const member = members.find(m => m.id === memberId)
  if (!member) return 'Родственник'

  // Если это корневой член (я) - показываем "Я"
  if (rootMemberId && memberId === rootMemberId) {
    return 'Я'
  }

  // Если нет корневого члена, используем displayRole из профиля или базовую роль
  if (!rootMemberId) {
    if (member.displayRole) return member.displayRole
    if (member.relationship) return member.relationship
    // Возвращаем базовую роль на основе gender
    return member.gender === 'female' ? 'Родственница' : 'Родственник'
  }

  const gender = member.gender

  // Строим путь от корня к данному члену через связи
  // Используем BFS для поиска кратчайшего пути
  const visited = new Set<string>()
  const queue: { id: string; path: { memberId: string; relationType: RelationType; direction: 'forward' | 'backward' }[] }[] = [
    { id: rootMemberId, path: [] }
  ]

  // Строим граф связей (двунаправленный)
  const graph = new Map<string, { neighborId: string; relationType: RelationType; direction: 'forward' | 'backward' }[]>()

  relations.forEach(r => {
    if (!graph.has(r.fromMemberId)) graph.set(r.fromMemberId, [])
    if (!graph.has(r.toMemberId)) graph.set(r.toMemberId, [])

    graph.get(r.fromMemberId)!.push({
      neighborId: r.toMemberId,
      relationType: r.relationType,
      direction: 'forward'
    })

    // Обратная связь
    let inverseType: RelationType = r.relationType
    if (r.relationType === 'parent') {
      inverseType = 'parent' // родитель в обратную сторону = ребёнок (обрабатываем specially)
    }
    graph.get(r.toMemberId)!.push({
      neighborId: r.fromMemberId,
      relationType: inverseType,
      direction: 'backward'
    })
  })

  // BFS
  while (queue.length > 0) {
    const current = queue.shift()!
    if (current.id === memberId) {
      return pathToRole(current.path, gender)
    }

    if (visited.has(current.id)) continue
    visited.add(current.id)

    const neighbors = graph.get(current.id) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.neighborId)) {
        const relationType = neighbor.direction === 'backward' && neighbor.relationType === 'parent'
          ? 'parent' // идём от ребёнка к родителю
          : neighbor.relationType

        queue.push({
          id: neighbor.neighborId,
          path: [...current.path, { memberId: neighbor.neighborId, relationType, direction: neighbor.direction }]
        })
      }
    }
  }

  // Если путь не найден, возвращаем базовую роль
  return getRelationLabel('parent', gender)
}

// Преобразовать путь связей в название роли
function pathToRole(
  path: { memberId: string; relationType: RelationType; direction: 'forward' | 'backward' }[],
  targetGender?: Gender
): string {
  if (path.length === 0) return 'Я'

  // Анализируем путь для определения роли
  let generationsUp = 0  // количество переходов "вверх" (к родителям)
  let generationsDown = 0  // количество переходов "вниз" (к детям)
  let isSpouse = false
  let isSibling = false

  for (const step of path) {
    if (step.relationType === 'parent') {
      if (step.direction === 'backward') {
        // Идём от ребёнка к родителю = вверх по поколениям
        generationsUp++
      } else {
        // Идём от родителя к ребёнку = вниз
        generationsDown++
      }
    } else if (step.relationType === 'spouse') {
      isSpouse = true
    } else if (step.relationType === 'sibling') {
      isSibling = true
    }
  }

  const netGeneration = generationsUp - generationsDown
  const isFemale = targetGender === 'female'

  // Определяем роль на основе чистого поколения
  if (isSibling) {
    return isFemale ? 'Сестра' : 'Брат'
  }

  if (netGeneration === 0 && isSpouse) {
    return isFemale ? 'Супруга' : 'Супруг'
  }

  if (netGeneration === 1) {
    // Родитель
    return isFemale ? 'Мать' : 'Отец'
  }

  if (netGeneration === 2) {
    // Дедушка/Бабушка
    return isFemale ? 'Бабушка' : 'Дедушка'
  }

  if (netGeneration === 3) {
    // Прадедушка/Прабабушка
    return isFemale ? 'Прабабушка' : 'Прадедушка'
  }

  if (netGeneration === -1) {
    // Ребёнок
    return isFemale ? 'Дочь' : 'Сын'
  }

  if (netGeneration === -2) {
    // Внук/Внучка
    return isFemale ? 'Внучка' : 'Внук'
  }

  if (netGeneration === -3) {
    // Правнук/Правнучка
    return isFemale ? 'Правнучка' : 'Правнук'
  }

  // Для более дальних родственников
  if (netGeneration > 0) {
    return isFemale ? 'Пра-пра-бабушка' : 'Пра-пра-дедушка'
  }

  if (netGeneration < 0) {
    return isFemale ? 'Пра-пра-внучка' : 'Пра-пра-внук'
  }

  return isFemale ? 'Родственница' : 'Родственник'
}
