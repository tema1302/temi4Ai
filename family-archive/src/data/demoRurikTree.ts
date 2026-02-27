import type { FamilyArchive } from '@/modules/family/domain/models'

// Demo data: Rurik Dynasty from Rurik to Nicholas II
// Covers over 1000 years of Russian history (862-1918)
// Layout: Snake pattern - generations go left-to-right, then right-to-left, etc.

export const RURIK_FAMILY_DEMO: FamilyArchive = {
  id: 'rurik-dynasty-demo',
  name: 'Рюриковичи и Романовы',
  heroImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Rurik_Semiradsky.jpg/440px-Rurik_Semiradsky.jpg',
  members: [
    // ===== RURIKOVICHI DYNASTY =====
    // Generation 0: Rurik (founder)
    {
      id: 'rurik',
      name: 'Рюрик',
      displayRole: 'Основатель династии',
      gender: 'male',
      generation: 0,
      birthDate: '~830',
      deathDate: '879',
      biography: 'Легендарный варяг, первый князь Древней Руси. Согласно «Повести временных лет», был призван на княжение новгородцами в 862 году.',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Rurik_Semiradsky.jpg/440px-Rurik_Semiradsky.jpg',
      photos: [],
      quotes: [],
    },
    // Generation 1
    {
      id: 'oleg',
      name: 'Олег Вещий',
      displayRole: 'Князь Киевский',
      gender: 'male',
      generation: 1,
      birthDate: '?',
      deathDate: '912',
      biography: 'Преемник Рюрика, родственник (возможно, племянник). Объединил Северную и Южную Русь, перенёс столицу в Киев.',
      photoUrl: '',
      photos: [],
      quotes: ['«Се буду мати градом русским»'],
    },
    {
      id: 'igor',
      name: 'Игорь Рюрикович',
      displayRole: 'Князь Киевский',
      gender: 'male',
      generation: 1,
      birthDate: '~878',
      deathDate: '945',
      biography: 'Сын Рюрика. Продолжил объединение славянских племён. Погиб от древлян при сборе дани.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    {
      id: 'olga',
      name: 'Княгиня Ольга',
      displayRole: 'Княгиня Киевская',
      gender: 'female',
      generation: 1,
      birthDate: '~890',
      deathDate: '969',
      biography: 'Жена Игоря, первая русская княгиня-христианка. Канонизирована как равноапостольная. Провела налоговую реформу.',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Svyatya_knyaginya_Olga.jpg/440px-Svyataya_knyaginya_Olga.jpg',
      photos: [],
      quotes: ['«Мстить должна я за мужа моего»'],
    },
    // Generation 2
    {
      id: 'svyatoslav',
      name: 'Святослав Игоревич',
      displayRole: 'Князь Киевский',
      gender: 'male',
      generation: 2,
      birthDate: '~942',
      deathDate: '972',
      biography: 'Сын Игоря и Ольги. Великий воин, разгромил Хазарский каганат. Погиб в бою с печенегами.',
      photoUrl: '',
      photos: [],
      quotes: ['«Иду на вы!»', '«Мёртвые сраму не имут»'],
    },
    // Generation 3
    {
      id: 'vladimir',
      name: 'Владимир Святой',
      displayRole: 'Князь Киевский',
      gender: 'male',
      generation: 3,
      birthDate: '~958',
      deathDate: '1015',
      biography: 'Сын Святослава. Крестил Русь в 988 году. Канонизирован как равноапостольный.',
      photoUrl: '',
      photos: [],
      quotes: ['«Один Бог на небе и один князь на земле»'],
    },
    // Generation 4
    {
      id: 'yaroslav',
      name: 'Ярослав Мудрый',
      displayRole: 'Князь Киевский',
      gender: 'male',
      generation: 4,
      birthDate: '~978',
      deathDate: '1054',
      biography: 'Сын Владимира. При нём создана «Русская Правда» — первый письменный свод законов. Расцвет Древней Руси.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 5
    {
      id: 'monomakh',
      name: 'Владимир Мономах',
      displayRole: 'Князь Киевский',
      gender: 'male',
      generation: 5,
      birthDate: '1053',
      deathDate: '1125',
      biography: 'Внук Ярослава Мудрого. Остановил раздробленность, объединил русские земли. Автор «Поучения».',
      photoUrl: '',
      photos: [],
      quotes: ['«Лже есть враг всему роду человеческому»'],
    },
    // Generation 6
    {
      id: 'dolgoruky',
      name: 'Юрий Долгорукий',
      displayRole: 'Князь Киевский',
      gender: 'male',
      generation: 6,
      birthDate: '~1099',
      deathDate: '1157',
      biography: 'Сын Мономаха. Основатель Москвы (первое упоминание в 1147).',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    {
      id: 'bogolyubsky',
      name: 'Андрей Боголюбский',
      displayRole: 'Князь Владимирский',
      gender: 'male',
      generation: 7,
      birthDate: '~1111',
      deathDate: '1174',
      biography: 'Сын Юрия Долгорукого. Перенёс столицу во Владимир. Построил Успенский собор.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    {
      id: 'vsevolod',
      name: 'Всеволод Большое Гнездо',
      displayRole: 'Князь Владимирский',
      gender: 'male',
      generation: 7,
      birthDate: '1154',
      deathDate: '1212',
      biography: 'Брат Андрея Боголюбского. Имел 8 сыновей, отсюда прозвище. Сильнейший князь Руси.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 8
    {
      id: 'nevsky',
      name: 'Александр Невский',
      displayRole: 'Князь Владимирский',
      gender: 'male',
      generation: 8,
      birthDate: '1221',
      deathDate: '1263',
      biography: 'Победил шведов на Неве (1240) и немецких рыцарей на Чудском озере (1242). Канонизирован.',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Alexander_Nevsky.jpg/440px-Alexander_Nevsky.jpg',
      photos: [],
      quotes: ['«Кто с мечом к нам придёт, тот от меча и погибнет»'],
    },
    {
      id: 'daniil',
      name: 'Даниил Московский',
      displayRole: 'Князь Московский',
      gender: 'male',
      generation: 8,
      birthDate: '1261',
      deathDate: '1303',
      biography: 'Младший сын Невского. Основатель московской княжеской династии. Канонизирован.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 9
    {
      id: 'kalita',
      name: 'Иван Калита',
      displayRole: 'Князь Московский',
      gender: 'male',
      generation: 9,
      birthDate: '~1283',
      deathDate: '1340',
      biography: 'Внук Невского, сын Даниила. «Собиратель земель русских». Прозвище от слова «калита» (кошелёк).',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 10
    {
      id: 'donskoy',
      name: 'Дмитрий Донской',
      displayRole: 'Князь Московский',
      gender: 'male',
      generation: 10,
      birthDate: '1350',
      deathDate: '1389',
      biography: 'Внук Калиты. Первая победа над Ордой в Куликовской битве (1380). Канонизирован.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 11
    {
      id: 'ivan3',
      name: 'Иван III',
      displayRole: 'Государь Всея Руси',
      gender: 'male',
      generation: 11,
      birthDate: '1440',
      deathDate: '1505',
      biography: 'Освободил Русь от ордынского ига (1480). Принял титул «Государь Всея Руси». Построил Кремль.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 12
    {
      id: 'vasily3',
      name: 'Василий III',
      displayRole: 'Государь Всея Руси',
      gender: 'male',
      generation: 12,
      birthDate: '1479',
      deathDate: '1533',
      biography: 'Сын Ивана III. Продолжил объединение русских земель. Присоединил Псков и Смоленск.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 13
    {
      id: 'ivan4',
      name: 'Иван IV Грозный',
      displayRole: 'Царь Всея Руси',
      gender: 'male',
      generation: 13,
      birthDate: '1530',
      deathDate: '1584',
      biography: 'Первый русский царь (с 1547). Реформы, взятие Казани и Астрахани. Ввёл опричнину.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },

    // ===== ROMANOV DYNASTY =====
    // Generation 14
    {
      id: 'michael',
      name: 'Михаил Фёдорович',
      displayRole: 'Царь Всея Руси',
      gender: 'male',
      generation: 14,
      birthDate: '1596',
      deathDate: '1645',
      biography: 'Первый царь из династии Романовых. Избран Земским собором в 1613. Правнук Ивана Грозного по женской линии.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 15
    {
      id: 'peter1',
      name: 'Пётр I',
      displayRole: 'Император Всероссийский',
      gender: 'male',
      generation: 15,
      birthDate: '1672',
      deathDate: '1725',
      biography: 'Первый император России (с 1721). Реформы, создание флота, строительство Санкт-Петербурга.',
      photoUrl: '',
      photos: [],
      quotes: ['«Оный подданный»'],
    },
    {
      id: 'catherine2',
      name: 'Екатерина II',
      displayRole: 'Императрица Всероссийская',
      gender: 'female',
      generation: 15,
      birthDate: '1729',
      deathDate: '1796',
      biography: '«Великая». Расширение границ, освоение Крыма и Новороссии. Золотой век дворянства.',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Louis_Tocqu%C3%A9_-_Catherine_II_of_Russia_-_WGA22654.jpg/440px-Louis_Tocqu%C3%A9_-_Catherine_II_of_Russia_-_WGA22654.jpg',
      photos: [],
      quotes: [],
    },
    // Generation 16
    {
      id: 'alexander1',
      name: 'Александр I',
      displayRole: 'Император Всероссийский',
      gender: 'male',
      generation: 16,
      birthDate: '1777',
      deathDate: '1825',
      biography: 'Внук Екатерины II. Победа над Наполеоном (1812). Священный союз.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    {
      id: 'nicholas1',
      name: 'Николай I',
      displayRole: 'Император Всероссийский',
      gender: 'male',
      generation: 16,
      birthDate: '1796',
      deathDate: '1855',
      biography: 'Брат Александра I. Восстание декабристов, Крымская война.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 17
    {
      id: 'alexander2',
      name: 'Александр II',
      displayRole: 'Император Всероссийский',
      gender: 'male',
      generation: 17,
      birthDate: '1818',
      deathDate: '1881',
      biography: '«Освободитель». Отменил крепостное право (1861). Погиб от бомбы народовольцев.',
      photoUrl: '',
      photos: [],
      quotes: [],
    },
    // Generation 18
    {
      id: 'alexander3',
      name: 'Александр III',
      displayRole: 'Император Всероссийский',
      gender: 'male',
      generation: 18,
      birthDate: '1845',
      deathDate: '1894',
      biography: '«Миротворец». Не вёл войн. Развитие промышленности, транссибирская магистраль.',
      photoUrl: '',
      photos: [],
      quotes: ['«У России есть только два союзника: армия и флот»'],
    },
    // Generation 19
    {
      id: 'nicholas2',
      name: 'Николай II',
      displayRole: 'Император Всероссийский',
      gender: 'male',
      generation: 19,
      birthDate: '1868',
      deathDate: '1918',
      biography: 'Последний император России. Отрёкся в 1917. Расстрелян большевиками с семьёй. Канонизирован.',
      photoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Nicholas_II_by_Boissonnas_%26_Eggler_c._May_1912.jpg/440px-Nicholas_II_by_Boissonnas_%26_Eggler_c._May_1912.jpg',
      photos: [],
      quotes: ['«Нет такой жертвы, которую я бы не принёс ради истинного блага и спасения России»'],
    },
  ],
  relations: [
    // ===== RURIKOVICHI LINE =====
    // Rurik -> Igor (parent)
    { id: 'r1', fromMemberId: 'rurik', toMemberId: 'igor', relationType: 'parent', createdAt: '' },
    // Igor + Olga (spouse)
    { id: 'r2', fromMemberId: 'igor', toMemberId: 'olga', relationType: 'spouse', createdAt: '' },
    // Igor -> Svyatoslav (parent)
    { id: 'r3', fromMemberId: 'igor', toMemberId: 'svyatoslav', relationType: 'parent', createdAt: '' },
    // Svyatoslav -> Vladimir (parent)
    { id: 'r5', fromMemberId: 'svyatoslav', toMemberId: 'vladimir', relationType: 'parent', createdAt: '' },
    // Vladimir -> Yaroslav (parent)
    { id: 'r6', fromMemberId: 'vladimir', toMemberId: 'yaroslav', relationType: 'parent', createdAt: '' },
    // Yaroslav -> Monomakh (grandfather, simplified as parent)
    { id: 'r7', fromMemberId: 'yaroslav', toMemberId: 'monomakh', relationType: 'parent', createdAt: '' },
    // Monomakh -> Dolgoruky (parent)
    { id: 'r8', fromMemberId: 'monomakh', toMemberId: 'dolgoruky', relationType: 'parent', createdAt: '' },
    // Dolgoruky -> Bogolyubsky (parent)
    { id: 'r9', fromMemberId: 'dolgoruky', toMemberId: 'bogolyubsky', relationType: 'parent', createdAt: '' },
    // Dolgoruky -> Vsevolod (parent)
    { id: 'r10', fromMemberId: 'dolgoruky', toMemberId: 'vsevolod', relationType: 'parent', createdAt: '' },
    // Bogolyubsky & Vsevolod - siblings
    { id: 'r10b', fromMemberId: 'bogolyubsky', toMemberId: 'vsevolod', relationType: 'sibling', createdAt: '' },
    // Vsevolod -> Nevsky (grandfather chain, simplified)
    { id: 'r11', fromMemberId: 'vsevolod', toMemberId: 'nevsky', relationType: 'parent', createdAt: '' },
    // Nevsky -> Daniil (parent)
    { id: 'r12', fromMemberId: 'nevsky', toMemberId: 'daniil', relationType: 'parent', createdAt: '' },
    // Nevsky & Daniil - siblings for layout
    { id: 'r12b', fromMemberId: 'nevsky', toMemberId: 'daniil', relationType: 'sibling', createdAt: '' },
    // Daniil -> Kalita (parent)
    { id: 'r13', fromMemberId: 'daniil', toMemberId: 'kalita', relationType: 'parent', createdAt: '' },
    // Kalita -> Donskoy (grandfather, simplified)
    { id: 'r14', fromMemberId: 'kalita', toMemberId: 'donskoy', relationType: 'parent', createdAt: '' },
    // Donskoy -> Ivan3 (simplified chain)
    { id: 'r15', fromMemberId: 'donskoy', toMemberId: 'ivan3', relationType: 'parent', createdAt: '' },
    // Ivan3 -> Vasily3 (parent)
    { id: 'r16', fromMemberId: 'ivan3', toMemberId: 'vasily3', relationType: 'parent', createdAt: '' },
    // Vasily3 -> Ivan4 (parent)
    { id: 'r17', fromMemberId: 'vasily3', toMemberId: 'ivan4', relationType: 'parent', createdAt: '' },

    // ===== ROMANOV TRANSITION =====
    // Ivan4 -> Michael (great-grandson, simplified)
    { id: 'r18', fromMemberId: 'ivan4', toMemberId: 'michael', relationType: 'parent', createdAt: '' },
    // Michael -> Peter1 (simplified)
    { id: 'r19', fromMemberId: 'michael', toMemberId: 'peter1', relationType: 'parent', createdAt: '' },
    // Peter1 + Catherine2 (spouse)
    { id: 'r20', fromMemberId: 'peter1', toMemberId: 'catherine2', relationType: 'spouse', createdAt: '' },
    // Catherine2 -> Alexander1 (grandson, simplified)
    { id: 'r21', fromMemberId: 'catherine2', toMemberId: 'alexander1', relationType: 'parent', createdAt: '' },
    // Alexander1 -> Nicholas1 (brother succession, sibling)
    { id: 'r22', fromMemberId: 'alexander1', toMemberId: 'nicholas1', relationType: 'sibling', createdAt: '' },
    // Nicholas1 -> Alexander2 (parent)
    { id: 'r23', fromMemberId: 'nicholas1', toMemberId: 'alexander2', relationType: 'parent', createdAt: '' },
    // Alexander2 -> Alexander3 (parent)
    { id: 'r24', fromMemberId: 'alexander2', toMemberId: 'alexander3', relationType: 'parent', createdAt: '' },
    // Alexander3 -> Nicholas2 (parent)
    { id: 'r25', fromMemberId: 'alexander3', toMemberId: 'nicholas2', relationType: 'parent', createdAt: '' },
  ],
  rootMemberId: 'rurik',
  createdAt: '2025-01-01',
  updatedAt: '2025-01-01'
}

// Statistics for display
export const RURIK_STATS = {
  generations: 20,
  years: '862-1918',
  totalYears: 1056,
  rulers: 26,
  keyEvents: [
    { year: '862', event: 'Призвание Рюрика' },
    { year: '988', event: 'Крещение Руси' },
    { year: '1147', event: 'Основание Москвы' },
    { year: '1380', event: 'Куликовская битва' },
    { year: '1480', event: 'Освобождение от ига' },
    { year: '1547', event: 'Первый царь' },
    { year: '1613', event: 'Династия Романовых' },
    { year: '1721', event: 'Российская империя' },
    { year: '1812', event: 'Победа над Наполеоном' },
    { year: '1861', event: 'Отмена крепостничества' },
    { year: '1917', event: 'Отречение Николая II' },
  ]
}
