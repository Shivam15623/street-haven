import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { Col, Row } from "react-bootstrap";
import RequestForm from "./RequestForm";

const SubmitRequestTab = () => {
  const [active, setActive] = useState(false); // boolean since only one card

  const card = {
    title: "Internet Facilities",
    icon: "hugeicons:computer",
    description: "Computer, software, network, and technical issues",
    requests: [
      "Hardware repairs and replacements",
      "Software installation and updates",
      "Network connectivity issues",
      "Email and system access problems",
    ],
  };

  return (
    <div className="d-flex flex-column gap-4">
      <Row className="g-3 gy-md-0 gx-md-4">
        <Col sm={12}>
          <div
            className={`request-form-card card cursor-pointer`}
            onClick={() => setActive(!active)}
          >
            <div
              className={`card-body p-12 p-sm-24 rounded-3 ${
                active ? "border-sh-primary-1" : ""
              }`}
            >
              <div className="d-flex flex-column gap-16 gap-sm-20">
                <div className="d-flex flex-row align-items-center gap-12">
                  <div className="w-40-px h-40-px req-icon  d-flex align-items-center justify-content-center rounded-3 p-2">
                    <Icon icon={card.icon} className="text-xxl " />
                  </div>
                  <div className="d-flex flex-column gap-1">
                    <p className="text-xs xs:text-sm fw-semibold">
                      {card.title}
                    </p>
                    <p className="text-xxs xs:text-xs fw-normal">
                      {card.description}
                    </p>
                  </div>
                </div>

                <div className="d-flex flex-column gap-1 gap-sm-8">
                  <p className="text-xs xs:text-sm fw-normal">
                    Common requests:
                  </p>
                  <ul
                    className="gap-1 gap-sm-8 d-flex text-xs xs:text-sm text-street-dark flex-column"
                    style={{
                      listStyleType: "disc",
                      paddingLeft: "20px",
                    }}
                  >
                    {card.requests.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* FORM SECTION */}
      {active && (
        <div>
          <RequestForm onCancel={() => setActive(false)} />
        </div>
      )}
    </div>
  );
};

export default SubmitRequestTab;
