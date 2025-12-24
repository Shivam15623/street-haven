import mongoose from "mongoose";

// ====== FAQ Category Schema ======
const faqSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Question is required"],
    trim: true,
    minlength: [5, "Question must be at least 5 characters long"],
  },
  answer: {
    type: String,
    required: [true, "Answer is required"],
    trim: true,
    minlength: [5, "Answer must be at least 5 characters long"],
  },
});

const faqCategorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      unique: true,
      minlength: [3, "Title must be at least 3 characters long"],
    },
    faqs: {
      type: [faqSchema],
      default: [],
      validate: {
        validator: function (faqs) {
          const questions = faqs.map((f) => f.question.toLowerCase());
          return questions.length === new Set(questions).size;
        },
        message: "Duplicate FAQ questions are not allowed",
      },
    },
    priority: {
      type: Number,
      default: 1, // higher number = lower priority
    },
  },
  { timestamps: true }
);

// ====== Emergency Contact Schema ======
const emergencyContactSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: [true, "Label is required"],
      trim: true,
      minlength: [3, "Label must be at least 3 characters long"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [
        /^\+?[\d\s\-().xX]+$/,
        "Please provide a valid phone number (e.g. +1 (555) 123-4567 x999)",
      ],
    },
  },
  { timestamps: true }
);

const FAQCategory = mongoose.model("FAQCategory", faqCategorySchema);
const EmergencyContact = mongoose.model(
  "EmergencyContact",
  emergencyContactSchema
);

export { FAQCategory, EmergencyContact };
