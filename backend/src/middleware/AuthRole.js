import { ROLE_PERMISSIONS } from "../auth/rolePermissions.js";

export const authorizePermissions =
  ({ action }) =>
  (req, res, next) => {
    try {
      const role = req.user?.role;

      if (!role) {
 
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      const rolePermissions = ROLE_PERMISSIONS[role];

      if (!rolePermissions) {
 
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      // 🔥 Simple permission check
      const hasPermission = rolePermissions.includes(action);

      if (!hasPermission) {
     
        return res.status(403).json({ message: "Unauthorized Access" });
      }

      next();
    } catch (err) {

      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
