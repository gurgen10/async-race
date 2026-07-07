import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../../../shared/store/hooks';
import { clearWinner, resetAllCars, type RaceState } from '../../race/raceSlice';
import { fetchCars } from '../garageSlice';
import { saveWinner } from '../../winners/winnersSlice';
import type { Car } from '../../../shared/types/car';

type AppDispatch = ReturnType<typeof useAppDispatch>;

export function useResetOnMount(dispatch: AppDispatch) {
  const raceCars = useAppSelector((state) => state.race.cars);
  const mountIdsRef = useRef(Object.keys(raceCars).map(Number));

  useEffect(() => {
    const ids = mountIdsRef.current;
    if (ids.length > 0) {
      void dispatch(resetAllCars(ids));
    }
  }, [dispatch]);
}

export function useGaragePageEffects(
  dispatch: AppDispatch,
  page: number,
  winnerId: number | null,
  winnerTime: number | null,
) {
  useEffect(() => {
    void dispatch(fetchCars(page));
  }, [dispatch, page]);

  useEffect(() => {
    if (winnerId !== null && winnerTime !== null) {
      void dispatch(saveWinner({ id: winnerId, time: winnerTime }));
    }
  }, [dispatch, winnerId, winnerTime]);

  // Clear winner on unmount so a remount doesn't re-dispatch saveWinner
  // with stale winnerId/winnerTime still in Redux (user navigated away before closing modal)
  useEffect(() => () => { dispatch(clearWinner()); }, [dispatch]);
}

export function useGaragePageDerived(cars: Car[], raceState: RaceState) {
  const carIds = cars.map((c) => c.id);
  const anyCarActive = Object.keys(raceState.cars).length > 0;
  return {
    carIds,
    anyCarActive,
    canRace: !anyCarActive && cars.length > 0,
    canReset: anyCarActive,
    winnerCar: cars.find((c) => c.id === raceState.winnerId) ?? null,
    modalOpen: raceState.winnerId !== null && raceState.winnerTime !== null,
  };
}
