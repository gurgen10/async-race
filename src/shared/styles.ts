import type { Theme } from "@mui/material";
import type { SxProps } from "@mui/system";


export const DELETE_DIALOG_PAPER_SX: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '16px',
  color: '#f8fafc',
  minWidth: 320,
} as const;

export const CANCEL_BTN_SX: SxProps<Theme> = {
  borderRadius: 999,
  borderColor: 'rgba(255,255,255,0.2)',
  color: '#94a3b8',
  '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(148,163,184,0.1)' },
} as const;

export const DELETE_BTN_SX: SxProps<Theme> = {
  borderRadius: 999,
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
  '&:hover': { background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' },
} as const;

export const MODAL_PAPER_SX: SxProps<Theme> = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 4,
  color: '#f8fafc',
  minWidth: 300,
  textAlign: 'center',
  overflow: 'visible',
} as const;

export const PAGINATION_SX: SxProps<Theme> = {
  '& .MuiPaginationItem-root': { color: '#f8fafc' },
  '& .Mui-selected': { background: 'rgba(249,115,22,0.3) !important' },
} as const;
