import { isRejectedWithValue, type Middleware } from "@reduxjs/toolkit";
import * as Sentry from "@sentry/react";

export const sentryApiMiddleware: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const payload: any = action.payload;
    const status = payload?.status;
    const endpoint = (action.meta as any)?.arg?.endpointName ?? "unknown";

    const isServerError = typeof status === "number" && status >= 500;
    const isTransportError = [
      "FETCH_ERROR",
      "TIMEOUT_ERROR",
      "PARSING_ERROR",
    ].includes(status);

    // 400 / 401 / 403 / 404 / validation errors are expected, so they are not reported
    if (isServerError || isTransportError) {
      Sentry.withScope((scope) => {
        scope.setTag("source", "rtk-query");
        scope.setTag("endpoint", endpoint);
        scope.setTag("http_status", String(status));
        scope.setContext("api", {
          code: payload?.data?.code,
          message: payload?.data?.message,
        });
        scope.setFingerprint(["rtk-query", endpoint, String(status)]);
        scope.setLevel(isTransportError ? "warning" : "error");
        Sentry.captureException(new Error(`API ${status} on ${endpoint}`));
      });
    }
  }
  return next(action);
};
