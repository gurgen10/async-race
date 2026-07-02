import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import { CarIcon } from '../../shared/components/CarIcon';

interface WinnerModalProps {
  open: boolean;
  winnerName: string;
  winnerColor: string;
  winnerTime: number;
  onClose: () => void;
}

const WINNER_MODAL_PAPER_SX = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: 4,
  color: '#f8fafc',
  minWidth: 300,
  textAlign: 'center',
  overflow: 'visible',
} as const;

const AWESOME_BTN_SX = {
  borderRadius: 999,
  py: 1,
  background: 'linear-gradient(90deg, #f97316 0%, #ef4444 100%)',
  boxShadow: '0 8px 20px rgba(249,115,22,0.3)',
  '&:hover': { background: 'linear-gradient(90deg, #ea6f10 0%, #dc2626 100%)' },
} as const;

interface WinnerStatsProps {
  winnerName: string;
  winnerColor: string;
  winnerTime: number;
}

function WinnerStats({ winnerName, winnerColor, winnerTime }: WinnerStatsProps) {
  return (
    <>
      <Typography sx={{ fontSize: '2.5rem', lineHeight: 1, mb: 1 }} aria-hidden="true">
        🏁
      </Typography>
      <Typography
        variant="overline"
        sx={{
          display: 'block',
          color: '#f97316',
          letterSpacing: '0.2em',
          fontSize: '0.7rem',
          mb: 0.5,
        }}
      >
        Race complete
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {winnerName}
      </Typography>
      <Typography variant="body2" sx={{ opacity: 0.55, mb: 2.5 }}>
        {'wins with '}
        <Box component="span" sx={{ color: '#34d399', fontWeight: 700 }}>
          {winnerTime}s
        </Box>
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <CarIcon color={winnerColor} size={100} />
      </Box>
    </>
  );
}

export function WinnerModal({
  open,
  winnerName,
  winnerColor,
  winnerTime,
  onClose,
}: WinnerModalProps) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: WINNER_MODAL_PAPER_SX }}>
      <DialogContent sx={{ pt: 4, pb: 3, px: 4 }}>
        <WinnerStats winnerName={winnerName} winnerColor={winnerColor} winnerTime={winnerTime} />
        <Button variant="contained" fullWidth onClick={onClose} sx={AWESOME_BTN_SX}>
          Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
