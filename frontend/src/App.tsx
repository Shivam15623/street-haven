import { RouterProvider } from "react-router-dom";
import { Suspense } from "react";
import router from "./routes";
import Loader from "./components/Loader";
import { useSilentAuthQuery } from "./services/AuthApi";

function App() {
  const { isLoading } = useSilentAuthQuery();

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Suspense fallback={<Loader />}>
      <RouterProvider router={router} />
    </Suspense>
  );
}

export default App;
