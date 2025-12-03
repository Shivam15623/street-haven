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
    if (!user) {
      return false;
    }
    const result = requireRole.includes(user?.role);

    return result;
  };

  // ─────────────────────────────
  // Redirect Logic
  // ─────────────────────────────
  useEffect(() => {
    if (!isUserReady) return;

    if (location.pathname === "/") {
      if (!isLoggedIn) {
        navigate("/login", { replace: true });
      }

      return; // let nested routes load index automatically
    }

    if (isPublic) {
      if (isLoggedIn) {
        navigate("/", { replace: true });
      }
      return;
    }

    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      return;
    }

    // ❌ If permission required and user doesn't have it
    if (requireRole.length && !hasPermission()) {
      navigate("/unauthorized", { replace: true });
      return;
    }
  }, [isUserReady, isLoggedIn, user, location.pathname]);

  if (!isUserReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-white text-gray-700">
        Checking authentication...
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteGuard;
