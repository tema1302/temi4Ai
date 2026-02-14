import type { Person } from '../types';

export const MOCK_PEOPLE: Person[] = [
  {
    id: 1,
    slug: 'ivan-ivanov',
    fullName: 'Иванов Иван Иванович',
    rank: 'ierey',
    status: 'white',
    regionSlug: 'moscow',
    address: 'Храм Христа Спасителя',
    coordinates: [55.7446, 37.6055],
    angelDay: '20 января',
    ordinationDate: '2020-05-15',
    graduationYear: 2015,
    contacts: {
      tg: 'otez_ivan',
    },
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
    isVerified: true,
    consentAccepted: true,
    lastUpdated: '2026-02-12',
  },
  {
    id: 2,
    slug: 'aleksey-petrov',
    fullName: 'Петров Алексей Сергеевич',
    rank: 'protoierey',
    status: 'white',
    regionSlug: 'tver',
    address: 'Спасо-Преображенский собор',
    coordinates: [56.8596, 35.9118],
    angelDay: '30 марта',
    ordinationDate: '2010-10-10',
    graduationYear: 2008,
    contacts: {
      phone: '+79001112233',
    },
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
    isVerified: false,
    consentAccepted: true,
    lastUpdated: '2026-02-12',
  }
];
