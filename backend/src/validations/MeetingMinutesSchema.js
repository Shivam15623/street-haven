import * as yup from "yup";

export const editMeetingMinutesSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be at most 150 characters")
    .optional(),

  attendees: yup
    .number()
    .typeError("Attendees must be a number")
    .positive("Attendees must be greater than 0")
    .integer("Attendees must be an integer")
    .optional(),

  keyTopicsDiscussed: yup
    .array()
    .of(
      yup.string().trim().max(50, "Each topic must be at most 200 characters")
    )
    .max(20, "You can add at most 20 topics")
    .optional(),

  meetingDate: yup.date().typeError("Invalid meeting date format").optional(),

  keyHighlights: yup
    .array()
    .of(
      yup
        .string()
        .trim()
        .max(300, "Each highlight must be at most 300 characters")
    )
    .max(20, "You can add at most 20 highlights")
    .optional(),
});

export const createMeetingMinutesSchema = yup.object({
  title: yup
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(150, "Title must be at most 150 characters"),
  attendees: yup
    .number()
    .typeError("Attendees must be a number")
    .positive("Attendees must be greater than 0")
    .integer("Attendees must be an integer"),
  keyTopicsDiscussed: yup
    .array()
    .of(
      yup.string().trim().max(50, "Each topic must be at most 200 characters")
    )
    .max(20, "You can add at most 20 topics"),
  meetingDate: yup
    .date()
    .typeError("Invalid meeting date format")
    .max(new Date(), "Meeting date cannot be in the future")
    .optional(),

  keyHighlights: yup
    .array()
    .of(
      yup
        .string()
        .trim()
        .max(300, "Each highlight must be at most 300 characters")
    )
    .max(20, "You can add at most 20 highlights"),
});
