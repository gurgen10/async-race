import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { engineApi } from './engineApi';
import type { DriveStatus } from '../../shared/types/engine';
import type { RootState } from '../../shared/store/store';

export interface CarRaceState {
  id: number;
  velocity: number;
  distance: number;
  /** Duration in ms to traverse the full track at current velocity. */
  duration: number;
  status: 'idle' | 'started' | 'driving' | 'broken' | 'stopped';
}

export interface RaceState {
  isRacing: boolean;
  raceSeq: number;
  raceStartedAt: number | null;
  winnerId: number | null;
  winnerTime: number | null;
  cars: Record<number, CarRaceState>;
}

const MS_PER_SECOND = 1000;
const WINNER_TIME_DECIMALS = 2;

const initialState: RaceState = {
  isRacing: false,
  raceSeq: 0,
  raceStartedAt: null,
  winnerId: null,
  winnerTime: null,
  cars: {},
};

export const startEngine = createAsyncThunk(
  'race/startEngine',
  async ({ id, raceSeq }: { id: number; raceSeq?: number }) => {
    const { velocity, distance } = await engineApi.setEngine(id, 'started');
    return { id, velocity, distance, raceSeq };
  },
);

export const stopEngine = createAsyncThunk('race/stopEngine', async (id: number) => {
  await engineApi.setEngine(id, 'stopped');
  return id;
});

export const driveEngine = createAsyncThunk(
  'race/driveEngine',
  async (id: number): Promise<{ id: number; driveStatus: DriveStatus }> => {
    const driveStatus = await engineApi.drive(id);
    return { id, driveStatus };
  },
);

/**
 * Starts all engines in parallel, then returns a shared timestamp.
 * CarRows gate their animation start on this timestamp so all cars
 * begin moving in the same RAF frame instead of staggered network replies.
 */
export const beginRace = createAsyncThunk(
  'race/beginRace',
  async (carIds: number[], { dispatch, getState }) => {
    const { raceSeq } = (getState() as RootState).race;
    await Promise.all(carIds.map((id) => dispatch(startEngine({ id, raceSeq }))));
    return performance.now();
  },
);

export const resetAllCars = createAsyncThunk(
  'race/resetAllCars',
  async (carIds: number[], { dispatch }) => {
    await Promise.all(carIds.map((id) => dispatch(stopEngine(id))));
  },
);

function clearRaceFields(state: RaceState) {
  state.raceStartedAt = null;
  state.winnerId = null;
  state.winnerTime = null;
  state.cars = {};
}

function recordWinner(state: RaceState, id: number) {
  const car = state.cars[id];
  if (!car) return;
  state.winnerId = id;
  state.winnerTime = +(car.duration / MS_PER_SECOND).toFixed(WINNER_TIME_DECIMALS);
  state.isRacing = false;
}

function applyStartEngineFulfilled(state: RaceState, action: ReturnType<typeof startEngine.fulfilled>) {
  const { id, velocity, distance, raceSeq } = action.payload;
  // Discard stale race-start responses that arrived after a reset
  if (raceSeq !== undefined && raceSeq !== state.raceSeq) return;
  state.cars[id] = {
    id,
    velocity,
    distance,
    duration: Math.round(distance / velocity),
    status: 'started',
  };
}

function applyDriveEngineFulfilled(state: RaceState, action: ReturnType<typeof driveEngine.fulfilled>) {
  const { id, driveStatus } = action.payload;
  if (state.cars[id]) {
    state.cars[id].status = driveStatus === 'success' ? 'driving' : 'broken';
  }
  if (state.isRacing && driveStatus === 'success' && state.winnerId === null) {
    recordWinner(state, id);
  }
}

function applyStopEngineFulfilled(state: RaceState, action: ReturnType<typeof stopEngine.fulfilled>) {
  const id = action.payload;
  if (state.cars[id]) state.cars[id].status = 'stopped';
}

const raceSlice = createSlice({
  name: 'race',
  initialState,
  reducers: {
    setWinnerId: (state, action: PayloadAction<number>) => {
      if (state.winnerId === null) state.winnerId = action.payload;
    },
    clearWinner: (state) => {
      state.winnerId = null;
      state.winnerTime = null;
    },
    clearCar: (state, action: PayloadAction<number>) => {
      Reflect.deleteProperty(state.cars, action.payload); // Fix #12: idiomatic Immer draft mutation
    },
    clearRace: (state) => {
      state.isRacing = false;
      clearRaceFields(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startEngine.fulfilled, applyStartEngineFulfilled)
      .addCase(driveEngine.fulfilled, applyDriveEngineFulfilled)
      .addCase(stopEngine.fulfilled, applyStopEngineFulfilled)
      .addCase(beginRace.pending, (state) => {
        state.isRacing = true;
        state.raceSeq += 1;
        clearRaceFields(state);
      })
      .addCase(beginRace.fulfilled, (state, action) => {
        if (!state.isRacing) return;
        state.raceStartedAt = action.payload;
      })
      .addCase(resetAllCars.pending, (state) => {
        state.raceSeq += 1;
      })
      .addCase(beginRace.rejected, (state) => {
        state.isRacing = false;
        clearRaceFields(state);
      })
      .addCase(resetAllCars.fulfilled, (state) => {
        state.isRacing = false;
        clearRaceFields(state);
      });
  },
});

export const { setWinnerId, clearWinner, clearCar, clearRace } = raceSlice.actions;
export default raceSlice.reducer;
