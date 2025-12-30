import * as Yup from "yup";
import { CANADA_PROVINCES } from "../../../services/FormApi";
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
export const functionalAbilityFormSchema = Yup.object({
  claimNo: Yup.string().required("Please enter the claim number."),
  worker: Yup.object({
    firstName: Yup.string().required("First name is required."),
    lastName: Yup.string().required("Last name is required."),
    telephone: Yup.string().required("Telephone number is required."),
    address: Yup.string().required("Address is required."),
    cityTown: Yup.string().required("City / Town is required."),
    province: Yup.string()
      .oneOf(
        CANADA_PROVINCES.map((p) => p.value),
        "Invalid province"
      )
      .required("Province is required"),
    postalCode: Yup.string().required("Postal code is required."),
    dateOfBirth: Yup.date()
      .required("Date of birth is required.")
      .test(
        "not-future-date",
        "Date of Birth cannot be in the future",
        (val) => {
          if (!val) return true;
          const today = new Date();
          const selected = new Date(val);
          // ignore time when comparing
          selected.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          return selected <= today;
        }
      ),
  }),

  dateOfAccident: Yup.date()
    .required("Please enter the accident date.")
    .test(
      "not-future-date",
      "Date of Accident cannot be in the future",
      (val) => {
        if (!val) return true;
        const today = new Date();
        const selected = new Date(val);
        // ignore time when comparing
        selected.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        return selected <= today;
      }
    ),
  employerFaxNo: Yup.string().required("Fax number is required."),

  employer: Yup.object({
    fullName: Yup.string().required("Employer name is required."),
    telephone: Yup.string().required("Employer phone number is required."),
    address: Yup.string().required("Employer address is required."),
    cityTown: Yup.string().required("City / Town is required."),
    province: Yup.string()
      .oneOf(
        CANADA_PROVINCES.map((p) => p.value),
        "Invalid province"
      )
      .required("Province is required"),
    postalCode: Yup.string().required("Postal code is required."),
  }),

  typeOfJobAtAccident: Yup.string().required(
    "Type of Job at  Accident is required"
  ),
  areasOfInjury: Yup.string().required("please Specify areas of injuries"),
  discussedRTW: Yup.boolean().required("please answer this field"),

  nodateOfDiscusswill: Yup.date()
    .when("discussedRTW", {
      is: false,
      then: (s) =>
        s
          .required("Please provide the date of discussion.")
          .test(
            "not-past-date",
            "Date of return to work discuss cannot be in the past",
            (val) => {
              if (!val) return true;
              const today = new Date();
              const selected = new Date(val);
              // ignore time when comparing
              selected.setHours(0, 0, 0, 0);
              today.setHours(0, 0, 0, 0);

              return selected >= today;
            }
          ),
      otherwise: (s) => s.notRequired(),
    })
    .default(null),

  employerContactName: Yup.string().required(),
  position: Yup.string().required(),
  designationOfHealthPro: Yup.string().required(),
  otherDesignation: Yup.string().when("designationOfHealthPro", {
    is: "Other",
    then: (s) => s.required("Please specify"),
    otherwise: (s) => s.notRequired(),
  }),
  iswsibRegistered: Yup.boolean().required("please fill this field"),
  wsibId: Yup.string().when("iswsibRegistered", {
    is: true,
    then: (s) => s.required("Please fill This Field"),
    otherwise: (s) => s.strip(),
  }),
  invoiceNo: Yup.string().required("please fill this field"),
  srvCode: Yup.string().required("please fill this field"),
  hstRegNo: Yup.string().notRequired(),
  hstSrvcCode: Yup.string().notRequired(),
  hstAmount: Yup.number().notRequired(),
  healthProfessionalName: Yup.string().required("please fill this field"),
  hproAddress: Yup.string().required("please fill this field"),
  hprocityTown: Yup.string().required("please fill this field"),
  hproProvince: Yup.string()
    .oneOf(
      CANADA_PROVINCES.map((p) => p.value),
      "Invalid province"
    )
    .required("Province is required"),
  hproPostalCode: Yup.string().required("please fill this field"),
  hproFax: Yup.string().required("please fill this field"),
  assesmentDate: Yup.date()
    .required("please fill this field")
    .min(
      Yup.ref("dateOfAccident"),
      "Assesment Date cant be earlier than date Of accident"
    ),
  returnToWorkStatus: Yup.string()
    .oneOf(["noRestrictions", "withRestrictions", "unable"])
    .required("please fill this field"),

  // --- ABILITIES (Validate only if RTW requires restrictions)
  abilities: Yup.object().when("returnToWorkStatus", {
    is: (val: string | undefined) => val === "withRestrictions",
    then: (schema) =>
      schema.shape({
        walking: Yup.object({
          option: Yup.string().required("please select one"),
          otherText: Yup.string().when("option", {
            is: "other",
            then: (s) => s.required("Please specify walking ability"),
          }),
        }),
        standing: Yup.object({
          option: Yup.string()
            .oneOf(["fullAbilities", "upto15", "15to30", "other"])
            .required("please select one"),
          otherText: Yup.string().when("option", {
            is: "other",
            then: (s) => s.required("Please specify standing ability"),
          }),
        }),
        sitting: Yup.object({
          option: Yup.string()
            .oneOf(["fullAbilities", "upto30", "30to60", "other"])
            .required("please select one"),
          otherText: Yup.string().when("option", {
            is: "other",
            then: (s) => s.required("Please specify sitting ability"),
          }),
        }),
        liftingFloorToWaist: Yup.object({
          option: Yup.string()
            .oneOf(["fullAbilities", "upto5kg", "5to10kg", "other"])
            .required("please select one"),
          otherText: Yup.string().when("option", {
            is: "other",
            then: (s) => s.required("Please specify lifting ability"),
          }),
        }),
        liftingWaistToShoulder: Yup.object({
          option: Yup.string()
            .oneOf(["fullAbilities", "upto5kg", "5to10kg", "other"])
            .required("please select one"),
          otherText: Yup.string().when("option", {
            is: "other",
            then: (s) => s.required("Please specify lifting ability"),
          }),
        }),
        stairClimbing: Yup.object({
          option: Yup.string()
            .oneOf(["fullAbilities", "upto5steps", "5to10steps", "other"])
            .required("please select one"),
          otherText: Yup.string().when("option", {
            is: "other",
            then: (s) => s.required("Please specify stair ability"),
          }),
        }),
        ladderClimbing: Yup.object({
          option: Yup.string()
            .oneOf(["fullAbilities", "1to3steps", "4to6steps", "other"])
            .required("please select one"),
          otherText: Yup.string().when("option", {
            is: "other",
            then: (s) => s.required("Please specify ladder ability"),
          }),
        }),
        travelToWork: Yup.object({
          publicTransit: Yup.string()
            .oneOf(["yes", "no"])
            .required("please select one"),
          car: Yup.string().oneOf(["yes", "no"]).required("please select one"),
        }),
      }),

    otherwise: (schema) => schema.strip(), // ⬅️ removes the whole object if RTW = noRestrictions
  }),

  // --- RESTRICTIONS (Validate only if RTW requires restrictions)
  restrictions: Yup.object().when("returnToWorkStatus", {
    is: (val: string | undefined) => val === "withRestrictions",
    then: (schema) =>
      schema.shape({
        bendingTwisting: Yup.object({
          checked: Yup.boolean(),
          details: Yup.string().when("checked", {
            is: true,
            then: (s) => s.required("Please specify details"),
          }),
        }),
        chemicalExposure: Yup.object({
          checked: Yup.boolean(),
          details: Yup.string().when("checked", {
            is: true,
            then: (s) => s.required("Please specify chemical"),
          }),
        }),
        environmentalExposure: Yup.object({
          checked: Yup.boolean(),
          details: Yup.string().when("checked", {
            is: true,
            then: (s) => s.required("Specify environment type"),
          }),
        }),
        operatingMotorizedEquipment: Yup.object({
          checked: Yup.boolean(),
          details: Yup.string().when("checked", {
            is: true,
            then: (s) => s.required("Specify equipment"),
          }),
        }),
        medicationSideEffects: Yup.object({
          checked: Yup.boolean(),
          details: Yup.string().when("checked", {
            is: true,
            then: (s) => s.required("Specify side effects"),
          }),
        }),
        workAboveShoulder: Yup.object({
          checked: Yup.boolean(),
          details: Yup.string().when("checked", {
            is: true,
            then: (s) => s.required("Specify area or activity"),
          }),
        }),
        limitedPushingPulling: Yup.object({
          checked: Yup.boolean(),
          leftArm: Yup.boolean(),
          rightArm: Yup.boolean(),
          other: Yup.boolean(),
        }),
        exposureToVibration: Yup.object({
          checked: Yup.boolean(),
          wholeBody: Yup.boolean(),
          handArm: Yup.boolean(),
        }),
        limitedUseOfHands: Yup.object({
          checked: Yup.boolean(),
          left: Yup.object({
            gripping: Yup.boolean(),
            pinching: Yup.boolean(),
            other: Yup.boolean(),
          }),
          right: Yup.object({
            gripping: Yup.boolean(),
            pinching: Yup.boolean(),
            other: Yup.boolean(),
          }),
        }),
      }),

    otherwise: (schema) => schema.strip(), // ⬅️ remove restrictions if not needed
  }),

  commentsOnAbilties: Yup.string().when("returnToWorkStatus", {
    is: "withRestrictions",
    then: (s) => s.required("Comments are required"),
    otherwise: (s) => s.strip(),
  }),

  assessmentDuration: Yup.string()
    .oneOf(["1-2 days", "3-7 days", "8-14 days", "14+ days"])
    .when("returnToWorkStatus", {
      is: "withRestrictions",
      then: (s) => s.required("Assessment duration required"),
      otherwise: (s) => s.strip(),
    }),

  isDiscussRTWtoPatient: Yup.boolean().when("returnToWorkStatus", {
    is: "withRestrictions",
    then: (s) => s.required("Please select Yes/No"),
    otherwise: (s) => s.strip(),
  }),
  recomendedHours: Yup.string().when("returnToWorkStatus", {
    is: "withRestrictions",
    then: (schema) =>
      schema
        .oneOf(["regular", "modified", "graduated"])
        .required("recommended Hours of Work is required"),
    otherwise: (schema) => schema.notRequired().strip(),
  }),

  startDate: Yup.date().when("returnToWorkStatus", {
    is: "withRestrictions",
    then: (schema) =>
      schema
        .min(new Date(), "start date cant be in past")
        .required("start date is required"),
    otherwise: (schema) => schema.notRequired().strip(),
  }),
  nextAppointmentDate: Yup.date().when("returnToWorkStatus", {
    is: "noRestrictions",
    then: (s) => s.notRequired(),
    otherwise: (s) =>
      s
        .required("please fill next Appointment date")
        .test(
          "not-past-date",
          "next Appointment Date cannot be in the past",
          (val) => {
            if (!val) return true;
            const today = new Date();
            const selected = new Date(val);
            // ignore time when comparing
            selected.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            return selected > today;
          }
        )
        .min(
          Yup.ref("assesmentDate"),
          "next Appointment Date Cannot be earlier than Assesment"
        ),
  }),
  providedTo: Yup.object({
    worker: Yup.boolean(),
    employer: Yup.boolean(),
  }).test(
    "at-least-one",
    "Select at least one option (Worker or Employer)",
    (value) => value?.worker || value?.employer
  ),
});
