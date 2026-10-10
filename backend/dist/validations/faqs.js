import Joi from "joi";

export const createFAQCategorySchema = Joi.object({
  title: Joi.string().trim().min(1).required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),

  faqs: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().trim().min(1).required().messages({
          "string.empty": "FAQ question is required",
        }),

        answer: Joi.string().trim().min(1).required().messages({
          "string.empty": "FAQ answer is required",
        }),
      })
    )
    .min(1)
    .required()
    .custom((faqs, helpers) => {
      const questions = faqs.map((faq) => faq.question.trim().toLowerCase());

      const uniqueQuestions = new Set(questions);

      if (uniqueQuestions.size !== questions.length) {
        return helpers.message("FAQ questions must be unique");
      }

      return faqs;
    })
    .messages({
      "array.min": "FAQs are empty, at least 1 question is required",
      "any.required": "FAQs are required",
    }),
});

export const AddQuestionsSchema = Joi.object({
  questions: Joi.array()
    .items(
      Joi.object({
        question: Joi.string().trim().min(1).required().messages({
          "string.empty": "FAQ question is required",
        }),

        answer: Joi.string().trim().min(1).required().messages({
          "string.empty": "FAQ answer is required",
        }),
      })
    )
    .min(1)
    .required()
    .custom((faqs, helpers) => {
      const questions = faqs.map((faq) => faq.question.trim().toLowerCase());

      const uniqueQuestions = new Set(questions);

      if (uniqueQuestions.size !== questions.length) {
        return helpers.message("FAQ questions must be unique");
      }

      return faqs;
    })
    .messages({
      "array.min": "FAQs are empty, at least 1 question is required",
      "any.required": "FAQs are required",
    }),
});
export const updateDeleteFAQQuestionParamsSchema = Joi.object({
  categoryId: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid category ID",
    "string.hex": "Invalid category ID",
  }),

  questionId: Joi.string().hex().length(24).required().messages({
    "string.length": "Invalid question ID",
    "string.hex": "Invalid question ID",
  }),
});
export const updateFAQQuestionBodySchema = Joi.object({
  question: Joi.string().trim().min(1).optional().messages({
    "string.empty": "Question cannot be empty",
  }),

  answer: Joi.string().trim().min(1).optional().messages({
    "string.empty": "Answer cannot be empty",
  }),
})
  .or("question", "answer")
  .messages({
    "object.missing": "At least question or answer must be provided",
  });


export const createEmergencyContactSchema = Joi.object({
  label: Joi.string().trim().min(1).required().messages({
    "string.empty": "Label is required",
    "any.required": "Label is required",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[0-9+\-\s()]{6,20}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Invalid phone number format",
      "any.required": "Phone number is required",
    }),
});
