'use client';

import { configureStore } from '@reduxjs/toolkit';
import MovieReducer from '@/lib/redux/reducers/MovieReducer';

export const makeStore = () => {
  return configureStore({
    reducer: {
      MovieReducer,
    },
  });
};

