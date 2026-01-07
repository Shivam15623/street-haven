const CollectiveAgreementCardSkeleton = () => {
  return (
    <div className="card">
      <div className="card-body p-16 p-sm-20 p-md-24 d-flex flex-column gap-20 radius-12 placeholder-glow">
        <div className="d-flex flex-row justify-content-between align-items-center">
          {/* Left */}
          <div className="d-flex flex-row gap-12 gap-sm-20 align-items-center">
            {/* Icon */}
            <span
              className="placeholder rounded-3"
              style={{ width: 40, height: 40 }}
            />

            {/* Title + meta */}
            <div className="d-flex flex-column gap-10">
              <span
                className="placeholder col-6 placeholder-sm"
                style={{ width: "405px" }}
              />
              <div className="d-flex flex-row gap-2">
                <span className="placeholder col-2 placeholder-xs" />
                <span className="placeholder col-2 placeholder-xs" />
                <span className="placeholder col-3 placeholder-xs" />
              </div>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="d-none d-sm-flex flex-row gap-6 gap-sm-12">
            <span
              className="placeholder   rounded-3"
              style={{ width: 40, height: 40 }}
            />
            <span
              className="placeholder   rounded-3"
              style={{ width: 40, height: 40 }}
            />
            <span
              className="placeholder  rounded-3"
              style={{ width: 40, height: 40 }}
            />
          
          </div>
        </div>

        {/* Mobile actions */}
        <hr className="d-sm-none d-block" />
        <div className="d-flex d-sm-none flex-row justify-content-end gap-8">
          <span className="placeholder  col-2 rounded-3" />
          <span className="placeholder  col-2 rounded-3" />
          <span className="placeholder  col-2 rounded-3" />
          <span className="placeholder  col-3 rounded-3" />
        </div>
      </div>
    </div>
  );
};

export default CollectiveAgreementCardSkeleton;
