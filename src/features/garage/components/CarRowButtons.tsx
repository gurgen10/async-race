import { IconButton, Stack } from '@mui/material';
import { startBtnSx, STOP_BTN_SX } from './CarRowButtons.styles';

export interface CarRowButtonsProps {
  isRunning: boolean;
  canStart: boolean;
  canReset: boolean;
  isSelected: boolean;
  isRacing: boolean;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
}

interface CarSecondaryButtonsProps {
  canReset: boolean;
  isSelected: boolean;
  isRunning: boolean;
  isRacing: boolean;
  onReset: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
}

interface CarToggleButtonProps {
  isRunning: boolean;
  canStart: boolean;
  onStart: () => void;
  onStop: () => void;
}

function CarToggleButton({ isRunning, canStart, onStart, onStop }: CarToggleButtonProps) {
  if (isRunning) {
    return (
      <IconButton size="small" aria-label="Stop" onClick={onStop} sx={STOP_BTN_SX}>
        ■
      </IconButton>
    );
  }
  return (
    <IconButton
      size="small"
      aria-label="Start"
      disabled={!canStart}
      onClick={onStart}
      sx={startBtnSx(canStart)}
    >
      ▶
    </IconButton>
  );
}

function CarResetButton({ canReset, onReset }: { canReset: boolean; onReset: () => void }) {
  return (
    <IconButton
      size="small"
      aria-label="Reset"
      disabled={!canReset}
      onClick={onReset}
      sx={{
        width: 28,
        height: 28,
        fontSize: '0.8rem',
        border: '1.5px solid',
        borderRadius: '50%',
        borderColor: canReset ? 'rgba(148,163,184,0.45)' : 'rgba(255,255,255,0.1)',
        color: canReset ? '#94a3b8' : 'inherit',
        transition: 'all 0.2s',
        '&:hover': { bgcolor: 'rgba(148,163,184,0.12)' },
        '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.2)' },
      }}
    >
      ↺
    </IconButton>
  );
}

function CarEditButton({
  isSelected,
  isRacing,
  onEdit,
}: {
  isSelected: boolean;
  isRacing: boolean;
  onEdit: () => void;
}) {
  return (
    <IconButton
      size="small"
      aria-label="Edit"
      disabled={isRacing}
      onClick={onEdit}
      sx={{
        width: 28,
        height: 28,
        fontSize: isSelected ? '1rem' : '0.85rem',
        border: '1.5px solid',
        borderRadius: '50%',
        borderColor: isSelected ? 'rgba(249,115,22,0.7)' : 'rgba(255,255,255,0.18)',
        color: isSelected ? '#f97316' : 'rgba(255,255,255,0.45)',
        transition: 'all 0.2s',
        '&:hover': { bgcolor: 'rgba(249,115,22,0.12)', borderColor: '#f97316', color: '#f97316' },
        '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.2)' },
      }}
    >
      {isSelected ? '+' : '−'}
    </IconButton>
  );
}

function CarDeleteButton({
  isRunning,
  isRacing,
  onDeleteRequest,
}: {
  isRunning: boolean;
  isRacing: boolean;
  onDeleteRequest: () => void;
}) {
  const locked = isRunning || isRacing;
  return (
    <IconButton
      size="small"
      aria-label="Delete"
      disabled={locked}
      onClick={onDeleteRequest}
      sx={{
        width: 28,
        height: 28,
        fontSize: '0.75rem',
        border: '1.5px solid',
        borderRadius: '50%',
        borderColor: locked ? 'rgba(255,255,255,0.1)' : 'rgba(248,113,113,0.45)',
        color: locked ? 'rgba(255,255,255,0.2)' : '#f87171',
        transition: 'all 0.2s',
        '&:hover': { bgcolor: 'rgba(248,113,113,0.12)', borderColor: '#f87171' },
        '&.Mui-disabled': { borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.2)' },
      }}
    >
      ✕
    </IconButton>
  );
}

function CarSecondaryButtons({
  canReset,
  isSelected,
  isRunning,
  isRacing,
  onReset,
  onEdit,
  onDeleteRequest,
}: CarSecondaryButtonsProps) {
  return (
    <>
      <CarResetButton canReset={canReset} onReset={onReset} />
      <CarEditButton isSelected={isSelected} isRacing={isRacing} onEdit={onEdit} />
      <CarDeleteButton isRunning={isRunning} isRacing={isRacing} onDeleteRequest={onDeleteRequest} />
    </>
  );
}

export function CarRowButtons({ isRunning, canStart, canReset,
  isSelected,
  isRacing,
  onStart,
  onStop,
  onReset,
  onEdit,
  onDeleteRequest,
}: CarRowButtonsProps) {
  return (
    <Stack
      sx={{
        flexShrink: 0,
        maxWidth: 120,
        display: 'grid',
        alignItems: 'center',
        gridTemplateColumns: 'repeat(2, 28px)',
        gap: 1,
      }}
    >
      <CarToggleButton
        isRunning={isRunning}
        canStart={canStart}
        onStart={onStart}
        onStop={onStop}
      />
      <CarSecondaryButtons
        canReset={canReset}
        isSelected={isSelected}
        isRunning={isRunning}
        isRacing={isRacing}
        onReset={onReset}
        onEdit={onEdit}
        onDeleteRequest={onDeleteRequest}
      />
    </Stack>
  );
}
