import type { RankInfo, Region } from '../types';

export const RANKS: RankInfo[] = [
  { slug: 'episkop', label: 'Епископ', color: '#7e22ce' },
  { slug: 'arkhimandrit', label: 'Архимандрит', color: '#1e293b' },
  { slug: 'igumen', label: 'Игумен', color: '#334155' },
  { slug: 'protoierey', label: 'Протоиерей', color: '#d4af37' },
  { slug: 'ieromonakh', label: 'Иеромонах', color: '#475569' },
  { slug: 'ierey', label: 'Иерей', color: '#ef4444' },
  { slug: 'diakon', label: 'Диакон', color: '#64748b' },
  { slug: 'monakh', label: 'Монах', color: '#1e293b' },
  { slug: 'ipodiakon', label: 'Иподиакон', color: '#334155' },
  { slug: 'chutets', label: 'Чтец', color: '#94a3b8' },
  { slug: 'regent', label: 'Регент', color: '#0d9488' }, // Teal
  { slug: 'ikonopisets', label: 'Иконописец', color: '#b45309' }, // Amber
  { slug: 'layman', label: 'Мирянин', color: '#475569' }, // Slate
];

export const REGIONS: Region[] = [
  { slug: 'moscow', name: 'Москва' },
  { slug: 'moscow-region', name: 'Московская область' },
  { slug: 'tver', name: 'Тверь' },
  { slug: 'spb', name: 'Санкт-Петербург' },
  // ... more regions
];
