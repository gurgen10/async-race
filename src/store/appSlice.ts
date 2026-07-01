import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type PageKey = 'garage' | 'winners';

interface AppState {
  currentPage: PageKey;
}

const initialState: AppState = {
  currentPage: 'garage',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<PageKey>) => {
      state.currentPage = action.payload;
    },
  },
});

export const { setCurrentPage } = appSlice.actions;
export default appSlice.reducer;
