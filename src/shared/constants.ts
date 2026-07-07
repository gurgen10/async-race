// ── Garage — car generator ────────────────────────────────────────────────

export const BRANDS: string[] = [
  'Tesla', 'Ford', 'BMW', 'Audi', 'Ferrari',
  'Lamborghini', 'Porsche', 'Toyota', 'Honda', 'Chevrolet',
  'Dodge', 'Bugatti', 'McLaren', 'Aston Martin', 'Jaguar',
  'Maserati', 'Bentley', 'Rolls-Royce', 'Koenigsegg', 'Pagani',
];

export const MODELS: string[] = [
  'Model S', 'Mustang', 'M3', 'R8', '488',
  'Huracán', '911', 'Supra', 'NSX', 'Corvette',
  'Charger', 'Chiron', '720S', 'DB11', 'F-Type',
  'GranTurismo', 'Continental', 'Ghost', 'Jesko', 'Zonda',
];

export const COLORS: string[] = [
  '#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c',
  '#3498db', '#9b59b6', '#e91e63', '#ff5722', '#00bcd4',
  '#8bc34a', '#ff9800', '#673ab7', '#f44336', '#4caf50',
  '#2196f3', '#ff4081', '#00e676', '#ff6d00', '#aa00ff',
];

export const GENERATE_COUNT: number = 100;
export const DEFAULT_COLOR: string = '#e74c3c';

// ── Garage — UI ───────────────────────────────────────────────────────────

export const RACE_LOCK_OPACITY: number = 0.3;
export const CREATED_CAR_ICON_SIZE: number = 72;

// ── Garage — race track / animation ──────────────────────────────────────

export const CAR_W: number = 56;
export const RETURN_TRANSITION_MS: number = 450;
export const START_LINE_W: number = 14;
export const LANE_DASH_OFFSET: number = 18;

export const CE_PATHS: string[] = [
  'M 20 20 L 64 20 L 64 56 L 20 56 Z',
  'M 36 20 L 36 6 L 40 6 L 40 12 L 44 12 L 44 6 L 50 6 L 50 12 L 54 12 L 54 6 L 58 6 L 58 20',
  'M 20 28 L 7 28 L 7 34 L 20 34',
  'M 20 43 L 7 43 L 7 49 L 20 49',
  'M 64 30 L 79 30 L 79 42 L 69 42 L 69 52 L 83 52',
];

// ── Winners ───────────────────────────────────────────────────────────────

export const TIME_DECIMAL_PLACES: number = 2;
export const CAR_ICON_SIZE: number = 52;

export const COL = {
  rank: '36px',
  car: '64px',
  name: '1fr',
  wins: '56px',
  time: '72px',
} as const;

export const GRID = `${COL.rank} ${COL.car} ${COL.name} ${COL.wins} ${COL.time}`;

export const HEADER_LABELS = ['№', 'Car', 'Name', 'Wins', 'Best time'] as const;

// Inline the WinnerSortField union to keep shared free of feature imports
export const SORTABLE: Record<string, 'id' | 'wins' | 'time' | undefined> = {
  '№': 'id',
  Wins: 'wins',
  'Best time': 'time',
};
