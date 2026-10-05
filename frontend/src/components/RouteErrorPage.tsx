import { useEffect } from "react";
import {
  useRouteError,
  isRouteErrorResponse,
  useNavigate,
} from "react-router-dom";
import * as Sentry from "@sentry/react";
export default function RouteErrorPage() {
  const error = useRouteError();
  const navigate = useNavigate();

  useEffect(() => {
    // skip 404s from the router; they're not bugs
    if (!error || isRouteErrorResponse(error)) return;

    Sentry.captureException(error, {
      tags: { source: "route-error", chunk_error: String(isChunkError) },
      level: isChunkError ? "warning" : "error",
    });
  }, [error]);

  // Unknown URL (the "*" route renders this with no error)
  if (!error || (isRouteErrorResponse(error) && error.status === 404)) {
    return (
      <div role="alert" style={{ padding: 40, textAlign: "center" }}>
        <h2>Page not found</h2>
        <p>The page you are looking for does not exist.</p>
        <button onClick={() => navigate("/")}>Go home</button>
      </div>
    );
  }

  // Happens after a new deployment when an old lazy chunk no longer exists
  const isChunkError =
    error instanceof Error &&
    /dynamically imported module|Loading chunk|ChunkLoadError/i.test(
      error.message,
    );

  return (
    <div role="alert" style={{ padding: 40, textAlign: "center" }}>
      <h2>
        {isChunkError ? "A new version is available" : "Something went wrong"}
      </h2>
      <p>
        {isChunkError
          ? "Please reload the page to get the latest version."
          : "We couldn't display this page. Please try again."}
      </p>
      <button onClick={() => window.location.reload()}>Reload</button>{" "}
      <button onClick={() => navigate("/")}>Go home</button>
    </div>
  );
}
