import { type ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectAuth } from "../redux/AuthSlice";

interface RouteGuardProps {
  children: ReactNode;
  isPublic?: boolean;
  requireRole?: string[];
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  isPublic = false,
  requireRole = [],
}) => {
  const location = useLocation();
  const { isLoggedIn, user } = useSelector(selectAuth);

  // ⏳ Auth not ready yet → allow Suspense to work
  if (isLoggedIn === undefined) {
    return null; // or global splash if you want
  }

  // 🚫 Public route but user is logged in
  if (isPublic && isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  // 🔐 Protected route but user not logged in
  if (!isPublic && !isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (
    user &&
    !isPublic &&
    requireRole.length > 0 &&
    !requireRole.includes(user?.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  // 🧑‍⚖️ Role-based access
  if (
    user &&
    !isPublic &&
    requireRole.length > 0 &&
    !requireRole.includes(user?.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default RouteGuard;
