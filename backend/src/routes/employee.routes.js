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
import { PERMISSIONS } from "../auth/permissions.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(AllEmployees);
router.route("/edit/:id").patch(upload.single("profilePic"), EditEmployee);
router
  .route("/changePassword/:id")
  .patch(
    authorizePermissions({ action: PERMISSIONS.RESET_PASSWORD }),
    EditEmployeePassword
  );
router
  .route("/delete/:id")
  .delete(
    authorizePermissions({ action: PERMISSIONS.DELETE_EMPLOYEE }),
    RemoveEmployee
  );
router
  .route("/add")
  .post(
    authorizePermissions({ action: PERMISSIONS.CREATE_EMPLOYEE }),
    AddEmployee
  );

export default router;
