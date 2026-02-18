export enum FamilyRole {
  SELF = 'self',
  MOTHER = 'mother',
  FATHER = 'father',
  SPOUSE = 'spouse',
  CHILD = 'child',
  BROTHER = 'brother',
  SISTER = 'sister',
  GRANDMOTHER = 'grandmother',
  GRANDFATHER = 'grandfather',
  GREAT_GRANDMOTHER = 'great_grandmother',
  GREAT_GRANDFATHER = 'great_grandfather'
}

export interface RoleConfig {
  role: FamilyRole;
  label: string;
  gridArea: string;
  isActive?: boolean;
}

export const FAMILY_STRUCTURE_CONFIG: RoleConfig[] = [
  { role: FamilyRole.CHILD, label: 'Ребенок', gridArea: 'child' },
  { role: FamilyRole.SISTER, label: 'Сестра', gridArea: 'sister' },
  { role: FamilyRole.SELF, label: 'Это Вы', gridArea: 'self', isActive: true },
  { role: FamilyRole.SPOUSE, label: 'Супруг(а)', gridArea: 'spouse' },
  { role: FamilyRole.BROTHER, label: 'Брат', gridArea: 'brother' },
  { role: FamilyRole.MOTHER, label: 'Мама', gridArea: 'mother' },
  { role: FamilyRole.FATHER, label: 'Папа', gridArea: 'father' },
  { role: FamilyRole.GRANDMOTHER, label: 'Бабушка', gridArea: 'g-mother' },
  { role: FamilyRole.GRANDFATHER, label: 'Дедушка', gridArea: 'g-father' },
  { role: FamilyRole.GREAT_GRANDMOTHER, label: 'Прабабушка', gridArea: 'gg-mother' },
  { role: FamilyRole.GREAT_GRANDFATHER, label: 'Прадедушка', gridArea: 'gg-father' },
];
