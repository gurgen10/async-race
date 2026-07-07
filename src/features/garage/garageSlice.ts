import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { garageApi } from './garageApi';
import type { Car, CarCreate } from '../../shared/types/car';

export const GARAGE_PAGE_SIZE = 7;

interface GarageState {
  cars: Car[];
  total: number;
  page: number;
  status: 'idle' | 'loading' | 'failed';
  selectedCar: Car | null;
}

const initialState: GarageState = {
  cars: [],
  total: 0,
  page: 1,
  status: 'idle',
  selectedCar: null,
};

export const fetchCars = createAsyncThunk('garage/fetchCars', (page: number) =>
  garageApi.getCars({ page, limit: GARAGE_PAGE_SIZE }),
);

export const createCar = createAsyncThunk('garage/createCar', (data: CarCreate) =>
  garageApi.createCar(data),
);

export const updateCar = createAsyncThunk(
  'garage/updateCar',
  ({ id, data }: { id: number; data: CarCreate }) => garageApi.updateCar(id, data),
);

export const deleteCar = createAsyncThunk('garage/deleteCar', async (id: number) => {
  await garageApi.deleteCar(id);
  return id;
});

export const generateCars = createAsyncThunk('garage/generateCars', (cars: CarCreate[]) =>
  Promise.all(cars.map((car) => garageApi.createCar(car))),
);

const garageSlice = createSlice({
  name: 'garage',
  initialState,
  reducers: {
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
    selectCar: (state, action: PayloadAction<Car | null>) => {
      state.selectedCar = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.status = 'idle';
        state.cars = action.payload.cars;
        state.total = action.payload.total;
      })
      .addCase(fetchCars.rejected, (state) => {
        state.status = 'failed';
      })
      .addCase(createCar.fulfilled, (state, action) => {
        state.total += 1;
        // Only append to the current view if the new car logically belongs on this page
        const newCarPage = Math.ceil(state.total / GARAGE_PAGE_SIZE);
        if (state.page === newCarPage && state.cars.length < GARAGE_PAGE_SIZE) {
          state.cars.push(action.payload);
        }
      })
      .addCase(updateCar.fulfilled, (state, action) => {
        const idx = state.cars.findIndex((c) => c.id === action.payload.id);
        if (idx !== -1) state.cars[idx] = action.payload;
        if (state.selectedCar?.id === action.payload.id) state.selectedCar = null;
      })
      .addCase(deleteCar.fulfilled, (state, action) => {
        state.cars = state.cars.filter((c) => c.id !== action.payload);
        state.total -= 1;
        // If the current page no longer exists after deletion, go back one page
        const maxPage = Math.max(1, Math.ceil(state.total / GARAGE_PAGE_SIZE));
        if (state.page > maxPage) state.page = maxPage;
      })
      .addCase(generateCars.fulfilled, (state, action) => {
        state.total += action.payload.length;
      });
  },
});

export const { setPage, selectCar } = garageSlice.actions;
export default garageSlice.reducer;
