import { EmergencyContact, FAQCategory } from "../model/FAQ.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { asyncHandler } from "../utills/AsyncHandler.js";

// ✅ Create FAQ Category
export const createFAQCategory = asyncHandler(async (req, res) => {
  const { title, faqs } = req.body;

  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required");
  }

  const existing = await FAQCategory.findOne({ title: title.trim() });
  if (existing) {
    throw new ApiError(400, "FAQ Category with this title already exists");
  }
  if (!faqs || faqs.length === 0) {
    throw new ApiError(400, "FAQs Are Empty ,at least 1 question required");
  }

  const category = await FAQCategory.create({ title, faqs: faqs });
  return res
    .status(201)
    .json(new ApiResponse(201, "FAQ Category created successfully"));
});

// ✅ Get All FAQ Categories
export const getAllFAQCategories = asyncHandler(async (req, res) => {
  const categories = await FAQCategory.find().sort({ priority: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, "FAQ Categories fetched successfully", categories)
    );
});

// ✅ Delete FAQ Category
export const deleteFAQCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await FAQCategory.findById(id);
  if (!category) {
    throw new ApiError(404, "FAQ Category not found");
  }

  await category.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "FAQ Category deleted successfully"));
});

export const AddQuestionInFAQCategory = asyncHandler(async (req, res) => {
  const { id } = req.params; // Category ID
  const { questions } = req.body;

  // Validate input
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "Questions and Answers are required");
  }

  const category = await FAQCategory.findById(id);
  if (!category) {
    throw new ApiError(404, "FAQ Category not found");
  }

  // Push each question-answer object
  questions.forEach((q) => {
    if (!q.question || !q.answer) {
      throw new ApiError(400, "Each question must have a question and answer");
    }
    category.faqs.push({ question: q.question, answer: q.answer });
  });

  await category.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        "Questions added to FAQ Category successfully",
        category
      )
    );
});

// ✅ Update a Question in FAQ Category
export const updateQuestionInFAQCategory = asyncHandler(async (req, res) => {
  const { categoryId, questionId } = req.params; // Category ID and Question ID
  const { question, answer } = req.body;

  if (!question && !answer) {
    throw new ApiError(400, "At least question or answer must be provided");
  }

  const category = await FAQCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "FAQ Category not found");
  }

  const faqItem = category.faqs.id(questionId);
  if (!faqItem) {
    throw new ApiError(404, "FAQ Question not found");
  }

  if (question) faqItem.question = question;
  if (answer) faqItem.answer = answer;

  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, faqItem, "FAQ Question updated successfully"));
});
// ✅ Update FAQ Category Title
export const updateFAQCategoryTitle = asyncHandler(async (req, res) => {
  const { id } = req.params; // Category ID
  const { title } = req.body;

  if (!title || title.trim() === "") {
    throw new ApiError(400, "Title is required");
  }

  const category = await FAQCategory.findById(id);
  if (!category) {
    throw new ApiError(404, "FAQ Category not found");
  }

  // Check for duplicate title
  const existing = await FAQCategory.findOne({ title: title.trim() });
  if (existing && existing._id.toString() !== id) {
    throw new ApiError(
      400,
      "Another FAQ Category with this title already exists"
    );
  }

  category.title = title.trim();
  await category.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, category, "FAQ Category title updated successfully")
    );
});

// ✅ Delete a Question from FAQ Category
export const deleteQuestionFromFAQCategory = asyncHandler(async (req, res) => {
  const { categoryId, questionId } = req.params;

  const category = await FAQCategory.findById(categoryId);
  if (!category) {
    throw new ApiError(404, "FAQ Category not found");
  }

  // Use `id()` to get the subdocument
  const faqItem = category.faqs.id(questionId);

  if (!faqItem) {
    throw new ApiError(404, "FAQ Question not found");
  }

  // Use `pull()` on the array to remove it
  category.faqs.pull(faqItem);
  await category.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "FAQ Question deleted successfully"));
});

// ========== EMERGENCY CONTACT CRUD ==========
// ✅ Create Emergency Contact
export const createEmergencyContact = asyncHandler(async (req, res) => {
  const { label, phone } = req.body;
  const contact = await EmergencyContact.create({ label, phone });
  return res
    .status(201)
    .json(
      new ApiResponse(201, contact, "Emergency contact created successfully")
    );
});

// ✅ Get All Emergency Contacts
export const getAllEmergencyContacts = asyncHandler(async (req, res) => {
  const contacts = await EmergencyContact.find().sort({ createdAt: -1 });
  return res
    .status(200)
    .json(
      new ApiResponse(200, "Emergency contacts fetched successfully", contacts)
    );
});

// ✅ Update Emergency Contact
export const updateEmergencyContact = asyncHandler(async (req, res) => {
  const { label, phone } = req.body;

  const contact = await EmergencyContact.findByIdAndUpdate(
    req.params.id,
    { label, phone },
    { new: true, runValidators: true }
  );

  if (!contact) throw new ApiError(404, "Emergency contact not found");

  return res
    .status(200)
    .json(
      new ApiResponse(200, contact, "Emergency contact updated successfully")
    );
});

// ✅ Delete Emergency Contact
export const deleteEmergencyContact = asyncHandler(async (req, res) => {
  const contact = await EmergencyContact.findByIdAndDelete(req.params.id);

  if (!contact) throw new ApiError(404, "Emergency contact not found");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Emergency contact deleted successfully"));
});
