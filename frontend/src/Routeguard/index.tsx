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

  requireModule?: string; // moduleKey → "events"
  requireAction?: // CRUD or access
  "access" | "create" | "read" | "update" | "delete";

  requireFeatureKey?: string; // optional → "view_registrations"
}

const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  isPublic = false,
  requireModule,
  requireAction,
  requireFeatureKey,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoggedIn, user, Permissions } = useSelector(selectAuth);

  const isUserReady = isLoggedIn !== undefined && user !== undefined;

  const hasPermission = () => {
    console.log(requireModule);
    if (!requireModule) return true; // no permission needed for this route

    const module = Permissions.find((p) => p.moduleKey === requireModule);

    if (!module) return false;
    console.log(module.moduleKey, module.access);
    // Access check
    if (requireAction === "access" && !module.access) return false;

    // CRUD check
    if (
      requireAction &&
      ["create", "read", "update", "delete"].includes(requireAction)
    ) {
      if (!module[requireAction]) return false;
    }

    // Feature-specific check
    if (requireFeatureKey) {
      const feat = module.features?.find((f) => f.key === requireFeatureKey);
      if (!feat || !feat.allowed) return false;
    }

    return true;
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
    if (!hasPermission()) {
      navigate("/unauthorized", { replace: true });
      return;
    }
  }, [isUserReady, isLoggedIn, Permissions, location.pathname]);

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
