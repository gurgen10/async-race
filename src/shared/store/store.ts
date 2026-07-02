import { configureStore } from '@reduxjs/toolkit';
import garageReducer from '../../features/garage/garageSlice';
import winnersReducer from '../../features/winners/winnersSlice';
import raceReducer from '../../features/race/raceSlice';

export const store = configureStore({
  reducer: {
    garage: garageReducer,
    winners: winnersReducer,
    race: raceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
