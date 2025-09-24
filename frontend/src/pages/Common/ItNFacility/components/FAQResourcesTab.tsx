import { Icon } from "@iconify/react/dist/iconify.js";

import { Col, Row } from "react-bootstrap";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQCard {
  title: string;
  faqs: FAQItem[];
}

const FAQResourcesTab = () => {
  // Data for cards
  const faqCards: FAQCard[] = [
    {
      title: "IT Help Desk Request",
      faqs: [
        {
          question: "How do I reset my password?",
          answer:
            "Contact IT support or use the self-service portal on the intranet.",
        },
        {
          question: "WiFi not working?",
          answer:
            "Try disconnecting and reconnecting. If issue persists, submit a ticket.",
        },
        {
          question: "Software installation requests?",
          answer:
            "Submit a detailed ticket including software name and business justification.",
        },
        {
          question: "Email issues?",
          answer:
            "Check your internet connection first. For account access issues, contact IT support. ",
        },
      ],
    },
    {
      title: "Facilities FAQ",
      faqs: [
        {
          question: "Emergency maintenance?",
          answer:
            "For urgent issues affecting safety, call (555) 123-4574 directly.",
        },
        {
          question: "Key or lock issues?",
          answer:
            "Submit a high-priority ticket with your location and key number if available.",
        },
        {
          question: "HVAC problems?",
          answer:
            "Report temperature issues with specific location and preferred temperature range.",
        },
        {
          question: "Office supplies or furniture?",
          answer:
            "Submit a request with specific items needed and business justification.",
        },
      ],
    },
  ];

  return (
    <div className="d-flex flex-column gap-4 mb-5">
      <Row className="g-3 gy-md-0  gx-md-4">
        {faqCards.map((card, idx) => (
          <Col md={6} key={idx}>
            <div className="card">
              <div className="card-body  d-flex flex-column gap-10 gap-sm-16 gap-md-20 rounded-3 p-16 p-sm-24">
                <h5 className="text-md xs:text-lg sm:text-xl mb-0 text-street-dark fw-semibold ">
                  {card.title}
                </h5>

                {card.faqs.map((faq, i) => (
                  <div className="d-flex flex-column gap-1" key={i}>
                    <h6 className="text-xs xs:text-sm text-street-dark mb-0">
                      {faq.question}
                    </h6>
                    <p className="text-xxs xs:text-xs fw-normal">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        ))}
      </Row>
      <div
        className="p-12 p-sm-16 p-md-24  help-blur rounded-3 "
        style={{ boxShadow: " 0px 0px 10px 0px #00000012" }}
      >
        <div className="d-flex flex-row gap-16 gap-sm-20">
          <div className="d-flex justify-content-center bg-street-primary rounded-3 w-40-px h-40-px  p-7 align-items-center">
            <Icon icon="lucide:phone" className="text-white text-xxl" />
          </div>
          <div className="d-flex flex-column gap-13 ">
            <p className="text-xs sm:text-sm text-street-primary fw-medium">
              Emergency Contacts
            </p>
            <div className="d-flex flex-column gap-8 ">
              <p className="text-xs sm:text-sm text-street-primary fw-medium">
                IT Emergency:
                <span className="text-xxs sm:text-xs text-street-primary fw-normal">
                  (555) 123-4567 x999
                </span>
              </p>
              <p className="text-xs sm:text-sm text-street-primary fw-medium">
                Facilities Emergency:
                <span className="text-xxs sm:text-xs text-street-primary fw-normal">
                  (555) 123-4574
                </span>
              </p>
              <p className="text-xs sm:text-sm text-street-primary fw-medium">
                After Hours:
                <span className="text-xxs sm:text-xs text-street-primary fw-normal">
                  (555) 123-4500
                </span>
              </p><p className="text-xs sm:text-sm text-street-primary fw-medium">
                Security Issues:
                <span className="text-xxs sm:text-xs text-street-primary fw-normal">
                  (555) 123-4580
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQResourcesTab;
