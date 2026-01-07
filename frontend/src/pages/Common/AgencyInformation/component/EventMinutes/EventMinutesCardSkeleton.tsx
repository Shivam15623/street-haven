const MeetingMinutesCardSkeleton = () => {
  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-13 radius-12 placeholder-glow">
        {/* Header */}
        <div className="d-flex flex-column flex-sm-row justify-content-between  align-items-start align-items-sm-center gap-12">
          <div className="d-flex flex-column gap-10 w-75">
            {/* Title */}
            <span className="placeholder col-6 placeholder-sm"></span>

            {/* Meta row */}
            <div className="d-flex flex-row flex-wrap gap-10 gap-sm-24">
              <span className="placeholder col-3 placeholder-xs"></span>
              <span className="placeholder col-3 placeholder-xs"></span>
              <span className="placeholder col-2 placeholder-xs"></span>
              <span className="placeholder col-2 placeholder-xs"></span>
            </div>
          </div>

          {/* Actions (desktop) */}
        </div>

        {/* Key Topics */}
        <div className="d-flex flex-column gap-10">
          <span className="placeholder col-3 placeholder-xs"></span>
          <div className="d-flex flex-row flex-wrap gap-13 w-50">
            <span className="placeholder col-2 rounded-pill"></span>
            <span className="placeholder col-3 rounded-pill"></span>
            <span className="placeholder col-2 rounded-pill"></span>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="d-flex flex-column gap-6 gap-sm-10">
          <span className="placeholder col-3 placeholder-xs"></span>
          <ul style={{ paddingLeft: "20px" }}>
            <li className="placeholder col-10 placeholder-xs"></li>
            <li className="placeholder col-9 placeholder-xs"></li>
            <li className="placeholder col-8 placeholder-xs"></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MeetingMinutesCardSkeleton;
