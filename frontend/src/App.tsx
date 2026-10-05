import { RouterProvider } from "react-router-dom";
import { Suspense, useEffect } from "react";
import * as Sentry from "@sentry/react";
import router from "./routes";
import Loader from "./components/Loader";
import { useSilentAuthQuery } from "./services/AuthApi";
import { selectAuth } from "./redux/AuthSlice";
import { useSelector } from "react-redux";

function App() {
  const { isLoading } = useSilentAuthQuery();
  const { user } = useSelector(selectAuth);
  useEffect(() => {
    Sentry.setUser(user ? { id: String(user._id) } : null);
    Sentry.setTag("role", user?.role ?? "anonymous");
  }, [user]);
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
