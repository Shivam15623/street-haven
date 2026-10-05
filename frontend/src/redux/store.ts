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
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import * as Sentry from "@sentry/react";
import { sentryApiMiddleware } from "./sentryMiddleware.ts";
import authReducer from "./AuthSlice.ts";

// ✅ Persist config only for `auth`
const authPersistConfig = {
  key: "auth",
  version: 1,
  storage: storageSession,
};

// Sentry attaches recent actions and state to error reports.
// Your auth state is persisted in sessionStorage and may hold tokens or user data,
// so strip it before it leaves the browser.
const sentryReduxEnhancer = Sentry.createReduxEnhancer({
  // Send no state at all. Return a small safe subset instead if you want some context.
  stateTransformer: () => null,

  actionTransformer: (action) => {
    // redux-persist's REHYDRATE action carries the whole persisted auth state in its payload
    if (
      action.type === REHYDRATE ||
      action.type === PERSIST ||
      action.type.startsWith("auth/")
    ) {
      return { type: action.type };
    }
    return action;
  },
});
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
    }).concat(api.middleware, sentryApiMiddleware),
  enhancers: (getDefaultEnhancers) =>
    getDefaultEnhancers().concat(sentryReduxEnhancer),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppDispatch = () => useDispatch<AppDispatch>();
