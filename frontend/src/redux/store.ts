import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { api } from "./ApiSlice.ts";
import storageSession from "redux-persist/lib/storage/session";
import {
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import { type TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";

import authReducer from "./AuthSlice.ts";

// ✅ Persist config only for `auth`
const authPersistConfig = {
  key: "auth",
  version: 1,
  storage: storageSession,
};

// ✅ Wrap only auth reducer with persistReducer
const rootReducer = combineReducers({
  [api.reducerPath]: api.reducer, // NOT persisted
  auth: persistReducer(authPersistConfig, authReducer.reducer),
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(api.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
