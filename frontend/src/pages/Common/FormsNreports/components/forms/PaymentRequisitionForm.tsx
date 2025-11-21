import { Field, FieldArray, Formik, type FormikErrors } from "formik";
import {  Card, Col, Form, Row, Table } from "react-bootstrap";
import * as Yup from "yup";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import { Icon } from "@iconify/react/dist/iconify.js";

// --------------------
// TYPES
// --------------------
interface PurchaseDetail {
  date: Date | null;
  nature: string;
  department: string;
  programExpenseCode: string;
  amount: string;
}

interface FormValues {
  payeeName: string;
  totalAmount: string;
  requestedBy: string;
  requestedDate: Date | null;
  purchaseDetails: PurchaseDetail[];
}

// --------------------
// SCHEMA
// --------------------
const FormSchema = Yup.object({
  payeeName: Yup.string().required("Payee Name is required"),
  totalAmount: Yup.number().required("Amount is required"),
  requestedBy: Yup.string().required("Requested By Name is required"),
  requestedDate: Yup.date().nullable().required("Requested Date is required"),
  purchaseDetails: Yup.array()
    .of(
      Yup.object().shape({
        date: Yup.date().nullable().required("Date is required"),
        nature: Yup.string().required("Nature is required"),
        department: Yup.string().required("Department is required"),
        programExpenseCode: Yup.string().required("Expense Code required"),
        amount: Yup.number().required("Amount is required"),
      })
    )
    .min(1, "At least one Purchase Detail is required"),
});

const PaymentRequisitionForm = () => {
  const initialValues: FormValues = {
    payeeName: "",
    totalAmount: "",
    requestedBy: "",
    requestedDate: new Date(),
    purchaseDetails: [
      {
        date: null,
        nature: "",
        department: "",
        programExpenseCode: "",
        amount: "",
      },
    ],
  };

  const handleSubmit = (values: FormValues) => {
    console.log("Form Submit:", values);
  };

  return (
    <div className="d-flex flex-column gap-24 ">
      <div className="card">
        <div className="card-body d-flex flex-column">
          <h4 className="text-lg sm:text-xl text-street-dark fw-semibold mb-2">
            Payment Requisition Form
          </h4>
        </div>
      </div>

      {/* FORM START */}
      <Formik
        validationSchema={FormSchema}
        initialValues={initialValues}
        onSubmit={handleSubmit}
      >
        {({
          handleSubmit,
          values,
          errors,
          touched,
          setFieldValue,
          handleChange,
          setFieldTouched,
          handleBlur,
        }) => (
          <Form
            onSubmit={handleSubmit}
            noValidate
            className="d-flex flex-column gap-24"
          >
            {/* TABLE */}
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                {" "}
                <FieldArray name="purchaseDetails">
                  {({ remove, push }) => (
                    <Table
                      bordered
                      responsive
                      className="table-form"
                      style={{ minWidth: "800px" }}
                    >
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Date</th>
                          <th>Nature of Purchase</th>
                          <th>Department</th>
                          <th>Program Expense Code</th>
                          <th>Amount</th>
                          {/* <th>Action</th> */}
                        </tr>
                      </thead>

                      <tbody style={{ minWidth: "750px" }}>
                        {values.purchaseDetails.map((_, index) => {
                          // SAFELY access nested errors
                          const rowErrors =
                            (
                              errors.purchaseDetails as FormikErrors<PurchaseDetail>[]
                            )?.[index] || {};

                          const rowTouched =
                            (touched.purchaseDetails as any)?.[index] || {};

                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>

                              {/* DATE */}
                              <td>
                                <CustomDatePicker
                                  value={values.purchaseDetails[index].date}
                                  onChange={(date: Date | null) => {
                                    setFieldValue(
                                      `purchaseDetails[${index}].date`,
                                      date
                                    );
                                    setFieldTouched(
                                      `purchaseDetails[${index}].date`,
                                      true
                                    );
                                  }}
                                  isInvalid={
                                    !!rowErrors.date && rowTouched.date
                                  }
                                />
                                {rowErrors.date && rowTouched.date && (
                                  <div className="text-danger small">
                                    {rowErrors.date}
                                  </div>
                                )}
                              </td>

                              {/* NATURE */}
                              <td>
                                <Field
                                  name={`purchaseDetails[${index}].nature`}
                                  className="form-control border-0 bg-transparent"
                                  placeholder="Nature"
                                />
                                {rowErrors.nature && rowTouched.nature && (
                                  <div className="text-danger small">
                                    {rowErrors.nature}
                                  </div>
                                )}
                              </td>

                              {/* DEPT */}
                              <td>
                                <Field
                                  name={`purchaseDetails[${index}].department`}
                                  className="form-control bg-transparent border-0"
                                  placeholder="Department"
                                />
                                {rowErrors.department &&
                                  rowTouched.department && (
                                    <div className="text-danger small">
                                      {rowErrors.department}
                                    </div>
                                  )}
                              </td>

                              {/* EXP CODE */}
                              <td>
                                <Field
                                  name={`purchaseDetails[${index}].programExpenseCode`}
                                  className="form-control border-0 bg-transparent"
                                  placeholder="Expense Code"
                                />
                                {rowErrors.programExpenseCode &&
                                  rowTouched.programExpenseCode && (
                                    <div className="text-danger small">
                                      {rowErrors.programExpenseCode}
                                    </div>
                                  )}
                              </td>
                              {/* AMOUNT */}
                              <td className="pe-1">
                                <div className="d-flex flex-row align-items-center  h-100 flex-grow-1 justify-content-between">
                                  <div>
                                    {" "}
                                    <Field
                                      name={`purchaseDetails[${index}].amount`}
                                      type="number"
                                      className="form-control border-0 bg-transparent"
                                      placeholder="Amount"
                                    />
                                    {rowErrors.amount && rowTouched.amount && (
                                      <div className="text-danger small">
                                        {rowErrors.amount}
                                      </div>
                                    )}
                                  </div>{" "}
                                  <div className="d-flex gap-1 flex-column">
                                    {values.purchaseDetails.length !== 1 && (
                                      <button
                                        type="button"
                                        className="btn btn-street-primary p-0 d-flex align-items-center justify-content-center rounded-circle"
                                        style={{
                                          width: "22px",
                                          height: "22px",
                                        }}
                                        onClick={() => remove(index)}
                                        disabled={
                                          values.purchaseDetails.length === 1
                                        }
                                      >
                                        <Icon
                                          icon={"mynaui:minus"}
                                          className="text-sm "
                                        />
                                      </button>
                                    )}
                                    {(values.purchaseDetails.length === 1 ||
                                      values.purchaseDetails.length ===
                                        index + 1) && (
                                      <button
                                        className="btn btn-street-primary p-0 d-flex align-items-center justify-content-center rounded-circle"
                                        style={{
                                          width: "22px",
                                          height: "22px",
                                        }}
                                        type="button"
                                        onClick={() =>
                                          push({
                                            date: "",
                                            nature: "",
                                            department: "",
                                            programExpenseCode: "",
                                            amount: "",
                                          })
                                        }
                                      >
                                        <Icon
                                          icon={"tabler:plus"}
                                          className="text-sm"
                                        />
                                      </button>
                                    )}
                                  </div>
                                </div>{" "}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  )}
                </FieldArray>
                <Row className="gy-3 gx-4">
                  {/* Date */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Requested By:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="requestedBy"
                        value={values.requestedBy}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.requestedBy && !!errors.requestedBy}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.requestedBy}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Date:
                      </Form.Label>

                      <CustomDatePicker
                        value={
                          values.requestedDate
                            ? new Date(values.requestedDate)
                            : null
                        }
                        onChange={(date) => {
                          setFieldValue("requestedDate", date, true);
                          setFieldTouched("requestedDate", true, false);
                        }}
                        isInvalid={Boolean(
                          errors.requestedDate && touched.requestedDate
                        )}
                      />

                      {errors.requestedDate && touched.requestedDate && (
                        <div className="invalid-feedback d-block">
                          {String(errors.requestedDate)}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            <button type="submit" className="btn btn-primary w-fit">
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PaymentRequisitionForm;
