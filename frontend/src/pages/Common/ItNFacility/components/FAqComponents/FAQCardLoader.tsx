import { Col } from "react-bootstrap";

interface FAQCardLoaderProps {
  columns?: number;
}

const FAQCardLoader = ({ columns = 2 }: FAQCardLoaderProps) => {
  return (
    <>
      {Array.from({ length: columns }).map((_, idx) => (
        <Col md={6} key={idx}>
          <div className="card h-100">
            <div className="card-body p-16 placeholder-glow d-flex flex-column gap-3">
              {/* Title */}
              <span
                className="placeholder col-6 rounded"
                style={{ height: "18px" }}
              />

              {/* FAQ items */}
              {Array.from({ length: 3 }).map((_, qIdx) => (
                <div key={qIdx} className="p-2 rounded position-relative">
                  <span
                    className="placeholder col-9 rounded mb-2 d-block"
                    style={{ height: "14px" }}
                  />
                  <span
                    className="placeholder col-11 rounded d-block"
                    style={{ height: "12px" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </Col>
      ))}
    </>
  );
};

export default FAQCardLoader;
