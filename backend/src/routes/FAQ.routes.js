import { Router } from "express";
import passport from "passport";
import requireAdminRole from "../middleware/AuthRole.js";
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

const router = Router();

// ------------------ FAQ Category Routes ------------------
// Apply JWT auth for all FAQ routes
router.use(passport.authenticate("jwt", { session: false }));

// FAQ Category CRUD
router.post("/category", requireAdminRole, createFAQCategory); // create category
router.get("/category", getAllFAQCategories); // get all categories
router.patch("/category/:id", requireAdminRole, updateFAQCategoryTitle); // update title
router.delete("/category/:id", requireAdminRole, deleteFAQCategory); // delete category

// FAQ Questions CRUD
router.post("/category/:id/question", requireAdminRole, AddQuestionInFAQCategory); // add question
router.patch(
  "/category/:categoryId/question/:questionId",
  requireAdminRole,
  updateQuestionInFAQCategory
); // update question
router.delete(
  "/category/:categoryId/question/:questionId",
  requireAdminRole,
  deleteQuestionFromFAQCategory
); // delete question

// ------------------ Emergency Contact Routes ------------------
router.post("/emergency-contact", requireAdminRole, createEmergencyContact); // create
router.get("/emergency-contact", getAllEmergencyContacts); // get all
router.patch("/emergency-contact/:id", requireAdminRole, updateEmergencyContact); // update
router.delete("/emergency-contact/:id", requireAdminRole, deleteEmergencyContact); // delete

export default router;
