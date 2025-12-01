import { Router } from "express";
import {
  AddEmployee,
  AllEmployees,
  EditEmployee,
  EditEmployeePassword,
  RemoveEmployee,
} from "../controllers/employees.controller.js";
import { upload } from "../middleware/multer.js";
import requireAdminRole from "../middleware/AuthRole.js";
import passport from "passport";
import {
  allRoles,
  createRole,
  deleteRole,
  editRole,
} from "../controllers/Role.controller.js";
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(AllEmployees);
router.route("/edit/:id").patch(upload.single("profilePic"), EditEmployee);
router
  .route("/changePassword/:id")
  .patch(requireAdminRole, EditEmployeePassword);
router.route("/delete/:id").delete(requireAdminRole, RemoveEmployee);
router.route("/add").post(requireAdminRole, AddEmployee);
router.route("/role/create").post(createRole);
router.route("/role/edit/:id").patch(editRole);
router.route("/role/delete/:id").delete(deleteRole);
router.route("/role").post(allRoles);
export default router;
