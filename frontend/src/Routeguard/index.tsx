import { type ReactNode } from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectAuth } from "../redux/AuthSlice";

import type { AllPermissions } from "../utills/auth/permissions";
import useHasPermission from "../hooks/Auth";

interface RouteGuardProps {
  children: ReactNode;
  isPublic?: boolean;
  requireRole?: string[];
  requirePermission?: AllPermissions[];
  permissionMode?: "any" | "all"; // default "any"
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  isPublic = false,
  requireRole = [],
  requirePermission = [],
  permissionMode = "any",
}) => {
  const location = useLocation();
  const { isLoggedIn, user, authStatus } = useSelector(selectAuth);
  const { hasAnyPermission, hasAllPermissions } = useHasPermission();

  // ⏳ Auth hydration phase (redux-persist)
  if (isLoggedIn === undefined) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  // 🔐 Protected route → not logged in
  if (!isPublic && !isLoggedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // 🚫 Public route → already logged in
  if (isPublic && isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  if (authStatus === "unknown") {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (authStatus === "inactive") {
    if (location.pathname !== "/account-inactive") {
      return <Navigate to="/account-inactive" replace />;
    }
    return <>{children}</>;
  }

  // 🧑‍⚖️ Role-based access (ONLY if logged in)
  if (
    isLoggedIn &&
    requireRole.length > 0 &&
    (!user || !requireRole.includes(user.role))
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 🔑 Permission-based access (ONLY if logged in)
  if (isLoggedIn && requirePermission.length > 0) {
    const allowed =
      permissionMode === "all"
        ? hasAllPermissions(requirePermission)
        : hasAnyPermission(requirePermission);

    if (!allowed) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};

export default RouteGuard;
