export const authorizePermissions =
  ({ moduleKey, action = "access", featureKey }) =>
  (req, res, next) => {
    try {
      const role = req.user?.role;

      if (!role) {
        console.warn("AUTH ERROR: User has no role");
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      const module = role.permissions?.find((m) => m.moduleKey === moduleKey);

      if (!module) {
        console.warn(
          `AUTH ERROR: Role "${role.roleName}" does not include module "${moduleKey}"`
        );
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      // Combined permission logic
      const noModuleAccess = action === "access" && module.access === false;

      const noCrudPermission =
        ["create", "read", "update", "delete"].includes(action) &&
        module[action] !== true;

      const noFeaturePermission =
        featureKey &&
        !module.features?.some(
          (f) => f.key === featureKey && f.allowed === true
        );

      if (noModuleAccess || noCrudPermission || noFeaturePermission) {
        console.warn(
          `AUTH ERROR: Permission denied → module=${moduleKey}, action=${action}, feature=${featureKey}`
        );
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      next();
    } catch (err) {
      console.error("AUTH MIDDLEWARE ERROR:", err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
