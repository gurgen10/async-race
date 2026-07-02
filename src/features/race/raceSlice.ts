import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { engineApi } from './engineApi';
import type { DriveStatus } from '../../shared/types/engine';

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
  raceStartedAt: number | null;
  winnerId: number | null;
  winnerTime: number | null;
  cars: Record<number, CarRaceState>;
}

const MS_PER_SECOND = 1000;
const WINNER_TIME_DECIMALS = 2;

const initialState: RaceState = {
  isRacing: false,
  raceStartedAt: null,
  winnerId: null,
  winnerTime: null,
  cars: {},
};

export const startEngine = createAsyncThunk('race/startEngine', async (id: number) => {
  const { velocity, distance } = await engineApi.setEngine(id, 'started');
  return { id, velocity, distance };
});

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
  async (carIds: number[], { dispatch }) => {
    await Promise.all(carIds.map((id) => dispatch(startEngine(id))));
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
      Reflect.deleteProperty(state.cars, String(action.payload));
    },
    clearRace: (state) => {
      state.isRacing = false;
      clearRaceFields(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startEngine.fulfilled, (state, action) => {
        const { id, velocity, distance } = action.payload;
        state.cars[id] = {
          id,
          velocity,
          distance,
          duration: Math.round(distance / velocity),
          status: 'started',
        };
      })
      .addCase(driveEngine.fulfilled, (state, action) => {
        const { id, driveStatus } = action.payload;
        if (state.cars[id]) {
          state.cars[id].status = driveStatus === 'success' ? 'driving' : 'broken';
        }
        if (state.isRacing && driveStatus === 'success' && state.winnerId === null) {
          recordWinner(state, id);
        }
      })
      .addCase(stopEngine.fulfilled, (state, action) => {
        const id = action.payload;
        if (state.cars[id]) state.cars[id].status = 'stopped';
      })
      .addCase(beginRace.pending, (state) => {
        state.isRacing = true;
        clearRaceFields(state);
      })
      .addCase(beginRace.fulfilled, (state, action) => {
        state.raceStartedAt = action.payload;
      })
      .addCase(resetAllCars.fulfilled, (state) => {
        state.isRacing = false;
        clearRaceFields(state);
      });
  },
});

export const { setWinnerId, clearWinner, clearCar, clearRace } = raceSlice.actions;
export default raceSlice.reducer;
