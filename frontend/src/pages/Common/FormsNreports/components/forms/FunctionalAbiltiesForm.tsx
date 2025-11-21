const FunctionalAbiltiesForm = () => {

  return (
    <div className="d-flex flex-column gap-24 ">
      <div className="card">
        <div className="card-body d-flex flex-row align-items-center gap-20 px-24 py-16">
          <img src="/assets/images/Wsib.png" width={273} height={93} />
          <div className="d-flex flex-row justify-content-between align-items-center flex-grow-1">
            <div className="d-flex flex-column ">
              <h3 className="text-xxl fw-semibold text-street-dark mb-1">
                Functional Abilities Form
              </h3>
              <p className="text-md fw-semibold text-street-dark">
                for Planning Early and Safe Return to Work
              </p>
            </div>
            <div
              className="d-flex flex-row align-items-center "
              style={{
                gap: "15px",
              }}
            >
              <div className="d-flex flex-row align-items-center gap-18">
                <div className="d-flex flex-column " style={{ gap: "5px" }}>
                  <p className="text-xs text-street-dark fw-normal ">
                    Mail to:
                  </p>
                  <p className="text-xs text-street-dark fw-normal ">
                    200 Front Street West
                  </p>
                  <p className="text-xs text-street-dark fw-normal ">
                    Toronto ON M5V 3J1
                  </p>
                </div>
                <div className="d-flex flex-column " style={{ gap: "5px" }}>
                  <p className="text-xs text-street-dark fw-normal ">
                    Or Fax to:
                  </p>
                  <p className="text-xs text-street-dark fw-normal ">
                    416-344-4684
                  </p>
                  <p className="text-xs text-street-dark fw-normal ">
                    or 1-888-313-7373
                  </p>
                </div>
              </div>
              <div>{/* claim Part */}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunctionalAbiltiesForm;
