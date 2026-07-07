import { GRID } from '../../shared/constants';

export const HEADER_BOX_SX = {
  display: 'grid',
  gridTemplateColumns: GRID,
  alignItems: 'center',
  gap: 1,
  mt: 2,
  px: '12px',
  pb: 1,
  borderBottom: '1px solid rgba(255,255,255,0.08)',
} as const;

export const HEADER_LABEL_SX = {
  opacity: 0.4,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontSize: '0.65rem',
} as const;

export const WINS_CHIP_SX = {
  height: 20,
  fontSize: '0.7rem',
  fontWeight: 700,
  bgcolor: 'rgba(249,115,22,0.18)',
  color: '#f97316',
  border: '1px solid rgba(249,115,22,0.35)',
  '& .MuiChip-label': { px: 1 },
} as const;

export const TIME_SX = {
  textAlign: 'right',
  color: '#34d399',
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
} as const;
