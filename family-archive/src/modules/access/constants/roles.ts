export enum ArchiveRole {
  OWNER = 'owner',      // Создатель: полный доступ + управление участниками
  EDITOR = 'editor',    // Редактор: изменение данных и структуры графа
  CONTRIBUTOR = 'contributor', // Участник (Итерация 2): только контент
  VIEWER = 'viewer'     // Наблюдатель: только чтение
}

export type Capability = 'canEditTree' | 'canManageUsers' | 'canDeleteNodes' | 'canEditContent'

export const ROLE_CAPABILITIES: Record<ArchiveRole, Capability[]> = {
  [ArchiveRole.OWNER]: ['canEditTree', 'canManageUsers', 'canDeleteNodes', 'canEditContent'],
  [ArchiveRole.EDITOR]: ['canEditTree', 'canDeleteNodes', 'canEditContent'],
  [ArchiveRole.CONTRIBUTOR]: ['canEditContent'],
  [ArchiveRole.VIEWER]: []
}
