import {
  Field,
  FieldArray,
  Formik,
  type FormikErrors,
  type FormikProps,
  type FormikTouched,
} from "formik";
import { Card, Col, Form, Row } from "react-bootstrap";
import * as Yup from "yup";
import CustomDatePicker from "../../../../../../components/child/DatePicker";
import { Icon } from "@iconify/react/dist/iconify.js";

import { useEffect } from "react";

import { handleDownload } from "../../../../../../utills/handleDownload";

import FileField from "../../../../../../components/child/FileField";
interface PurchaseDetail {
  date: Date | null;
  nature: string;
  program: string;
  expenseCode: string;
  netAmount: number;
  hst: number;
  totalAmount: number;
}
export interface FormValues {
  payeeName: string;
  totalAmount: number;
  requestedBy: string;
  requestedDate: Date | null;
  approvedBy: string;
  approvedDate: Date | null;
  purchaseDetails: PurchaseDetail[];
  invoices: File | null;
}
interface FormProp {
  footer: boolean;
  isEdit: boolean;
  invoice?: {
    fileName: string;
    fileType: string;
    fileUrl: string;
  };
  isLoading: boolean;
  initialvalues: FormValues;
  id?: string;
  handleSubmit: (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => void;
}
// --------------------
// SCHEMA
// --------------------
const getFormSchema = (isEdit: boolean) =>
  Yup.object({
    payeeName: Yup.string().required("Payee Name is required"),
    totalAmount: Yup.number(),

    requestedBy: Yup.string().required("Requested By Name is required"),
    requestedDate: Yup.date()
      .nullable()
      .required("Requested Date is required")
      .test(
        "not-future-date",
        "Date of Request cannot be in the future",
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

    approvedBy: Yup.string().required("Approved By Name is required"),
    approvedDate: Yup.date()
      .nullable()
      .required("Approved Date is required")
      .test(
        "not-future-date",
        "Date of Request cannot be in the future",
        (val) => {
          if (!val) return true;
          const today = new Date();
          const selected = new Date(val);
          // ignore time when comparing
          selected.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          return selected <= today;
        }
      )
      .min(
        Yup.ref("requestedDate"),
        "approved date cant be earlier then Date of Request"
      ),

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

    invoices: isEdit
      ? Yup.mixed<File>()
          .nullable()
          .test("fileSize", "File size must be less than 16MB", (value) => {
            if (!value) return true;
            return value.size <= 16 * 1024 * 1024;
          })
      : Yup.mixed<File>()
          .required("Invoice is required")
          .test("fileSize", "File size must be less than 16MB", (value) => {
            if (!value) return true;
            return value.size <= 16 * 1024 * 1024;
          }),
  });

function GrandTotalUpdater({
  values,
  setFieldValue,
}: Pick<FormikProps<FormValues>, "values" | "setFieldValue">) {
  useEffect(() => {
    const total = values.purchaseDetails.reduce(
      (sum, item) => sum + Number(item.totalAmount || 0),
      0
    );

    setFieldValue("totalAmount", total);
  }, [values.purchaseDetails, setFieldValue]);

  return null; // no UI
}
const PaymentRequisitionForm: React.FC<FormProp> = ({
  footer,
  handleSubmit,
  initialvalues,
  isLoading,
  id,
  isEdit,
  invoice,
}) => {
  return (
    <Formik
      validationSchema={getFormSchema(isEdit)}
      initialValues={initialvalues}
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
      }) => {
        return (
          <Form
            onSubmit={handleSubmit}
            noValidate
            id={id ? id : "paymentRequisitionForm"}
            className="d-flex flex-column gap-24"
          >
            <GrandTotalUpdater values={values} setFieldValue={setFieldValue} />
            {/* TABLE */}
            <Card className="shadow-sm border-0">
              <Card.Body className="d-flex flex-column gap-16 p-20">
                <Row className="gy-3 gx-4">
                  {/* PAYEE NAME */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Payee Name: <span className="text-danger">*</span>
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
                        Total Amount: <span className="text-danger">*</span>
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
                    <>
                      <div
                        className="d-flex flex-column gap-3 d-md-none p-8"
                        style={{ backgroundColor: "var(--street-bg-f2)" }}
                      >
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
                            <Card className="mb-3" key={index}>
                              <Card.Body className="p-3">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <strong>Item #{index + 1}</strong>

                                  <div className="d-flex gap-2">
                                    {values.purchaseDetails.length > 1 && (
                                      <button
                                        type="button"
                                        style={{
                                          width: "30px",
                                          height: "30px",
                                        }}
                                        className="btn btn-danger btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                                        onClick={() => remove(index)}
                                      >
                                        <Icon icon="mynaui:minus" />
                                      </button>
                                    )}

                                 
                                  </div>
                                </div>

                                {/* DATE */}
                                <div className="mb-3">
                                  <label className="form-label mb-2">
                                    Date
                                  </label>
                                  <CustomDatePicker
                                    value={row.date}
                                    onChange={(date) =>
                                      setFieldValue(
                                        `purchaseDetails[${index}].date`,
                                        date
                                      )
                                    }
                                  />
                                  {rowTouched.date && rowErrors.date && (
                                    <div className="text-danger small">
                                      {String(rowErrors.date)}
                                    </div>
                                  )}
                                </div>

                                {/* NATURE */}
                                <div className="row gx-3 gy-0">
                                  {" "}
                                  <div className="mb-3 col-6">
                                    <label className="form-label mb-2">
                                      Nature
                                    </label>
                                    <Field
                                      name={`purchaseDetails[${index}].nature`}
                                      className="form-control"
                                      placeholder="Nature"
                                    />
                                  </div>
                                  {/* PROGRAM */}
                                  <div className="mb-3 col-6">
                                    <label className="form-label mb-2">
                                      Program
                                    </label>
                                    <Field
                                      name={`purchaseDetails[${index}].program`}
                                      className="form-control"
                                      placeholder="Program"
                                    />
                                  </div>
                                </div>

                                {/* EXPENSE CODE */}
                                <div className="mb-3">
                                  <label className="form-label mb-2">
                                    Expense Code
                                  </label>
                                  <Field
                                    name={`purchaseDetails[${index}].expenseCode`}
                                    className="form-control"
                                    placeholder="Expense Code"
                                  />
                                </div>
                                <div className="row gx-3 gy-0 mb-3">
                                  {/* NET AMOUNT */}
                                  <div className="col-6">
                                    <label className="form-label mb-2">
                                      Net Amount
                                    </label>
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
                                  </div>

                                  {/* HST */}
                                  <div className="col-6">
                                    <label className="form-label mb-2">
                                      HST
                                    </label>
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
                                          values.purchaseDetails[index]
                                            .netAmount
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
                                  </div>
                                </div>

                                {/* TOTAL */}
                                <div className="mb-2">
                                  <label className="form-label">Total</label>
                                  <Form.Control
                                    disabled
                                    value={
                                      values.purchaseDetails[index].totalAmount
                                    }
                                  />
                                </div>
                              </Card.Body>
                            </Card>
                          );
                        })}

                        <button
                          className="btn btn-street-outline-primary w-100 d-flex flex-row align-items-center gap-2 radius-8 justify-content-center"
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
                          <Icon icon={"mynaui:plus"} width={18} height={18} />
                          Add
                        </button>
                      </div>
                      <table
                        className="table bordered-table mb-0 d-none d-md-block table-hover align-middle"
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
                    </>
                  )}
                </FieldArray>
                <Row className="gy-3 gx-4">
                  {/* Date */}
                  <Col xs={12} md={6}>
                    <Form.Group className="d-flex flex-column gap-8">
                      <Form.Label className="text-xs xs:text-sm fw-medium text-street-dark">
                        Requested By: <span className="text-danger">*</span>
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
                        Date: <span className="text-danger">*</span>
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
                        Approved By: <span className="text-danger">*</span>
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
                        Date: <span className="text-danger">*</span>
                      </Form.Label>

                      <CustomDatePicker
                        value={
                          values.approvedDate
                            ? new Date(values.approvedDate)
                            : null
                        }
                        onChange={(date) => {
                          setFieldValue("approvedDate", date, true);
                          setFieldTouched("approvedDate", true, false);
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
                <FileField
                  name={"invoices"}
                  fieldLabel="Invoice"
                  isEdit={isEdit}
                  existingFile={
                    isEdit && invoice
                      ? { fileName: invoice.fileName, fileUrl: invoice.fileUrl }
                      : undefined
                  }
                />
              </Card.Body>
            </Card>
            {footer === true && (
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
            )}
          </Form>
        );
      }}
    </Formik>
  );
};

export default PaymentRequisitionForm;
