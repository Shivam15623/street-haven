const HRUpdateCardSkeleton = () => {
  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-14 radius-12 placeholder-glow">
        <div className="d-flex flex-row justify-content-between">
          {/* Content */}
          <div className="d-flex flex-column flex-grow-1 gap-10">
            {/* Title */}
            <span className="placeholder col-6 placeholder-sm" />

            {/* Description */}
            <span className="placeholder col-10 placeholder-xs" />
            <span className="placeholder col-9 placeholder-xs" />
            <span className="placeholder col-7 placeholder-xs" />

            {/* Meta */}
            <div className="d-flex flex-row gap-24 w-50">
              <span className="placeholder col-3 placeholder-xs" />
              <span className="placeholder col-4 placeholder-xs" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRUpdateCardSkeleton;
