import { useCreatePaymentRequistionMutation } from "../../../../../../services/FormApi";
import { showError, showSuccess } from "../../../../../../utills/toastutills";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";
import { useSelector } from "react-redux";
import { selectAuth } from "../../../../../../redux/AuthSlice";
import PaymentRequisitionForm, { type FormValues } from "./form";
import {

  getErrorMessage,
} from "../../../../../../utills/utills";

const PaymentRequisition = () => {
  const { user } = useSelector(selectAuth);
  const [createpayrequest, { isLoading }] =
    useCreatePaymentRequistionMutation();
  const initialValues: FormValues = {
    payeeName: "",
    totalAmount: 0,
    requestedBy: `${user?.firstName} ${user?.lastName}`,
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

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: { resetForm: () => void }
  ) => {
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
          `paymentDetails[${index}][netAmount]`,
          item.netAmount.toString()
        );
        formData.append(`paymentDetails[${index}][hst]`, item.hst.toString());
        formData.append(
          `paymentDetails[${index}][totalAmount]`,
          item.totalAmount.toString()
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
        resetForm();
      }
    } catch (err) {
      showError(getErrorMessage(err));
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
      <PaymentRequisitionForm
        footer={true}
        isEdit={false}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        initialvalues={initialValues}
      />
      <FormSubmissionLoader
        isLoading={isLoading}
        size="lg"
        variant="spinner"
        message="Please Wait"
        subMessage="Processing Your Request Please Wait"
      />
    </div>
  );
};

export default PaymentRequisition;
