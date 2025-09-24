import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import Sheet from "./child/Sheet";
import { toast } from "react-toastify";

// Allowed statuses
const allowedStatuses = [
  "New/Open",
  "Connected on LinkedIn",
  "Interested",
  "Meeting Fixed",
  "Requirement Shared",
  "Quotation Shared",
  "Not Interested",
];

// Regex for contact number (allows +countrycode or 10 digits)
const phoneRegex = /^(\+?\d{1,3}[- ]?)?\d{10}$/;

// Stricter email regex (RFC 5322 compliant-ish)
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const LeadSchema = Yup.object().shape({
  company: Yup.string().required("Company is required"),
  contactPerson: Yup.string().required("Contact Person is required"),
  contactNo: Yup.string()
    .matches(phoneRegex, "Invalid contact number")
    .required("Contact No is required"),
  email: Yup.string()
    .matches(emailRegex, "Invalid email")
    .required("Email is required"),
  status: Yup.string()
    .oneOf(allowedStatuses, "Invalid status")
    .required("Status is required"),
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required"),
  dueDate: Yup.date()
    .min(new Date(), "Due Date cannot be in the past")
    .required("Due Date is required"),
  assignedTo: Yup.string().required("Assigned To is required"),
});

const CreateEditLead = ({ id, sTrigger, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialValues, setInitialValues] = useState({
    company: "",
    contactPerson: "",
    contactNo: "",
    email: "",
    status: "",
    title: "",
    description: "",
    dueDate: "",
    assignedTo: "",
    attachment: null,
  });
  console.log(initialValues.dueDate);
  // Fetch users
  useEffect(() => {
    axios
      .get("http://localhost:8000/api/v1/users/form")
      .then((res) => setUsers(res.data.data || []))
      .catch((err) => console.error(err));
  }, []);

  // Fetch lead data if editing
  useEffect(() => {
    if (id) {
      axios.get(`http://localhost:8000/api/v1/leads/${id}`).then((res) => {
        console.log("Fetched lead data:", res.data.data);
        setInitialValues({
          ...res.data.data,
          assignedTo: res.data.data.assignedTo
            ? res.data.data.assignedTo._id
            : "",
          dueDate: res.data.data.dueDate
            ? new Date(res.data.data.dueDate).toISOString().split("T")[0]
            : "",
          attachment: null,
        });
      });
    }
  }, [id]);

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setLoading(true);
      const formData = new FormData();
      Object.keys(values).forEach((key) => {
        if (values[key] !== null) {
          formData.append(key, values[key]);
        }
      });

      let res;
      if (id) {
        res = await axios.patch(
          `http://localhost:8000/api/v1/leads/update/${id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (res.data.success) {
          toast.success("Lead updated successfully!");
        }
      } else {
        res = await axios.post(
          `http://localhost:8000/api/v1/leads/create`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (res.data.success) {
          toast.success("Lead created successfully!");
        }
      }

      // Reset form with updated values from API
      resetForm({
        values: {
          ...res.data.data,
          assignedTo: res.data.data.assignedTo
            ? res.data.data.assignedTo._id
            : "",
          dueDate: res.data.data.dueDate
            ? new Date(res.data.data.dueDate).toISOString().split("T")[0]
            : "",
        },
      });
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      className="bg-white"
      title={id ? "Edit Lead" : "Add New Lead"}
      trigger={sTrigger}
      footer={({ close }) => (
        <>
          <button
            className="btn btn-secondary me-2"
            onClick={close}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="leadForm"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </>
      )}
    >
      <Formik
        enableReinitialize
        initialValues={initialValues}
        validationSchema={LeadSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue }) => (
          <Form id="leadForm" className="px-3">
            {/* Company */}
            <div className="mb-3">
              <label>Company</label>
              <Field name="company" className="form-control" />
              <ErrorMessage
                name="company"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Contact Person */}
            <div className="mb-3">
              <label>Contact Person</label>
              <Field name="contactPerson" className="form-control" />
              <ErrorMessage
                name="contactPerson"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Contact No */}
            <div className="mb-3">
              <label>Contact No</label>
              <Field name="contactNo" className="form-control" />
              <ErrorMessage
                name="contactNo"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label>Email</label>
              <Field name="email" type="email" className="form-control" />
              <ErrorMessage
                name="email"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Status */}
            <div className="mb-3">
              <label>Status</label>
              <Field as="select" name="status" className="form-control">
                <option value="">Select Status</option>
                <option value="New/Open">New/Open</option>
                <option value="Connected on LinkedIn">
                  Connected on LinkedIn
                </option>
                <option value="Interested">Interested</option>
                <option value="Meeting Fixed">Meeting Fixed</option>
                <option value="Requirement Shared">Requirement Shared</option>
                <option value="Quotation Shared">Quotation Shared</option>
                <option value="Not Interested">Not Interested</option>
              </Field>
              <ErrorMessage
                name="status"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Title */}
            <div className="mb-3">
              <label>Title</label>
              <Field name="title" className="form-control" />
              <ErrorMessage
                name="title"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Description */}
            <div className="mb-3">
              <label>Description</label>
              <Field
                as="textarea"
                name="description"
                rows="3"
                className="form-control"
              />
              <ErrorMessage
                name="description"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Due Date */}
            <div className="mb-3">
              <label>Due Date</label>
              <Field type="date" name="dueDate" className="form-control" />
              <ErrorMessage
                name="dueDate"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Assigned To */}
            <div className="mb-3">
              <label>Assigned To</label>
              <Field as="select" name="assignedTo" className="form-control">
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
              </Field>
              <ErrorMessage
                name="assignedTo"
                component="div"
                className="text-danger"
              />
            </div>

            {/* Attachment */}
            <div className="mb-3">
              <label>Attachment</label>
              <input
                type="file"
                name="attachment"
                className="form-control"
                onChange={(e) => setFieldValue("attachment", e.target.files[0])}
              />
            </div>
          </Form>
        )}
      </Formik>
    </Sheet>
  );
};

export default CreateEditLead;
