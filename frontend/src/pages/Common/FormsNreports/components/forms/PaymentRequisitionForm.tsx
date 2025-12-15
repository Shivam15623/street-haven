import {
  Field,
  FieldArray,
  Formik,
  type FormikErrors,
  type FormikTouched,
} from "formik";
import { Card, Col, Form, Row } from "react-bootstrap";
import * as Yup from "yup";
import CustomDatePicker from "../../../../../components/child/DatePicker";
import { Icon } from "@iconify/react/dist/iconify.js";
import PdfUploader from "../../../../../components/child/PdfUploader";
import { useCreatePaymentRequistionMutation } from "../../../../../services/FormApi";
import { showSuccess } from "../../../../../utills/toastutills";

// --------------------
// TYPES
// --------------------
interface PurchaseDetail {
  date: Date | null;
  nature: string;
  program: string;
  expenseCode: string;
  netAmount: number;
  hst: number;
  totalAmount: number;
}

interface FormValues {
  payeeName: string;
  totalAmount: string;
  requestedBy: string;
  requestedDate: Date | null;
  approvedBy: string;
  approvedDate: Date | null;
  purchaseDetails: PurchaseDetail[];
  invoices: File | null;
}

// --------------------
// SCHEMA
// --------------------
const FormSchema = Yup.object({
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

const PaymentRequisitionForm = () => {
  const [createpayrequest, { isLoading }] =
    useCreatePaymentRequistionMutation();
  const initialValues: FormValues = {
    payeeName: "",
    totalAmount: "",
    requestedBy: "",
    requestedDate: new Date(),
    approvedBy: "",
    approvedDate: new Date(),
    invoices: null,
    purchaseDetails: [
      {
        date: null,
        nature: "",
        program: "",
        expenseCode: "",
        netAmount: 0,
        totalAmount: 0,
        hst: 0,
      },
    ],
  };
  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file");

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(blobUrl); // Free memory
    } catch (err) {
      console.error("Download failed:", err);
    }
  };
  const handleSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData();

      // ---------- BASIC FIELDS ----------
      formData.append("payeeName", values.payeeName);
      formData.append("requestedBy", values.requestedBy);
      formData.append("approvedBy", values.approvedBy);

      formData.append(
        "requestedDate",
        values.requestedDate ? values.requestedDate.toISOString() : ""
      );

      formData.append(
        "approvedDate",
        values.approvedDate ? values.approvedDate.toISOString() : ""
      );

      // ---------- PURCHASE DETAILS ----------
      values.purchaseDetails.forEach((item, index) => {
        formData.append(
          `paymentDetails[${index}][purchaseDate]`,
          item.date ? item.date.toISOString() : ""
        );
        formData.append(
          `paymentDetails[${index}][purchaseNature]`,
          item.nature
        );
        formData.append(`paymentDetails[${index}][program]`, item.program);
        formData.append(
          `paymentDetails[${index}][expenseCode]`,
          item.expenseCode
        );
        formData.append(
          `paymentDetails[${index}][amount]`,
          item.netAmount.toString()
        );
      });

      // ---------- INVOICE PDF ----------
      if (values.invoices instanceof File) {
        formData.append("invoiceAttachment", values.invoices); // must match multer field name
      }

      // ---------- API CALL ----------
      const response = await createpayrequest(formData).unwrap();

      if (response.success) {
        showSuccess(response.message);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="d-flex flex-column gap-24 ">
      <div className="card">
        <div className="card-body d-flex flex-row gap-20 align-items-center">
          <img src="/assets/images/shForm.png" width={144} height={113} />
          <div className="d-flex flex-column">
            <h4 className="text-xxl sm:text-xl text-street-dark fw-semibold mb-2">
              Payment Requisition Form
            </h4>
            <p className="text-md text-street-dark fw-semibold">
              Thank you for visiting Street Haven. We value all our clients and
              strive to meet everyone’s needs.
            </p>
          </div>
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
                <Row className="gy-3 gx-4">
                  {/* PAYEE NAME */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Payee Name:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="payeeName"
                        value={values.payeeName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.payeeName && !!errors.payeeName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.payeeName}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>

                  {/* TOTAL AMOUNT */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Total Amount:
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="totalAmount"
                        disabled
                        value={values.totalAmount}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.totalAmount && !!errors.totalAmount}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.totalAmount}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                {" "}
                <FieldArray name="purchaseDetails">
                  {({ remove, push }) => (
                    <table
                      className="table bordered-table mb-0 table-hover align-middle"
                      // className="table-form"
                      style={{ minWidth: "900px" }}
                    >
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Date</th>
                          <th>Nature</th>
                          <th>Program</th>
                          <th>Expense Code</th>
                          <th>Net Amount</th>
                          <th>HST</th>
                          <th>Total</th>
                          <th>Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {values.purchaseDetails.map((row, index) => {
                          const rowErrors =
                            (
                              errors.purchaseDetails as FormikErrors<PurchaseDetail>[]
                            )?.[index] || {};
                          const rowTouched =
                            (
                              touched.purchaseDetails as FormikTouched<PurchaseDetail>[]
                            )?.[index] || {};

                          return (
                            <tr key={index}>
                              <td>{index + 1}</td>

                              {/* DATE */}
                              <td>
                                <CustomDatePicker
                                  value={row.date}
                                  onChange={(date) => {
                                    setFieldValue(
                                      `purchaseDetails[${index}].date`,
                                      date
                                    );
                                  }}
                                  isInvalid={
                                    rowTouched.date && !!rowErrors.date
                                  }
                                />
                                {rowTouched.date && rowErrors.date && (
                                  <div className="text-danger small">
                                    {String(rowErrors.date)}
                                  </div>
                                )}
                              </td>

                              {/* NATURE */}
                              <td>
                                <Field
                                  name={`purchaseDetails[${index}].nature`}
                                  className="form-control"
                                  placeholder="Nature"
                                />
                              </td>

                              {/* PROGRAM */}
                              <td>
                                <Field
                                  name={`purchaseDetails[${index}].program`}
                                  className="form-control"
                                  placeholder="Program"
                                />
                              </td>

                              {/* EXPENSE CODE */}
                              <td>
                                <Field
                                  name={`purchaseDetails[${index}].expenseCode`}
                                  className="form-control"
                                  placeholder="Expense Code"
                                />
                              </td>

                              {/* NET AMOUNT */}
                              <td>
                                <Field
                                  name={`purchaseDetails[${index}].netAmount`}
                                  type="number"
                                  className="form-control"
                                  placeholder="Net Amount"
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const amount = Number(e.target.value);
                                    const hst = Number(
                                      values.purchaseDetails[index].hst
                                    );
                                    setFieldValue(
                                      `purchaseDetails[${index}].netAmount`,
                                      amount
                                    );
                                    setFieldValue(
                                      `purchaseDetails[${index}].totalAmount`,
                                      amount + hst
                                    );
                                  }}
                                />
                              </td>

                              {/* HST */}
                              <td>
                                <Field
                                  name={`purchaseDetails[${index}].hst`}
                                  type="number"
                                  className="form-control"
                                  placeholder="HST"
                                  onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                  ) => {
                                    const hst = Number(e.target.value);
                                    const amount = Number(
                                      values.purchaseDetails[index].netAmount
                                    );
                                    setFieldValue(
                                      `purchaseDetails[${index}].hst`,
                                      hst
                                    );
                                    setFieldValue(
                                      `purchaseDetails[${index}].totalAmount`,
                                      amount + hst
                                    );
                                  }}
                                />
                              </td>

                              {/* TOTAL */}
                              <td>
                                <Form.Control
                                  disabled
                                  value={
                                    values.purchaseDetails[index].totalAmount
                                  }
                                />
                              </td>

                              {/* ACTION */}
                              <td>
                                <div className="d-flex flex-column gap-1 align-items-end justify-content-end">
                                  {values.purchaseDetails.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-street-primary p-0 d-flex align-items-center justify-content-center rounded-circle"
                                      style={{
                                        width: "22px",
                                        height: "22px",
                                      }}
                                      onClick={() => remove(index)}
                                    >
                                      <Icon
                                        icon={"mynaui:minus"}
                                        className="text-sm "
                                      />
                                    </button>
                                  )}

                                  {index ===
                                    values.purchaseDetails.length - 1 && (
                                    <button
                                      type="button"
                                      className="btn btn-street-primary p-0 d-flex align-items-center justify-content-center rounded-circle"
                                      style={{
                                        width: "22px",
                                        height: "22px",
                                      }}
                                      onClick={() =>
                                        push({
                                          date: null,
                                          nature: "",
                                          program: "",
                                          expenseCode: "",
                                          netAmount: 0,
                                          hst: 0,
                                          totalAmount: 0,
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
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
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
                <Row className="gy-3 gx-4">
                  {/* Date */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Approved By:
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="approvedBy"
                        value={values.approvedBy}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="text-xs xs:text-sm"
                        isInvalid={touched.approvedBy && !!errors.approvedBy}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.approvedBy}
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
                          values.approvedDate
                            ? new Date(values.approvedDate)
                            : null
                        }
                        onChange={(date) => {
                          setFieldValue("requestedDate", date, true);
                          setFieldTouched("requestedDate", true, false);
                        }}
                        isInvalid={Boolean(
                          errors.approvedDate && touched.approvedDate
                        )}
                      />

                      {errors.approvedDate && touched.approvedDate && (
                        <div className="invalid-feedback d-block">
                          {String(errors.approvedDate)}
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                {" "}
                <PdfUploader name={"invoices"} label={"Invoices:"} />
              </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-row justify-content-end gap-10 p-20">
                <button
                  type="button"
                  onClick={() =>
                    handleDownload(
                      "https://res.cloudinary.com/dskzp8jlm/image/upload/v1764756165/Payment_Requisation_Form_xihfsq.pdf",
                      "Payment Requisition Form"
                    )
                  }
                  className="btn btn-street-lg btn-street-outline-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                >
                  Download
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-street-lg btn-street-primary d-flex flex-row align-items-center radius-12 justify-content-center text-sm"
                >
                  {isLoading ? "Submitting..." : "Submit"}
                </button>
              </Card.Body>
            </Card>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default PaymentRequisitionForm;
