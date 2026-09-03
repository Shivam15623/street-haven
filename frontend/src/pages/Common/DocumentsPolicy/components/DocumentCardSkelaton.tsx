import { Col } from "react-bootstrap";

const DocumentCardSkeleton = () => {
  return (
    <Col lg={4} md={6}>
      <div className="card h-100">
        <div className="p-16 p-sm-20 p-md-24 card-body d-flex flex-column justify-content-between rounded-2 placeholder-glow">
          
          {/* Top Content */}
          <div className="d-flex flex-column gap-10 gap-sm-12">
            
            {/* Icon */}
            <div className="d-flex align-items-center justify-content-center rounded-3 p-2 w-48-px h-48-px">
              <span className="placeholder col-6 h-100 rounded-3 w-100"></span>
            </div>

            {/* Title + Description */}
            <div className="d-flex flex-column gap-2">
              <span className="placeholder col-6 placeholder-sm"></span>
              <span className="placeholder col-12 placeholder-xs"></span>
              <span className="placeholder col-10 placeholder-xs"></span>
            </div>

            {/* Tags */}
            <div className="d-flex flex-row gap-8 gap-sm-10">
              <span className="placeholder col-3 rounded-pill"></span>
              <span className="placeholder col-2 rounded-pill"></span>
              <span className="placeholder col-3 rounded-pill"></span>
            </div>

            {/* Category */}
            <div>
              <span className="placeholder col-3 rounded-pill"></span>
            </div>
          </div>

          {/* Footer */}
          <div className="d-flex flex-row justify-content-between align-items-center mt-3">
            <span className="placeholder col-5 placeholder-xs"></span>

            <div className="d-flex flex-row gap-8 gap-sm-12">
              <span className="placeholder btn col-4 rounded-3"></span>
              <span className="placeholder btn col-5 rounded-3"></span>
            </div>
          </div>

        </div>
      </div>
    </Col>
  );
};

export default DocumentCardSkeleton;
