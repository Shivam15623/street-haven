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
import { validateRequest } from "../middleware/validate.js";
import {
  createEmployeeSchema,
  editEmployeeSchema,
  viewEmployees,
} from "../validations/employee.js";
import { idParamSchema } from "../validations/common.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));
router.route("/view").get(validateRequest(viewEmployees,"query"),AllEmployees);
router.route("/edit/:id").patch(upload.single("profilePic"), validateRequest(editEmployeeSchema, "body"), EditEmployee);
router
  .route("/changePassword/:id")
  .patch(
    authorizePermissions({ action: PERMISSIONS.RESET_PASSWORD }),
    validateRequest(idParamSchema, "params"),
    EditEmployeePassword
  );
router
  .route("/delete/:id")
  .delete(
    authorizePermissions({ action: PERMISSIONS.DELETE_EMPLOYEE }),
    validateRequest(idParamSchema, "params"),
    RemoveEmployee
  );
router
  .route("/add")
  .post(
    authorizePermissions({ action: PERMISSIONS.CREATE_EMPLOYEE }),
    validateRequest(createEmployeeSchema, "body"),
    AddEmployee
  );

export default router;
