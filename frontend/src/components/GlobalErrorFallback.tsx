// components/GlobalErrorFallback.tsx
export default function GlobalErrorFallback() {
  return (
    <div role="alert" style={{ padding: 40, textAlign: "center" }}>
      <h2>Something went wrong</h2>
      <p>An unexpected error occurred. Please reload the page.</p>
      <button onClick={() => window.location.reload()}>Reload</button>{" "}
      <button onClick={() => (window.location.href = "/")}>Go home</button>
    </div>
  );
}