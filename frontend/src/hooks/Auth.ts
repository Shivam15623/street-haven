import { useSelector } from "react-redux";
import { selectAuth } from "../redux/AuthSlice";

interface PermissionCheck {
  moduleKey: string;
  action?: "access" | "create" | "read" | "update" | "delete";
  featureKey?: string;
}
export type HasPermissionFn = (args: PermissionCheck) => boolean;
const useHasPermission = () => {
  const { Permissions } = useSelector(selectAuth);

  const hasPermission = ({
    moduleKey,
    action = "access",
    featureKey,
  }: PermissionCheck) => {
    if (!Permissions) return false;

    const module = Permissions.find((p) => p.moduleKey === moduleKey);
    if (!module) return false;

    // Check module access
    if (action === "access" && !module.access) return false;

    // CRUD check
    if (["create", "read", "update", "delete"].includes(action)) {
      if (!module[action]) return false;
    }

    // Feature-specific check
    if (featureKey) {
      const feat = module.features?.find((f) => f.key === featureKey);
      if (!feat || !feat.allowed) return false;
    }

    return true;
  };

  return { hasPermission };
};

export default useHasPermission;
