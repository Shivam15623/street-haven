// import { Formik } from "formik";

// import * as Yup from "yup";
// import { Button, Col, Form, Row, Card } from "react-bootstrap";
// import CustomDatePicker from "../../../../../components/child/DatePicker";
// import { PatternFormat } from "react-number-format";

// const ClientFeedBackFormSchema = Yup.object({
//   date: Yup.date().nullable(),
//   time: Yup.string().required("Time is required"),
//   place: Yup.string().nullable(),
//   affectedClientname: Yup.string().required("client Name is required"),
//   staffName: Yup.string().nullable().required("staff NAme is required"),
//   WitnessName: Yup.string().nullable().required("witness NAme is required"),
//   staffEmail: Yup.string().email("Invalid email format").nullable(),
//   incidentType: Yup.string()
//     .oneOf(
//       ["Disaster", "Product Issue", "Staff Behaviour", "Other"],
//       "Select a valid complaint type"
//     )
//     .required("Type of Incident is required"),
//   otherIncidentDescription: Yup.string().when("incidentType", {
//     is: "Other",
//     then: (schema) => schema.required("Please specify the complaint"),
//     otherwise: (schema) => schema.nullable(),
//   }),

//   phone: Yup.string()
//     .required("Phone number is required")
//     .matches(
//       /^(?:\+1\s?)?\(?([2-9][0-8][0-9])\)?[-.\s]?([2-9][0-9]{2})[-.\s]?([0-9]{4})$/,
//       "Enter a valid 10-digit Canadian phone number"
//     ),

//   email: Yup.string().email("Invalid email format").nullable(),
//   address: Yup.string(),

//   natureOfComplaint: Yup.string()
//     .oneOf(
//       ["Service Issue", "Product Issue", "Staff Behaviour", "Other"],
//       "Select a valid complaint type"
//     )
//     .required("Nature of complaint is required"),

//   otherComplaintDescription: Yup.string().when("natureOfComplaint", {
//     is: "Other",
//     then: (schema) => schema.required("Please specify the complaint"),
//     otherwise: (schema) => schema.nullable(),
//   }),

//   incidentDescription: Yup.string().nullable(),
//   ActionTaken: Yup.string().nullable(),
//   debrief: Yup.string().nullable(),

//   signature: Yup.mixed()
//     .required("Signature is required")
//     .test("fileRequired", "Signature file is required", (value) => {
//       return value instanceof File;
//     }),
// });
const ClientIncidentForm = () => {
  return <div className=" d-flex flex-column gap-24 ">ClientIncidentForm</div>;
};

export default ClientIncidentForm;
