import { useEffect, useState } from "react";

import { Icon } from "@iconify/react/dist/iconify.js";
import dayjs from "dayjs";
import { Col, Container, Row } from "react-bootstrap";
import {
  useLazyGetPaymentRequisitionByIdQuery,
  type PaymentRequisition,
} from "../../../../../../services/FormApi";
import ModalWrapper from "../../../../../../components/child/ModalWrapper";
import Badge from "../../../../../../components/child/Badge";
import FileViewer from "../../../../../../components/FileViewer/FileViewer";
import FormSubmissionLoader from "../../../../../../components/child/FormSubmissionLoader";

const PaymentRequisitionDetail = ({
  detail,
}: {
  detail: PaymentRequisition;
}) => {
  const [showModal, setShowModal] = useState(false);

  const [
    getPayment,
    { data: response, isLoading: isfetching, isFetching: isReFetching },
  ] = useLazyGetPaymentRequisitionByIdQuery();
  useEffect(() => {
    if (showModal) {
      getPayment({ id: detail._id });
    }
  }, [showModal, getPayment, detail._id]);
  const loading = isfetching || isReFetching;
  const data = response?.data;
  const [openFile, setOpenFile] = useState(false);
  return (
    <>
      <button
        className="btn btn-street-primary d-flex text-sm flex-row align-items-center justify-content-center radius-12 gap-2"
        onClick={() => setShowModal(true)}
      >
        View Details
      </button>

      <ModalWrapper
        show={showModal}
        title="Payment Requisition Details"
        size="lg"
        headerClassName="text-xl p-0 pb-20 text-street-dark"
        className="p-20 p-sm-24 p-md-32 gap-16 gap-sm-20"
        bodyClassName="p-0 d-flex flex-column gap-16 gap-sm-20"
        footerClassName="pt-16 pt-sm-20 px-0 pb-0"
        onHide={() => setShowModal(false)}
        isLoading={loading}
        ModalLoader={
          <FormSubmissionLoader
            isLoading={loading}
            variant="spinner"
            size="lg"
            message={"Loading Data..."}
          />
        }
      >
        {data && !loading && (
          <Container className="d-flex flex-column gap-24 animate-fade-in">
            <div className="p-16 border rounded-3 border-sh-primary-50 bg-street-primary-10 ">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <Icon
                    icon="lucide:dollar-sign"
                    fontSize={24}
                    className=" text-street-primary"
                  />
                  <span className="text-sm fw-medium text-street-base">
                    Total Amount
                  </span>
                </div>
                <span className="text-2xl fw-bold text-street-primary">
                  $
                  {data.totalAmount.toLocaleString("en-CA", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>{" "}
            <Row className="g-3">
              <Col md={6}>
                <div className="p-16 card border h-100">
                  <div className="card-body p-0">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Icon
                        fontSize={18}
                        icon="lucide:user"
                        className="text-street-base"
                      />
                      <span className="text-sm text-street-base fw-medium">
                        Requested By
                      </span>
                    </div>

                    <p className="fw-semibold text-md">{data.requestedBy}</p>

                    <p className="text-sm text-street-base d-flex align-items-center gap-1 mt-1">
                      <Icon icon="lucide:calendar" fontSize={14} />
                      <span>
                        {dayjs(data.requestedDate).format("DD MMMM YYYY")}
                      </span>
                    </p>
                  </div>
                </div>
              </Col>

              <Col md={6}>
                <div className="p-16 card border h-100">
                  <div className="card-body p-0">
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <Icon
                        fontSize={18}
                        icon="lucide:user"
                        className="text-street-base"
                      />
                      <span className="text-sm text-street-base fw-medium">
                        Approved By
                      </span>
                    </div>

                    <p className="fw-semibold text-md">{data.approvedBy}</p>

                    <p className="text-sm text-street-base d-flex align-items-center gap-1 mt-1">
                      <Icon icon="lucide:calendar" fontSize={14} />
                      <span>
                        {dayjs(data.approvedDate).format("DD MMMM YYYY")}
                      </span>
                    </p>
                  </div>
                </div>
              </Col>
            </Row>
            <div className="p-16 card border h-100">
              <div className="card-body p-0">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <Icon
                    fontSize={18}
                    icon="lucide:building"
                    className="text-street-base"
                  />
                  <span className="text-sm text-street-base fw-medium">
                    Payee
                  </span>
                </div>

                <p className="fw-semibold text-street-dark text-lg">
                  {data.payeeName}
                </p>

                <div className="d-flex align-items-center gap-2 mt-8">
                  <Icon icon="lucide:paperclip" fontSize={18} />
                  <span
                    onClick={() => setOpenFile(true)}
                    className="text-sm text-street-primary hover-text-primary cursor-pointer"
                  >
                    {data.invoiceAttachment.fileName}
                  </span>
                </div>
              </div>
            </div>
            <div className=" d-flex flex-column gap-16">
              <hr className="bg-street-base" />
              <h3 className="text-sm fw-semibold  d-flex align-items-center gap-2">
                <Icon icon="lucide:file-text" fontSize={18} />
                Purchase Details ({data.paymentDetails.length})
              </h3>
              {data.paymentDetails.map((p) => (
                <div className="bg-neutral-50 border-sh-base-1-2 rounded-3 shadow-none card p-16">
                  <div className="card-body p-0">
                    <div className="d-flex flex-row align-items-start justify-content-between">
                      <span className="text-md text-street-dark fw-semibold">
                        {p.purchaseNature}
                      </span>
                      <Badge variant="primary-soft"> {p.expenseCode}</Badge>
                    </div>
                    <div className="mt-2 text-sm text-street-base">
                      {" "}
                      {dayjs(p.purchaseDate).format("DD MMMM YYYY")}
                    </div>
                    <div className="mt-3  text-sm text-street-base">
                      {" "}
                      {p.program}
                    </div>
                    <hr className="mt-2" />
                    <div className="row g-3 mt-2">
                      <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-1">
                        <span className="text-street-base text-xs">Net</span>
                        <span className="text-street-dark text-md fw-semibold">
                          ${p.netAmount}
                        </span>
                      </div>
                      <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-1">
                        <span className="text-street-base text-xs">HST</span>
                        <span className="text-street-dark text-md fw-semibold">
                          {" "}
                          ${p.hst}
                        </span>
                      </div>
                      <div className="col-12 col-sm-6 col-md-4 d-flex flex-column gap-1">
                        <span className="text-street-base text-xs">Total</span>
                        <span className="text-street-primary text-md fw-semibold">
                          ${p.totalAmount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        )}

        {!loading && data && openFile && (
          <FileViewer
            files={[
              {
                _id: "1",
                fileName: data.invoiceAttachment.fileName,
                fileUrl: data.invoiceAttachment.fileUrl,
                fileType: data.invoiceAttachment.fileType,
              },
            ]}
            open={openFile}
            onOpenChange={setOpenFile}
          />
        )}
      </ModalWrapper>
    </>
  );
};

export default PaymentRequisitionDetail;
