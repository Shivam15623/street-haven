import * as Yup from "yup";
export const PaymentRequisitionFormSchema = Yup.object({
  payeeName: Yup.string().required("Payee Name is required"),
  totalAmount: Yup.number(),
  requestedBy: Yup.string().required("Requested By Name is required"),
  requestedDate: Yup.date().nullable().required("Requested Date is required"),
  approvedBy: Yup.string().required("Approved By Name is required"),
  approvedDate: Yup.date().nullable().required("Approved Date is required"),
  purchaseDetails: Yup.array()
    .of(
      Yup.object().shape({
        date: Yup.date().nullable().required("Date is required"),
        nature: Yup.string().required("Nature is required"),
        program: Yup.string().required("Department is required"),
        expenseCode: Yup.string().required("Expense Code required"),
        netAmount: Yup.number().required("Net Amount is required"),
        hst: Yup.number().required("HST is required"),
        totalAmount: Yup.number().required("Total Amount is required"),
      })
    )
    .min(1, "At least one Purchase Detail is required"),
  invoices: Yup.mixed<File>()
    .nullable()
    .test("fileType", "Only PDF files are allowed", (value) => {
      return value instanceof File && value.type === "application/pdf";
    })
    .test("fileSize", "File size must be less than 16MB", (value) => {
      if (!value) return true;
      return value.size <= 16 * 1024 * 1024;
    }),
});

export const EmployeeIncidentFormSchema = Yup.object({
  reportingFor: Yup.string()
    .oneOf(["Injury", "Illness", "Near Miss"], "Invalid option")
    .required("This field is required"),

  employeeName: Yup.string().required("Employee name is required"),

  jobTitle: Yup.string().required("Job title is required"),

  superviserName: Yup.string().required("Supervisor name is required"),

  informedSuperviser: Yup.boolean().required("please fill this field"),

  injuryDate: Yup.date()
    .typeError("Please input a valid date (M/d/yyyy)")
    .required("Date of injury / near miss is required"),

  injuryTime: Yup.string().required("Time is required"),

  witnessName: Yup.string(),

  exactLocation: Yup.string().required("Location is required"),

  activityAtTime: Yup.string().required("This field is required"),

  incidentDescription: Yup.string().required("This field is required"),

  prevention: Yup.string().required("This field is required"),

  injuredBodyParts: Yup.string().required("This field is required"),

  doctorVisited: Yup.boolean().required("This Field is Required"),

  doctorName: Yup.string().when("doctorVisited", {
    is: true,
    then: (schema) => schema.required("Doctor name is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  doctorPhone: Yup.string().when("doctorVisited", {
    is: true,
    then: (schema) =>
      schema
        .required("Doctor phone number is required")
        .matches(/^[0-9+\-\s()]{7,20}$/, "Enter a valid phone number"),
    otherwise: (schema) => schema.nullable(),
  }),

  doctorVisitDate: Yup.date().when("doctorVisited", {
    is: true,
    then: (schema) =>
      schema
        .required("Date is required")
        .typeError("Enter a valid date (M/d/yyyy)"),
    otherwise: (schema) => schema.nullable(),
  }),

  doctorVisitTime: Yup.string().when("doctorVisited", {
    is: true,
    then: (schema) => schema.required("Time is required"),
    otherwise: (schema) => schema.nullable(),
  }),

  previousInjury: Yup.boolean().required(),

  previousInjuryDate: Yup.string().when("previousInjury", {
    is: true,
    then: (schema) =>
      schema.required("Please provide the previous injury date"),
    otherwise: (schema) => schema.nullable(),
  }),
});

export const ClientIncidentFormSchema = Yup.object({
  date: Yup.date().required("Date is required"),

  time: Yup.string().required("Time is required"),

  place: Yup.string().required("Place is required"),

  affectedClientname: Yup.string().required("Client name is required"),

  staffName: Yup.string().required("Staff name is required"),

  WitnessName: Yup.string().required("Witness name is required"),

  staffEmail: Yup.string()
    .email("Invalid staff email format")
    .required("Staff email is required"),

  incidentType: Yup.string()
    .oneOf(
      [
        "Disaster",
        "Drugs",
        "Property Destruction",
        "Theft",
        "Medical / Injury / Health Emergency",
        "Intruders",
        "Police Action",
        "Actual Physical / Sexual Violence",
        "Threat of Physical / Sexual Violence",
        "Bomb Threat",
        "Other",
        "",
      ],
      "Select a valid incident type"
    )
    .required("Type of Incident is required"),

  otherIncidentDescription: Yup.string().when("incidentType", {
    is: "Other",
    then: (schema) => schema.required("Please specify the incident"),
    otherwise: (schema) => schema.notRequired(),
  }),

  incidentDescription: Yup.string().required(
    "Incident description is required"
  ),

  ActionTaken: Yup.string().required("Action taken is required"),

  debrief: Yup.string().required("Debrief is required"),

  reportingStaffName: Yup.string().required("Reporting staff name is required"),
  repotingDate: Yup.date().required("reporting Date is required"),

  reportedTo: Yup.string().required("Reported to (name) is required"),
  reportedToDate: Yup.date().required("reported Date is required"),
  followUp: Yup.string().required("Follow Up is required"),
});
