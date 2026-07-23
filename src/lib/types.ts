// ─── Memory Type ───

export type MemoryType = 'travel' | 'daily' | 'anniversary' | 'first' | 'birthday' | 'surprise' | 'custom';

export type VisitedStatus = 'visited' | 'future';

export type Importance = 1 | 2 | 3;

export interface Memory {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  date: string;          // "YYYY-MM-DD"
  time?: string;         // "HH:mm"
  locationName: string;
  city?: string;
  country?: string;
  latitude: number;
  longitude: number;
  photos: string[];      // max 9, base64 data URLs
  coverPhoto: string;
  photoCaptions: string[];
  tags: string[];
  importance: Importance;
  memoryType: MemoryType;
  visitedStatus: VisitedStatus;
  anniversary: boolean;
  music?: string;
  voiceRecord?: string;
  createdAt: string;
  updatedAt: string;
  unlockDate?: string;
  isHidden: boolean;
  color?: string;       // 行星色彩 key, 如 'mercury' | 'venus' | 'earth' | ...
}

// ─── Settings ───

export type ParticleCount = 'full' | 'reduced' | 'off';

export interface AppSettings {
  autoRotate: boolean;
  musicEnabled: boolean;
  reducedMotion: boolean;
  particleCount: ParticleCount;
  sitePassword: string;
  isUnlocked: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  autoRotate: true,
  musicEnabled: false,
  reducedMotion: false,
  particleCount: 'full',
  sitePassword: 'ourworld',
  isUnlocked: false,
};

// ─── Location ───

export interface PendingLocation {
  lat: number;
  lng: number;
}

// ─── Geocode Result ───

export interface GeocodeResult {
  city: string;
  country: string;
  displayName: string;
}

// ─── Photo Upload ───

export interface PhotoFile {
  dataUrl: string;
  caption: string;
  file?: File;
}

// ─── Navigation ───

export type PageView = 'timeline' | 'list' | 'photos' | 'calendar';

// ─── 行星色彩系统 ───

export const PLANET_COLORS = {
  mercury:  { label: '水星 · Mercury',  hex: '#B5B5B5', css: '145,145,145' },
  venus:    { label: '金星 · Venus',    hex: '#E8C56A', css: '232,197,106' },
  moon:     { label: '月亮 · Moon',     hex: '#C8C0B0', css: '200,192,176' },
  sun:      { label: '太阳 · Sun',      hex: '#F0D060', css: '240,208,96'  },
  stars:    { label: '星星 · Stars',    hex: '#E0D8F0', css: '224,216,240' },
  mars:     { label: '火星 · Mars',     hex: '#D4735E', css: '212,115,94'  },
  jupiter:  { label: '木星 · Jupiter',  hex: '#D4A56A', css: '212,165,106' },
  saturn:   { label: '土星 · Saturn',   hex: '#E8D5A0', css: '232,213,160' },
  uranus:   { label: '天王星 · Uranus', hex: '#A0D8D4', css: '160,216,212' },
  neptune:  { label: '海王星 · Neptune',hex: '#6A8FBF', css: '106,143,191' },
} as const;

export type PlanetColor = keyof typeof PLANET_COLORS;

export const DEFAULT_PLANET_COLOR: PlanetColor = 'venus';

// ─── Constants ───

export const MAX_PHOTOS = 9;

export const DEFAULT_TAGS = [
  '旅行',
  '日常',
  '纪念日',
  '第一次',
  '生日',
  '惊喜',
  '散步',
  '晚餐',
  '毕业',
  '未来计划',
  '想再去一次',
];

export const MEMORY_TYPES: { value: MemoryType; label: string }[] = [
  { value: 'travel', label: '旅行' },
  { value: 'daily', label: '日常' },
  { value: 'anniversary', label: '纪念日' },
  { value: 'first', label: '第一次' },
  { value: 'birthday', label: '生日' },
  { value: 'surprise', label: '惊喜' },
  { value: 'custom', label: '自定义' },
];

export const PALETTE = {
  bgStart: '#EDF5FA',
  bgEnd: '#FFFFFF',
  sky: {
    50: '#F4F8FB',
    100: '#EDF5FA',
    200: '#E8F3FA',
    300: '#D4E8F2',
    400: '#9ECBE3',
    500: '#83BBD8',
    600: '#6FA9C8',
    700: '#5A8DA8',
  },
  deep: {
    200: '#A8BBC6',
    400: '#8197A5',
    700: '#3E5867',
    800: '#304B5C',
  },
  gold: {
    100: '#F0DFAE',
    200: '#E8D59A',
    300: '#E4C878',
    400: '#D4B860',
  },
  paper: '#FDF8F0',
  card: 'rgba(255, 255, 255, 0.7)',
};
