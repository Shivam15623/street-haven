import React from "react";

const EventCardSkeleton: React.FC = () => {
  return (
    <div className="card  rounded-2">
      <div
        className="card-body p-16 p-md-24 border-2  rounded-2"
        style={{ borderColor: "rgb(170, 170, 170)" }}
      >
        {/* Title + CTA */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="w-50">
            <span className="placeholder col-8 placeholder-glow"></span>
            <div className="mt-2">
              <span className="placeholder col-10 placeholder-glow"></span>
            </div>
          </div>
          <div className="d-flex gap-2">
            <span className="placeholder btn btn-sm col-3"></span>
            <span className="placeholder btn btn-sm col-3"></span>
          </div>
        </div>

        {/* Event details */}
        <div className="p-8 p-md-16 rounded bg-event-details mb-3">
          <div className="row g-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="col-6 col-md-4">
                <span className="placeholder col-6 mb-2"></span>
                <span className="placeholder col-8"></span>
                <div className="mt-1">
                  <span className="placeholder col-5"></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="d-flex align-items-center gap-3">
          <span className="placeholder col-3"></span>
          <div className="progress w-100" style={{ height: "6px" }}>
            <div
              className="progress-bar placeholder-glow"
              style={{ width: "60%" }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCardSkeleton;
