import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks';
import { clearCar, driveEngine, startEngine, stopEngine } from '../../race/raceSlice';
import { deleteCar } from '../garageSlice';
import { deleteWinner } from '../../winners/winnersSlice';
import type { Car } from '../../../shared/types/car';
import { CAR_W, RETURN_TRANSITION_MS } from '../../../shared/constants';
import type { DivRef } from '../components/RaceTrack';

type AppDispatch = ReturnType<typeof useAppDispatch>;
type NumRef = RefObject<number | null>;
type BoolRef = RefObject<boolean>;

const SELECTED_ROW_SX = {
  boxShadow: '0 0 0 2px rgba(249,115,22,0.55)',
  background: 'rgba(249,115,22,0.06) !important',
} as const;

const UNSELECTED_ROW_SX = {} as const;

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
      if (totalDuration <= 0) return;

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
    let timerId: ReturnType<typeof setTimeout> | undefined;
    if (!carRace) {
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
        timerId = setTimeout(() => { el.style.transition = ''; }, RETURN_TRANSITION_MS);
      }
    }
    return () => { clearTimeout(timerId); };
  }, [carRace, carRef, rafRef, drivenRef, resumeProgressRef]);
}

function useSaveProgress(carRef: DivRef, trackRef: DivRef, resumeProgressRef: RefObject<number>) {
  return useCallback(() => {
    if (carRef.current && trackRef.current) {
      const match = /translateX\(([0-9.]+)px\)/.exec(carRef.current.style.transform);
      const currentX = match?.[1] ? parseFloat(match[1]) : 0;
      const maxX = trackRef.current.clientWidth - CAR_W;
      resumeProgressRef.current = maxX > 0 ? currentX / maxX : 0;
    }
  }, [carRef, trackRef, resumeProgressRef]);
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
  const saveProgress = useSaveProgress(carRef, trackRef, resumeProgressRef);

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

  useEffect(() => () => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
  }, []);

  return { trackRef, carRef, rafRef, drivenRef, saveProgress };
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

function useCarRowData(carId: number) {
  const carRace = useAppSelector((state) => state.race.cars[carId]);
  const isRacing = useAppSelector((state) => state.race.isRacing);
  const raceStartedAt = useAppSelector((state) => state.race.raceStartedAt);
  const isSelected = useAppSelector((state) => state.garage.selectedCar?.id === carId);
  const isWinner = useAppSelector((state) => state.race.winnerId === carId);
  return { carRace, isRacing, raceStartedAt, isSelected, isWinner, ...deriveCarStatus(carRace) };
}

function useConfirmDialog() {
  const [open, setOpen] = useState(false);
  const onOpen = useCallback(() => { setOpen(true); }, []);
  const onClose = useCallback(() => { setOpen(false); }, []);
  return { open, onOpen, onClose };
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
  const handleStart = useCallback(async () => {
    if (!canStart) return;
    try {
      await dispatch(startEngine({ id: car.id })).unwrap();
    } catch {
      dispatch(clearCar(car.id)); // clean up any partial state left by a failed start
    }
  }, [canStart, dispatch, car.id]);

  const handleStop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    saveProgress();
    drivenRef.current = false;
    void dispatch(stopEngine(car.id));
  }, [dispatch, car.id, rafRef, saveProgress, drivenRef]);

  const handleReset = useCallback(() => {
    void dispatch(stopEngine(car.id));
    dispatch(clearCar(car.id));
  }, [dispatch, car.id]);

  const handleDelete = useCallback(() => {
    void dispatch(deleteCar(car.id));
    void dispatch(deleteWinner(car.id));
    closeDialog();
  }, [dispatch, car.id, closeDialog]);

  return { handleStart, handleStop, handleReset, handleDelete };
}

export function useCarRow(car: Car, onEdit: (id: number, name: string, color: string) => void) {
  const dispatch = useAppDispatch();
  const data = useCarRowData(car.id);
  const { open: confirmOpen, onOpen: onDeleteRequest, onClose: onCloseDelete } = useConfirmDialog();

  const { trackRef, carRef, rafRef, drivenRef, saveProgress } = useCarAnimation(
    car.id, data.carRace, data.isRacing, data.raceStartedAt, dispatch,
  );

  const { handleStart, handleStop, handleReset, handleDelete } = useCarRowHandlers(
    car, dispatch, data.canStart, rafRef, drivenRef, saveProgress, onCloseDelete,
  );

  return {
    ...data,
    trackRef,
    carRef,
    confirmOpen,
    handleDelete,
    selectedSx: data.isSelected ? SELECTED_ROW_SX : UNSELECTED_ROW_SX,
    onStart: handleStart,
    onStop: handleStop,
    onReset: handleReset,
    onEditClick: () => { onEdit(car.id, car.name, car.color); },
    onDeleteRequest,
    onCloseDelete,
  };
}
