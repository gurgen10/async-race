export const STOP_BTN_SX = {
  width: 28,
  height: 28,
  fontSize: '0.55rem',
  border: '1.5px solid',
  borderRadius: '50%',
  borderColor: 'rgba(239,68,68,0.65)',
  color: '#ef4444',
  transition: 'all 0.2s',
  '&:hover': { bgcolor: 'rgba(239,68,68,0.12)', borderColor: '#ef4444' },
} as const;

export const startBtnSx = (canStart: boolean) => ({
  width: 28,
  height: 28,
  fontSize: '0.65rem',
  border: '1.5px solid',
  borderRadius: '50%',
  borderColor: canStart ? 'rgba(249,115,22,0.55)' : 'rgba(255,255,255,0.1)',
  color: canStart ? '#f97316' : 'inherit',
  transition: 'all 0.2s',
  '&:hover': { bgcolor: 'rgba(249,115,22,0.15)' },
  '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.2)' },
});
