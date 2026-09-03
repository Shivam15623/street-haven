import { Icon } from "@iconify/react/dist/iconify.js";

import AddCategory from "./FAqComponents/AddCategory";
import {
  useLazyAllCategoriesQuery,
  useLazyViewEmergencyContactsQuery,
} from "../../../../services/FAQapi";
import AddFaqs from "./FAqComponents/AddFaqs";

import DeleteCategory from "./FAqComponents/DeleteCategory";
import EditQuestion from "./FAqComponents/EditQuestion";
import DeleteQuestion from "./FAqComponents/DeleteQuestion";
import EmergencyContact from "./FAqComponents/ActionContact";
import DeleteEmergencyContact from "./FAqComponents/DeletePhone";
import { Col, Row } from "react-bootstrap";
import useHasPermission from "../../../../hooks/Auth";
import type { AgentTabProp } from "../../AgencyInformation/component/Agreement/CollectiveAgreementTab";
import { useEffect } from "react";
import FAQCardLoader from "./FAqComponents/FAQCardLoader";
import EmergencyContactLoader from "./FAqComponents/EmergencyContactLoader";
import { useSocket } from "../../../../hooks/useSocket";

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

const FAQResourcesTab: React.FC<AgentTabProp> = ({ isActive }) => {
  const { socket } = useSocket();
  const [getCategories, { data, isLoading }] = useLazyAllCategoriesQuery();
  const [getContacts, { data: contacts, isLoading: contactsLoading }] =
    useLazyViewEmergencyContactsQuery();
  useEffect(() => {
    if (isActive) {
      getCategories();
      getContacts();
    }
  }, [isActive, getCategories, getContacts]);
  const { hasPermission } = useHasPermission();
  useEffect(() => {
    if (!socket || !isActive) return;

    socket.emit("join-page-room", "faq_viewers");

    const handleFaqChanged = () => {
      getCategories();
      getContacts();
    };

    socket.on("faq-category-changed", handleFaqChanged);
    socket.on("faq-question-changed", handleFaqChanged);
    socket.on("emergency-contact-changed", handleFaqChanged);

    return () => {
      socket.emit("leave-page-room", "faq_viewers");
      socket.off("faq-category-changed", handleFaqChanged);
      socket.off("faq-question-changed", handleFaqChanged);
      socket.off("emergency-contact-changed", handleFaqChanged);
    };
  }, [socket, isActive, getCategories, getContacts]);

  if (isLoading || contactsLoading) {
    return (
      <div className="d-flex flex-column gap-4 mb-5">
        <Row className="g-3">
          <FAQCardLoader />
        </Row>
        <EmergencyContactLoader />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column gap-4 mb-5">
      {hasPermission({
        action: "create_faq",
      }) && <AddCategory />}

      <Row className="g-3 gy-md-4 gx-md-4">
        {data?.data.map((cat: FAQCard) => (
          <Col md={6} key={cat._id}>
            {" "}
            <div className="card h-100">
              <div className="card-body position-relative d-flex flex-column gap-10 gap-sm-16 gap-md-20 rounded-3 p-16 p-sm-24 h-100">
                {/* Add Questions button */}
                {
                  <div
                    className="position-absolute d-flex flex-row gap-10"
                    style={{ right: 12, top: 12 }}
                  >
                    {hasPermission({
                      action: "create_faq",
                    }) && <AddFaqs title={cat.title} id={cat._id} />}
                    {hasPermission({
                      action: "delete_faq",
                    }) && <DeleteCategory title={cat.title} id={cat._id} />}
                  </div>
                }

                <h5 className="text-md xs:text-lg sm:text-xl mb-0 text-street-dark fw-semibold">
                  {cat.title}
                </h5>

                {cat.faqs.map((faq) => (
                  <div
                    key={faq._id}
                    className="d-flex flex-column w-auto pe-5 gap-1 ps-2 pt-2 pb-2 rounded position-relative faq-item"
                    style={{ transition: "background 0.3s" }}
                  >
                    <h6 className="text-xs xs:text-sm text-street-dark mb-0">
                      {faq.question}
                    </h6>
                    <p className="text-xxs xs:text-xs fw-normal">
                      {faq.answer}
                    </p>

                    {
                      <div className="position-absolute d-flex flex-row gap-2 top-50 end-0 translate-middle-y me-2 edit-icon">
                        {hasPermission({
                          action: "edit_faq",
                        }) && (
                          <EditQuestion
                            cid={cat._id}
                            qid={faq._id}
                            question={faq.question}
                            answer={faq.answer}
                          />
                        )}
                        {hasPermission({
                          action: "delete_faq",
                        }) && (
                          <DeleteQuestion
                            cid={cat._id}
                            qid={faq._id}
                            question={faq.question}
                          />
                        )}
                      </div>
                    }
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
        {hasPermission({
          action: "create_emergency_contact",
        }) && (
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
                <div className="d-flex  flex-row gap-4">
                  <p className="text-xs sm:text-sm text-street-primary fw-medium">
                    {ct.label}:
                    <span className="text-xxs sm:text-xs text-street-primary fw-normal">
                      {ct.phone}
                    </span>
                  </p>
                  {
                    <div className="d-flex flex-row gap-2 align-items-center">
                      {hasPermission({
                        action: "edit_emergency_contact",
                      }) && (
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
                      )}
                      {hasPermission({
                        action: "delete_emergency_contact",
                      }) && (
                        <DeleteEmergencyContact id={ct._id} label={ct.label} />
                      )}
                    </div>
                  }
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
