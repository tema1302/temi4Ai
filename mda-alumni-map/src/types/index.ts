export type Rank = 'chutets' | 'ipodiakon' | 'diakon' | 'ierey' | 'protoierey' | 'monakh' | 'ieromonakh' | 'igumen' | 'arkhimandrit' | 'episkop' | 'layman' | 'regent' | 'ikonopisets';

export interface Person {
  id: number;
  slug: string;
  fullName: string;
  rank: Rank;
  status: 'white' | 'monastic';
  regionSlug: string;
  address: string;
  coordinates: [number, number];
  angelDay: string;
  ordinationDate?: string;
  graduationYear?: number;
  contacts: {
    tg?: string;
    phone?: string;
    vk?: string;
  };
  photoUrl?: string;
  isVerified: boolean;
  consentAccepted: boolean;
  lastUpdated: string;
}

export interface Region {
  slug: string;
  name: string;
}

export interface RankInfo {
  slug: Rank;
  label: string;
  color: string;
}
