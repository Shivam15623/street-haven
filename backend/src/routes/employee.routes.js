import { Router } from "express";
import {
  AddEmployee,
  AllEmployees,
  EditEmployee,
  EditEmployeePassword,
  RemoveEmployee,
} from "../controllers/employees.controller.js";
import { upload } from "../middleware/multer.js";
import { authorizePermissions } from "../middleware/AuthRole.js";
import passport from "passport";
import {
  allRoles,
  createRole,
  deleteRole,
  editRole,
  getRoleById,
} from "../controllers/Role.controller.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router
  .route("/view")
  .get(
    authorizePermissions({ moduleKey: "employees", action: "access" }),
    AllEmployees
  );
router.route("/edit/:id").patch(upload.single("profilePic"), EditEmployee);
router
  .route("/changePassword/:id")
  .patch(
    authorizePermissions({ moduleKey: "employees", action: "create" }),
    EditEmployeePassword
  );
router
  .route("/delete/:id")
  .delete(
    authorizePermissions({ moduleKey: "employees", action: "delete" }),
    RemoveEmployee
  );
router
  .route("/add")
  .post(
    authorizePermissions({ moduleKey: "employees", action: "create" }),
    AddEmployee
  );
router.route("/role/create").post(createRole);
router.route("/role/edit/:id").patch(editRole);
router.route("/role/delete/:id").delete(deleteRole);
router.route("/role").post(allRoles);
router.route("/role/:id").get(getRoleById);
export default router;
