import { Router } from "express";
import passport from "passport";

import {
  createFAQCategory,
  getAllFAQCategories,
  deleteFAQCategory,
  AddQuestionInFAQCategory,
  updateQuestionInFAQCategory,
  updateFAQCategoryTitle,
  deleteQuestionFromFAQCategory,
  createEmergencyContact,
  getAllEmergencyContacts,
  updateEmergencyContact,
  deleteEmergencyContact,
} from "../controllers/Faq.controller.js"; // or wherever your controller is
import { authorizePermissions } from "../middleware/AuthRole.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { validateRequest } from "../middleware/validate.js";
import {
  AddQuestionsSchema,
  createEmergencyContactSchema,
  createFAQCategorySchema,
  updateDeleteFAQQuestionParamsSchema,
  updateFAQQuestionBodySchema,
} from "../validations/faqs.js";
import { idParamSchema } from "../validations/common.js";
import { checkActiveUser } from "../middleware/checkActiveUsers.js";

const router = Router();

// ------------------ FAQ Category Routes ------------------
// Apply JWT auth for all FAQ routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(checkActiveUser);

// FAQ Category CRUD
router.post(
  "/category",
  authorizePermissions({ action: PERMISSIONS.CREATE_FAQ }),
  validateRequest(createFAQCategorySchema, "body"),
  createFAQCategory
); // create category
router.get("/category", getAllFAQCategories); // get all categories
router.patch(
  "/category/:id",
  validateRequest(idParamSchema, "params"),
  authorizePermissions({ action: PERMISSIONS.EDIT_FAQ }),
  updateFAQCategoryTitle
); // update title
router.delete(
  "/category/:id",
  validateRequest(idParamSchema, "params"),
  authorizePermissions({ action: PERMISSIONS.DELETE_FAQ }),
  deleteFAQCategory
); // delete category

// FAQ Questions CRUD
router.post(
  "/category/:id/question",
  validateRequest(idParamSchema, "params"),
  authorizePermissions({ action: PERMISSIONS.CREATE_FAQ }),
  validateRequest(AddQuestionsSchema, "body"),
  AddQuestionInFAQCategory
); // add question
router.patch(
  "/category/:categoryId/question/:questionId",
  validateRequest(updateDeleteFAQQuestionParamsSchema, "params"),
  validateRequest(updateFAQQuestionBodySchema, "body"),
  authorizePermissions({ action: PERMISSIONS.EDIT_FAQ }),
  updateQuestionInFAQCategory
); // update question
router.delete(
  "/category/:categoryId/question/:questionId",
  validateRequest(updateDeleteFAQQuestionParamsSchema, "params"),
  authorizePermissions({ action: PERMISSIONS.DELETE_FAQ }),
  deleteQuestionFromFAQCategory
); // delete question

// ------------------ Emergency Contact Routes ------------------
router.post(
  "/emergency-contact",
  authorizePermissions({ action: PERMISSIONS.CREATE_EMERGENCY_CONTACT }),
  validateRequest(createEmergencyContactSchema, "body"),
  createEmergencyContact
); // create
router.get("/emergency-contact", getAllEmergencyContacts); // get all
router.patch(
  "/emergency-contact/:id",
  validateRequest(idParamSchema, "params"),
  authorizePermissions({ action: PERMISSIONS.EDIT_EMERGENCY_CONTACT }),
  validateRequest(createEmergencyContactSchema, "body"),
  updateEmergencyContact
); // update
router.delete(
  "/emergency-contact/:id",
  authorizePermissions({ action: PERMISSIONS.DELETE_EMERGENCY_CONTACT }),
  validateRequest(idParamSchema, "params"),
  deleteEmergencyContact
); // delete

export default router;
