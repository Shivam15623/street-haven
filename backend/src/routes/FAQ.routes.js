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

const router = Router();

// ------------------ FAQ Category Routes ------------------
// Apply JWT auth for all FAQ routes
router.use(passport.authenticate("jwt", { session: false }));

// FAQ Category CRUD
router.post(
  "/category",
  authorizePermissions({ moduleKey: "faq_resources", action: "create" }),
  createFAQCategory
); // create category
router.get("/category", getAllFAQCategories); // get all categories
router.patch(
  "/category/:id",
  authorizePermissions({ moduleKey: "faq_resources", action: "update" }),
  updateFAQCategoryTitle
); // update title
router.delete(
  "/category/:id",
  authorizePermissions({ moduleKey: "faq_resources", action: "delete" }),
  deleteFAQCategory
); // delete category

// FAQ Questions CRUD
router.post(
  "/category/:id/question",
  authorizePermissions({ moduleKey: "faq_resources", action: "create" }),
  AddQuestionInFAQCategory
); // add question
router.patch(
  "/category/:categoryId/question/:questionId",
  authorizePermissions({ moduleKey: "faq_resources", action: "update" }),
  updateQuestionInFAQCategory
); // update question
router.delete(
  "/category/:categoryId/question/:questionId",
  authorizePermissions({ moduleKey: "faq_resources", action: "delete" }),
  deleteQuestionFromFAQCategory
); // delete question

// ------------------ Emergency Contact Routes ------------------
router.post(
  "/emergency-contact",
  authorizePermissions({ moduleKey: "faq_resources", action: "create" }),
  createEmergencyContact
); // create
router.get("/emergency-contact", getAllEmergencyContacts); // get all
router.patch(
  "/emergency-contact/:id",
  authorizePermissions({ moduleKey: "faq_resources", action: "update" }),
  updateEmergencyContact
); // update
router.delete(
  "/emergency-contact/:id",
  authorizePermissions({ moduleKey: "faq_resources", action: "delete" }),
  deleteEmergencyContact
); // delete

export default router;
