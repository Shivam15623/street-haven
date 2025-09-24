import { useEffect, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { selectAuth } from "../redux/AuthSlice";

interface RouteGuardProps {
  children: ReactNode;
  requireRole?: "admin" | "employee";
  requireAnyRole?: ("admin" | "employee")[];
  isPublic?: boolean;
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  requireRole,
  requireAnyRole,
  isPublic = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, user } = useSelector(selectAuth);

  const role = user?.role;

  // 🧠 1. Prevent rendering too early
  const isUserReady = isLoggedIn !== undefined && user !== undefined;

  useEffect(() => {
    if (!isUserReady) return;

    // 🏠 Special handling for root "/"
    if (location.pathname === "/") {
      console.log("rop")
      if (!isLoggedIn) {
        navigate("/login", { replace: true });
      } else if (role) {
        const redirectPath = role === "admin" ? "/admin" : "/employee";
        navigate(redirectPath, { replace: true });
      }
      return; // stop further checks
    }

    // 🌐 Public routes
    if (isPublic && isLoggedIn && role) {
      const redirectPath = role === "admin" ? "/admin" : "/employee";
      navigate(redirectPath, { replace: true });
    }

    // 🔒 Protected routes
    if (!isPublic) {
      if (!isLoggedIn || !user) {
        navigate("/login", {
          state: { from: location.pathname },
          replace: true,
        });
        return;
      }

      if (requireRole && role !== requireRole) {
        navigate("/unauthorized", { replace: true });
        return;
      }

      if (requireAnyRole && (!role || !requireAnyRole.includes(role))) {
        navigate("/unauthorized", { replace: true });
        return;
      }
    }
  }, [
    isLoggedIn,
    user,
    role,
    isPublic,
    requireRole,
    requireAnyRole,
    location.pathname,
    navigate,
    isUserReady,
  ]);

  // ⛔ 3. Wait until auth state is known
  if (!isUserReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-gray-700">
        Checking authentication...
      </div>
    );
  }

  const allowAccess =
    isPublic ||
    (isLoggedIn &&
      user &&
      (!requireRole || role === requireRole) &&
      (!requireAnyRole || (role && requireAnyRole.includes(role))));

  return allowAccess ? <>{children}</> : null;
};

export default RouteGuard;
