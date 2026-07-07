import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { winnersApi, type WinnerSortField, type SortOrder } from './winnersApi';
import { garageApi } from '../garage/garageApi';
import type { WinnerWithCar } from '../../shared/types/winner';
import type { RootState } from '../../shared/store/store';

export const WINNERS_PAGE_SIZE = 10;

interface WinnersState {
  winners: WinnerWithCar[];
  total: number;
  page: number;
  sort: WinnerSortField;
  order: SortOrder;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: WinnersState = {
  winners: [],
  total: 0,
  page: 1,
  sort: 'id',
  order: 'ASC',
  status: 'idle',
};

export const fetchWinners = createAsyncThunk(
  'winners/fetchWinners',
  async (_: undefined, { getState }) => {
    const { page, sort, order } = (getState() as RootState).winners;
    const { winners, total } = await winnersApi.getWinners({
      page,
      limit: WINNERS_PAGE_SIZE,
      sort,
      order,
    });

    // Join car name/color in parallel; fall back gracefully if a car was deleted
    const carResults = await Promise.allSettled(winners.map((w) => garageApi.getCar(w.id)));

    const winnersWithCars: WinnerWithCar[] = winners.map((w, i) => {
      const result = carResults[i];
      const car = result !== undefined && result.status === 'fulfilled' ? result.value : null;
      return {
        ...w,
        name: car?.name ?? `Car #${w.id}`,
        color: car?.color ?? '#6b7280',
      };
    });

    return { winners: winnersWithCars, total };
  },
);

export const saveWinner = createAsyncThunk(
  'winners/saveWinner',
  async ({ id, time }: { id: number; time: number }) => {
    try {
      const existing = await winnersApi.getWinner(id);
      return await winnersApi.updateWinner(id, {
        wins: existing.wins + 1,
        time: Math.min(existing.time, time),
      });
    } catch (e) {
      // Fix #4: only treat a genuine 404 as "no record yet"; re-throw everything else
      // (network errors, 500s) so they surface as rejected thunks instead of creating
      // a spurious duplicate winner row.
      if (e instanceof Error && e.message.startsWith('HTTP 404')) {
        return winnersApi.createWinner({ id, wins: 1, time });
      }
      throw e;
    }
  },
);

export const deleteWinner = createAsyncThunk('winners/deleteWinner', async (id: number) => {
  let wasDeleted = true;
  try {
    await winnersApi.deleteWinner(id);
  } catch (e) {
    if (!(e instanceof Error) || !e.message.startsWith('HTTP 404')) throw e;
    wasDeleted = false; // car was never a winner — nothing was actually deleted
  }
  return { id, wasDeleted };
});

const winnersSlice = createSlice({
  name: 'winners',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    setSort: (state, action: PayloadAction<WinnerSortField>) => {
      if (state.sort === action.payload) {
        state.order = state.order === 'ASC' ? 'DESC' : 'ASC';
      } else {
        state.sort = action.payload;
        state.order = 'ASC';
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWinners.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWinners.fulfilled, (state, action) => {
        state.status = 'idle';
        state.winners = action.payload.winners;
        state.total = action.payload.total;
      })
      .addCase(fetchWinners.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(saveWinner.fulfilled, (state, action) => {
        // Only update numerical fields; preserve car name/color already in state
        const idx = state.winners.findIndex((w) => w.id === action.payload.id);
        const winner = state.winners[idx];
        if (winner) {
          winner.wins = action.payload.wins;
          winner.time = action.payload.time;
        }
      })
      .addCase(deleteWinner.fulfilled, (state, action) => {
        if (!action.payload.wasDeleted) return;
        state.winners = state.winners.filter((w) => w.id !== action.payload.id);
        state.total -= 1;
      });
  },
});

export const { setPage, setSort } = winnersSlice.actions;
export default winnersSlice.reducer;
