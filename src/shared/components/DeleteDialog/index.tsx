import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material';
import { CANCEL_BTN_SX, DELETE_BTN_SX, DELETE_DIALOG_PAPER_SX } from '../../styles';

export interface DeleteDialogProps {
  open: boolean;
  carName: string;
  carColor: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteDialog({ open, carName, carColor, onConfirm, onClose }: DeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: DELETE_DIALOG_PAPER_SX }}>
      <DialogTitle sx={{ pb: 1, fontWeight: 700 }}>Delete car?</DialogTitle>
      <DialogContent sx={{ pb: 1 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.65)' }}>
          {'This will permanently remove '}
          <Box component="span" sx={{ fontWeight: 700, color: carColor }}>
            {carName}
          </Box>
          {' and its winner record.'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} sx={CANCEL_BTN_SX}>
          Cancel
        </Button>
        <Button variant="contained" onClick={onConfirm} sx={DELETE_BTN_SX}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
