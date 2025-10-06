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
const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(requireAdminRole, AllEmployees);
router
  .route("/edit/:id")
  .patch(upload.single("profilePic"), requireAdminRole, EditEmployee);
router
  .route("/changePassword/:id")
  .patch(requireAdminRole, EditEmployeePassword);
router.route("/delete/:id").delete(requireAdminRole, RemoveEmployee);
router.route("/add").post(requireAdminRole, AddEmployee);
export default router;
