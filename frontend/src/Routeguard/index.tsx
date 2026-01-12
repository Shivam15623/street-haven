import { useEffect, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { selectAuth } from "../redux/AuthSlice";

// ─────────────────────────────
// Props for Permission-Based Access
// ─────────────────────────────
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
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn, user } = useSelector(selectAuth);
  const isUserReady = isLoggedIn !== undefined && user !== undefined;

  const hasPermission = () => {
    if (!user) return false;
    return requireRole.length === 0 || requireRole.includes(user?.role);
  };

  useEffect(() => {
    if (!isUserReady) return;

    if (isPublic && isLoggedIn) {
      navigate("/", { replace: true });
    } else if (!isPublic && !isLoggedIn) {
      navigate("/login", { replace: true });
    } else if (!isPublic && requireRole.length && !hasPermission()) {
      navigate("/unauthorized", { replace: true });
    }
  }, [isUserReady, isLoggedIn, user, location.pathname]);

  // ⛔ Block render until ready
  if (!isUserReady) {
    return (
      <div className="h-100 flex-grow-1 w-100 d-flex align-items-center justify-content-center">
        Checking authentication...
      </div>
    );
  }

  // ⛔ Block protected content for unauthenticated users
  if (!isPublic && !isLoggedIn) {
    return null; // Don't render anything - redirect will happen
  }

  // ⛔ Block public routes for authenticated users
  if (isPublic && isLoggedIn) {
    return null;
  }

  // ⛔ Block if missing required role
  if (!isPublic && requireRole.length && !hasPermission()) {
    return null;
  }

  return <>{children}</>;
};

export default RouteGuard;
