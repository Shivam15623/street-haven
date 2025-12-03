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

const router = Router();

// ------------------ FAQ Category Routes ------------------
// Apply JWT auth for all FAQ routes
router.use(passport.authenticate("jwt", { session: false }));

// FAQ Category CRUD
router.post(
  "/category",
  authorizePermissions({ action: PERMISSIONS.CREATE_FAQ }),
  createFAQCategory
); // create category
router.get("/category", getAllFAQCategories); // get all categories
router.patch(
  "/category/:id",
  authorizePermissions({ action: PERMISSIONS.EDIT_FAQ }),
  updateFAQCategoryTitle
); // update title
router.delete(
  "/category/:id",
  authorizePermissions({ action: PERMISSIONS.DELETE_FAQ }),
  deleteFAQCategory
); // delete category

// FAQ Questions CRUD
router.post(
  "/category/:id/question",
  authorizePermissions({ action: PERMISSIONS.CREATE_FAQ }),
  AddQuestionInFAQCategory
); // add question
router.patch(
  "/category/:categoryId/question/:questionId",
  authorizePermissions({ action: PERMISSIONS.EDIT_FAQ }),
  updateQuestionInFAQCategory
); // update question
router.delete(
  "/category/:categoryId/question/:questionId",
  authorizePermissions({ action: PERMISSIONS.DELETE_FAQ }),
  deleteQuestionFromFAQCategory
); // delete question

// ------------------ Emergency Contact Routes ------------------
router.post(
  "/emergency-contact",
  authorizePermissions({action: PERMISSIONS.CREATE_EMERGENCY_CONTACT}),
  createEmergencyContact
); // create
router.get("/emergency-contact", getAllEmergencyContacts); // get all
router.patch(
  "/emergency-contact/:id",
  authorizePermissions({ action: PERMISSIONS.EDIT_EMERGENCY_CONTACT }),
  updateEmergencyContact
); // update
router.delete(
  "/emergency-contact/:id",
  authorizePermissions({ action: PERMISSIONS.DELETE_EMERGENCY_CONTACT }),
  deleteEmergencyContact
); // delete

export default router;
