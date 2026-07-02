import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../shared/store/hooks';
import { clearCar, driveEngine, startEngine, stopEngine } from '../race/raceSlice';
import { deleteCar } from './garageSlice';
import { deleteWinner } from '../winners/winnersSlice';
import { CarIcon } from '../../shared/components/CarIcon';
import type { Car } from '../../shared/types/car';

const CAR_W = 56;
const RETURN_TRANSITION_MS = 450;
const START_LINE_W = 14; // width of start-line stripe, also inset for curbs
const LANE_DASH_OFFSET = 18; // horizontal gap between car's right edge and lane dashes

const CE_PATHS = [
  'M 20 20 L 64 20 L 64 56 L 20 56 Z',
  'M 36 20 L 36 6 L 40 6 L 40 12 L 44 12 L 44 6 L 50 6 L 50 12 L 54 12 L 54 6 L 58 6 L 58 20',
  'M 20 28 L 7 28 L 7 34 L 20 34',
  'M 20 43 L 7 43 L 7 49 L 20 49',
  'M 64 30 L 79 30 L 79 42 L 69 42 L 69 52 L 83 52',
];

/** Standard OBD-II malfunction indicator lamp — outline style matching the ISO 2575 symbol. */
function CheckEngineIcon() {
  return (
    <svg
      viewBox="0 0 90 62"
      width={36}
      height={25}
      fill="none"
      style={{ display: 'block' }}
      aria-label="Check engine"
    >
      <g stroke="#f59e0b" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
        {CE_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  );
}

interface CarRowProps {
  car: Car;
  onEdit: (id: number, name: string, color: string) => void;
}

interface CarRowButtonsProps {
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

const STOP_BTN_SX = {
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

const startBtnSx = (canStart: boolean) => ({
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

interface CarSecondaryButtonsProps {
  canReset: boolean;
  isSelected: boolean;
  isRunning: boolean;
  isRacing: boolean;
  onReset: () => void;
  onEdit: () => void;
  onDeleteRequest: () => void;
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

function CarRowButtons({
  isRunning,
  canStart,
  canReset,
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

const DELETE_DIALOG_PAPER_SX = {
  background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '16px',
  color: '#f8fafc',
  minWidth: 320,
} as const;

const CANCEL_BTN_SX = {
  borderRadius: 999,
  borderColor: 'rgba(255,255,255,0.2)',
  color: '#94a3b8',
  '&:hover': { borderColor: '#94a3b8', bgcolor: 'rgba(148,163,184,0.1)' },
} as const;

const DELETE_BTN_SX = {
  borderRadius: 999,
  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  boxShadow: '0 4px 14px rgba(239,68,68,0.35)',
  '&:hover': { background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)' },
} as const;

interface DeleteDialogProps {
  open: boolean;
  carName: string;
  carColor: string;
  onConfirm: () => void;
  onClose: () => void;
}

function DeleteDialog({ open, carName, carColor, onConfirm, onClose }: DeleteDialogProps) {
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

type AppDispatch = ReturnType<typeof useAppDispatch>;
type DivRef = RefObject<HTMLDivElement | null>;
type NumRef = RefObject<number | null>;
type BoolRef = RefObject<boolean>;

function useRunAnimation(
  trackRef: DivRef,
  carRef: DivRef,
  rafRef: NumRef,
  resumeProgressRef: RefObject<number>,
) {
  return useCallback(
    (duration: number) => {
      const trackEl = trackRef.current;
      const carEl = carRef.current;
      if (!trackEl || !carEl) return;

      const startFraction = resumeProgressRef.current;
      const totalDuration = duration * (1 - startFraction);
      let startedAt: number | null = null;

      const tick = (now: number) => {
        if (startedAt === null) startedAt = now;
        const elapsed = now - startedAt;
        const progress = Math.min(
          startFraction + ((1 - startFraction) * elapsed) / totalDuration,
          1,
        );
        carEl.style.transform = `translateX(${(trackEl.clientWidth - CAR_W) * progress}px)`;
        rafRef.current = progress < 1 ? requestAnimationFrame(tick) : null;
      };
      rafRef.current = requestAnimationFrame(tick);
    },
    [trackRef, carRef, rafRef, resumeProgressRef],
  );
}

function useCarResetEffect(
  carRace: { duration: number; status: string } | undefined,
  carRef: DivRef,
  rafRef: NumRef,
  drivenRef: BoolRef,
  resumeProgressRef: RefObject<number>,
) {
  useEffect(() => {
    if (carRace) return;
    drivenRef.current = false;
    resumeProgressRef.current = 0;
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (carRef.current) {
      const el = carRef.current;
      el.style.transition = 'transform 0.4s ease-in';
      el.style.transform = 'translateX(0)';
      setTimeout(() => {
        el.style.transition = '';
      }, RETURN_TRANSITION_MS);
    }
  }, [carRace, carRef, rafRef, drivenRef, resumeProgressRef]);
}

function useSaveProgress(carRef: DivRef, trackRef: DivRef, resumeProgressRef: RefObject<number>) {
  return () => {
    if (carRef.current && trackRef.current) {
      const match = /translateX\(([0-9.]+)px\)/.exec(carRef.current.style.transform);
      const currentX = match?.[1] ? parseFloat(match[1]) : 0;
      const maxX = trackRef.current.clientWidth - CAR_W;
      resumeProgressRef.current = maxX > 0 ? currentX / maxX : 0;
    }
  };
}

function useCarAnimation(
  carId: number,
  carRace: { duration: number; status: string } | undefined,
  isRacing: boolean,
  raceStartedAt: number | null,
  dispatch: AppDispatch,
) {
  const trackRef = useRef<HTMLDivElement>(null);
  const carRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const drivenRef = useRef(false);
  const resumeProgressRef = useRef(0);

  const runAnimation = useRunAnimation(trackRef, carRef, rafRef, resumeProgressRef);

  const status = carRace?.status ?? 'idle';
  const isBroken = status === 'broken';

  useEffect(() => {
    if (status !== 'started' || !carRace || drivenRef.current) return;
    if (isRacing && raceStartedAt === null) return;
    drivenRef.current = true;
    runAnimation(carRace.duration);
    void dispatch(driveEngine(carId));
  }, [status, isRacing, raceStartedAt, carRace, runAnimation, dispatch, carId]);

  useEffect(() => {
    if (isBroken && rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, [isBroken]);

  useCarResetEffect(carRace, carRef, rafRef, drivenRef, resumeProgressRef);

  const saveProgress = useSaveProgress(carRef, trackRef, resumeProgressRef);

  return {
    trackRef,
    carRef,
    rafRef,
    drivenRef,
    saveProgress,
  };
}

function StartLine() {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: CAR_W,
        top: START_LINE_W,
        bottom: 0,
        width: START_LINE_W,
        background:
          'repeating-linear-gradient(0deg,' +
          'rgba(255,255,255,0.6) 0px,rgba(255,255,255,0.6) 5px,' +
          'rgba(150,160,180,0.07) 5px,rgba(150,160,180,0.07) 10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography
        component="span"
        sx={{
          display: 'block',
          transform: 'rotate(-90deg)',
          whiteSpace: 'nowrap',
          fontSize: '0.38rem',
          fontWeight: 900,
          letterSpacing: '0.14em',
          color: '#f97316 !important',
          userSelect: 'none',
          lineHeight: 1,
        }}
      >
        START
      </Typography>
    </Box>
  );
}

function TopCurb() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: START_LINE_W,
        left: CAR_W + START_LINE_W,
        right: 94,
        height: '2px',
        background:
          'linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 100%)',
      }}
    />
  );
}

function LaneDashes() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 37,
        left: CAR_W + LANE_DASH_OFFSET,
        right: 96,
        height: '2px',
        backgroundImage:
          'repeating-linear-gradient(90deg,' +
          'rgba(255,215,50,0.65) 0px,rgba(255,215,50,0.65) 18px,' +
          'transparent 18px,transparent 40px)',
        backgroundSize: '40px 2px',
      }}
    />
  );
}

function BottomCurb() {
  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 2,
        left: CAR_W + START_LINE_W,
        right: 94,
        height: '1.5px',
        background: 'rgba(255,255,255,0.07)',
      }}
    />
  );
}

function TrackCurbs() {
  return (
    <>
      <TopCurb />
      <LaneDashes />
      <BottomCurb />
    </>
  );
}

function FinishLine({ isWinner }: { isWinner: boolean }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        right: 72,
        top: 0,
        bottom: 0,
        width: 22,
        background:
          'repeating-conic-gradient(' +
          'rgba(8,8,8,0.93) 0% 25%,' +
          'rgba(232,232,232,0.93) 0% 50%' +
          ') 0 0 / 11px 11px',
        animation: isWinner ? 'finish-glow 0.75s ease-in-out infinite' : undefined,
      }}
    />
  );
}

function RaceTrackLanes({ isWinner }: { isWinner: boolean }) {
  return (
    <>
      <StartLine />
      <TrackCurbs />
      <FinishLine isWinner={isWinner} />
    </>
  );
}

interface RaceTrackProps {
  trackRef: DivRef;
  carRef: DivRef;
  car: Car;
  isBroken: boolean;
  isWinner: boolean;
}

function CarNameLabel({ name, color }: { name: string; color: string }) {
  return (
    <Typography
      variant="caption"
      sx={{
        position: 'absolute',
        top: 1,
        left: 4,
        lineHeight: 1,
        fontWeight: 700,
        letterSpacing: '0.03em',
        opacity: 0.95,
        color: `${color} !important`,
        textShadow: '0 0 10px rgba(0,0,0,1), 0 1px 4px rgba(0,0,0,0.95)',
      }}
    >
      {name}
    </Typography>
  );
}

function CarMarker({ carRef, car, isBroken }: { carRef: DivRef; car: Car; isBroken: boolean }) {
  return (
    <Box
      ref={carRef}
      sx={{
        position: 'absolute',
        bottom: 2,
        left: 0,
        display: 'flex',
        alignItems: 'flex-end',
        willChange: 'transform',
      }}
    >
      <CarIcon color={car.color} size={CAR_W} />
      {isBroken && (
        <Box
          sx={{
            alignSelf: 'center',
            ml: '4px',
            animation: 'check-engine-pulse 1s ease-in-out infinite',
          }}
        >
          <CheckEngineIcon />
        </Box>
      )}
    </Box>
  );
}

function RaceTrack({ trackRef, carRef, car, isBroken, isWinner }: RaceTrackProps) {
  return (
    <Box
      ref={trackRef}
      sx={{
        flex: 1,
        position: 'relative',
        height: 56,
        overflow: 'hidden',
        borderRadius: '6px',
        background:
          'radial-gradient(ellipse 70% 40% at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 100%),' +
          'linear-gradient(180deg, #252830 0%, #1c1f26 55%, #131519 100%)',
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.06)',
      }}
    >
      <RaceTrackLanes isWinner={isWinner} />
      <CarNameLabel name={car.name} color={car.color} />
      <CarMarker carRef={carRef} car={car} isBroken={isBroken} />
    </Box>
  );
}

function deriveCarStatus(carRace: { duration: number; status: string } | undefined) {
  const status = carRace?.status ?? 'idle';
  return {
    isRunning: status === 'started' || status === 'driving',
    isBroken: status === 'broken',
    canStart: !carRace || status === 'stopped',
    canReset: !!carRace,
  };
}

function rowSelectedSx(isSelected: boolean) {
  return isSelected
    ? {
        boxShadow: '0 0 0 2px rgba(249,115,22,0.55)',
        background: 'rgba(249,115,22,0.06) !important',
      }
    : {};
}

function useCarRowData(carId: number) {
  const carRace = useAppSelector((state) => state.race.cars[carId]);
  const isRacing = useAppSelector((state) => state.race.isRacing);
  const raceStartedAt = useAppSelector((state) => state.race.raceStartedAt);
  const isSelected = useAppSelector((state) => state.garage.selectedCar?.id === carId);
  const isWinner = useAppSelector((state) => state.race.winnerId === carId);
  return {
    carRace,
    isRacing,
    raceStartedAt,
    isSelected,
    isWinner,
    ...deriveCarStatus(carRace),
  };
}

function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  return {
    open,
    onOpen: () => {
      setOpen(true);
    },
    onClose: () => {
      setOpen(false);
    },
  };
}

function useCarRowHandlers(
  car: Car,
  dispatch: AppDispatch,
  canStart: boolean,
  rafRef: NumRef,
  drivenRef: BoolRef,
  saveProgress: () => void,
  closeDialog: () => void,
) {
  const handleStart = async () => {
    if (!canStart) return;
    try {
      await dispatch(startEngine(car.id)).unwrap();
    } catch {
      // server unreachable or engine refused
    }
  };

  const handleStop = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    saveProgress();
    drivenRef.current = false;
    void dispatch(stopEngine(car.id));
  };

  const handleReset = () => {
    void dispatch(stopEngine(car.id));
    dispatch(clearCar(car.id));
  };

  const handleDelete = () => {
    void dispatch(deleteCar(car.id));
    void dispatch(deleteWinner(car.id));
    closeDialog();
  };

  return { handleStart, handleStop, handleReset, handleDelete };
}

function useCarRow(car: Car, onEdit: (id: number, name: string, color: string) => void) {
  const dispatch = useAppDispatch();
  const data = useCarRowData(car.id);
  const { open: confirmOpen, onOpen: onDeleteRequest, onClose: onCloseDelete } = useConfirmDialog();

  const { trackRef, carRef, rafRef, drivenRef, saveProgress } = useCarAnimation(
    car.id,
    data.carRace,
    data.isRacing,
    data.raceStartedAt,
    dispatch,
  );

  const { handleStart, handleStop, handleReset, handleDelete } = useCarRowHandlers(
    car,
    dispatch,
    data.canStart,
    rafRef,
    drivenRef,
    saveProgress,
    onCloseDelete,
  );

  return {
    ...data,
    trackRef,
    carRef,
    confirmOpen,
    handleDelete,
    selectedSx: rowSelectedSx(data.isSelected),
    onStart: handleStart,
    onStop: handleStop,
    onReset: handleReset,
    onEditClick: () => {
      onEdit(car.id, car.name, car.color);
    },
    onDeleteRequest,
    onCloseDelete,
  };
}

export function CarRow({ car, onEdit }: CarRowProps) {
  const view = useCarRow(car, onEdit);

  return (
    <Box component="li" className="list-item" sx={view.selectedSx}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <CarRowButtons
          isRunning={view.isRunning}
          canStart={view.canStart}
          canReset={view.canReset}
          isSelected={view.isSelected}
          isRacing={view.isRacing}
          onStart={view.onStart}
          onStop={view.onStop}
          onReset={view.onReset}
          onEdit={view.onEditClick}
          onDeleteRequest={view.onDeleteRequest}
        />
        <RaceTrack
          trackRef={view.trackRef}
          carRef={view.carRef}
          car={car}
          isBroken={view.isBroken}
          isWinner={view.isWinner}
        />
      </Stack>

      <DeleteDialog
        open={view.confirmOpen}
        carName={car.name}
        carColor={car.color}
        onConfirm={view.handleDelete}
        onClose={view.onCloseDelete}
      />
    </Box>
  );
}
