import { Icon } from "@iconify/react/dist/iconify.js";

import AddCategory from "./FAqComponents/AddCategory";
import {
  useAllCategoriesQuery,
  useViewEmergencyContactsQuery,
} from "../../../../services/FAQapi";
import AddFaqs from "./FAqComponents/AddFaqs";
import useHasPermission from "../../../../hooks/Auth";
import DeleteCategory from "./FAqComponents/DeleteCategory";
import EditQuestion from "./FAqComponents/EditQuestion";
import DeleteQuestion from "./FAqComponents/DeleteQuestion";
import EmergencyContact from "./FAqComponents/ActionContact";
import DeleteEmergencyContact from "./FAqComponents/DeletePhone";
import { Col, Row } from "react-bootstrap";

interface FAQItem {
  _id: string;
  question: string;
  answer: string;
}

interface FAQCard {
  _id: string;
  title: string;
  faqs: FAQItem[];
}

const FAQResourcesTab = () => {
  const { data } = useAllCategoriesQuery();
  const { data: contacts } = useViewEmergencyContactsQuery();
  const { isAdmin } = useHasPermission();

  return (
    <div className="d-flex flex-column gap-4 mb-5">
      {isAdmin && <AddCategory />}

      <Row className="g-3 gy-md-0 gx-md-4">
        {data?.data.map((cat: FAQCard) => (
          <Col md={6} key={cat._id}>
            {" "}
            <div className="card">
              <div className="card-body position-relative d-flex flex-column gap-10 gap-sm-16 gap-md-20 rounded-3 p-16 p-sm-24">
                {/* Add Questions button */}
                {isAdmin && (
                  <div
                    className="position-absolute d-flex flex-row gap-10"
                    style={{ right: 12, top: 12 }}
                  >
                    <AddFaqs title={cat.title} id={cat._id} />
                    <DeleteCategory title={cat.title} id={cat._id} />
                  </div>
                )}

                <h5 className="text-md xs:text-lg sm:text-xl mb-0 text-street-dark fw-semibold">
                  {cat.title}
                </h5>

                {cat.faqs.map((faq) => (
                  <div
                    key={faq._id}
                    className="d-flex flex-column w-fit pe-5 gap-1 ps-2 pt-2 pb-2 rounded position-relative faq-item"
                    style={{ transition: "background 0.3s" }}
                  >
                    <h6 className="text-xs xs:text-sm text-street-dark mb-0">
                      {faq.question}
                    </h6>
                    <p className="text-xxs xs:text-xs fw-normal">
                      {faq.answer}
                    </p>

                    {isAdmin && (
                      <div className="position-absolute d-flex flex-row gap-2 top-50 end-0 translate-middle-y me-2 edit-icon">
                        <EditQuestion
                          cid={cat._id}
                          qid={faq._id}
                          question={faq.question}
                          answer={faq.answer}
                        />
                        <DeleteQuestion
                          cid={cat._id}
                          qid={faq._id}
                          question={faq.question}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Col>
        ))}
      </Row>

      <div
        className="p-12 position-relative p-sm-16 p-md-24  help-blur rounded-3 "
        style={{ boxShadow: " 0px 0px 10px 0px #00000012" }}
      >
        {isAdmin && (
          <div
            className="position-absolute"
            style={{ top: "12px", right: "12px" }}
          >
            <EmergencyContact
              trigger={
                <button className="btn btn-street-primary p-10  radius-12 d-flex align-items-center text-sm justify-content-center">
                  <Icon icon="mdi:plus" className="text-xl" />
                </button>
              }
            />
          </div>
        )}

        <div className="d-flex flex-row gap-16 gap-sm-20">
          <div className="d-flex justify-content-center bg-street-primary rounded-3 w-40-px h-40-px  p-7 align-items-center">
            <Icon icon="lucide:phone" className="text-white text-xxl" />
          </div>
          <div className="d-flex flex-column gap-13 ">
            <p className="text-xs sm:text-sm text-street-primary fw-medium">
              Emergency Contacts
            </p>
            <div className="d-flex flex-column gap-8 ">
              {contacts?.data.map((ct) => (
                <div className="d-flex flex-row gap-4">
                  <p className="text-xs sm:text-sm text-street-primary fw-medium">
                    {ct.label}:
                    <span className="text-xxs sm:text-xs text-street-primary fw-normal">
                      {ct.phone}
                    </span>
                  </p>
                  {isAdmin && (
                    <div className="d-flex flex-row gap-2 align-items-center">
                      <EmergencyContact
                        id={ct._id}
                        initialData={{ label: ct.label, phone: ct.phone }}
                        trigger={
                          <Icon
                            icon="lucide:pencil"
                            className="text-md icon-street-edit"
                          />
                        }
                      />
                      <DeleteEmergencyContact id={ct._id} label={ct.label} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQResourcesTab;
