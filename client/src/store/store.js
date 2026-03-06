import { configureStore } from '@reduxjs/toolkit';
import uiSlice from './slices/uiSlice';
import courseSlice from './slices/courseSlice';

export const store = configureStore({
    reducer: {
        ui: uiSlice,
        courses: courseSlice,
    },
});
