import * as yup from "yup";

const createEventSchema = yup.object({
  title: yup.string().required("title is required"),
  description: yup.string().required("description is required"),
  location: yup.string().required("location is required"),
  facilitator: yup.string().required("facilitator is required"),
  capacity: yup
    .number()
    .typeError("capacity must be a number")
    .min(1, "capacity must be greater than 0")
    .required("capacity is required"),

  // ✅ If you're still using eventDate (single day events)
  eventDate: yup
    .date()
    .required("event date is required")
    .typeError("invalid date format")
    .min(new Date(), "event date cannot be in the past"),

  // ✅ Start and End Times (as Date objects)
  startTime: yup
    .date()
    .required("start time is required")
    .typeError("invalid start time")    .min(new Date(), "start Time cannot be in the past"),

  endTime: yup
    .date()
    .required("end time is required")
    .typeError("invalid end time")
    .min(yup.ref("startTime"), "end time must be after start time"),
});



export default createEventSchema;
