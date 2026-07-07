import { Box, Button, Dialog, DialogContent, Typography } from '@mui/material';
import { CarIcon } from '../../shared/components/CarIcon';
import { MODAL_PAPER_SX } from '../../shared/styles';
import { AWESOME_BTN_SX } from './WinnerModal.styles';

interface WinnerModalProps {
  open: boolean;
  winnerName: string;
  winnerColor: string;
  winnerTime: number;
  onClose: () => void;
}

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
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: MODAL_PAPER_SX }}>
      <DialogContent sx={{ pt: 4, pb: 3, px: 4 }}>
        <WinnerStats winnerName={winnerName} winnerColor={winnerColor} winnerTime={winnerTime} />
        <Button variant="contained" fullWidth onClick={onClose} sx={AWESOME_BTN_SX}>
          Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
