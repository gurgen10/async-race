export const CREATED_CAR_BTN_SX = {
  borderRadius: 999,
  py: 1,
  background: 'linear-gradient(90deg, #22d3ee 0%, #3b82f6 100%)',
  boxShadow: '0 8px 20px rgba(34,211,238,0.25)',
  '&:hover': { background: 'linear-gradient(90deg, #06b6d4 0%, #2563eb 100%)' },
} as const;

export const FORM_BOX_SX = {
  display: 'flex',
  gap: 1.5,
  alignItems: 'center',
  mt: 2,
  p: '10px 14px',
  borderRadius: '10px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.09)',
  flexWrap: 'wrap',
} as const;

export const INPUT_SX = {
  '& .MuiOutlinedInput-root': {
    color: '#f8fafc',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.3)' },
    '&.Mui-focused fieldset': { borderColor: '#f97316' },
  },
  '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.3)', opacity: 1 },
};
