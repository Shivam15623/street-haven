

const FunctionalAbiltiesTab = () => {
  return (
    <div className="d-flex flex-column gap-24">
      {" "}
      <div className="py-16 px-24 card d-flex flex-row gap-20">
        <img src="/assets/images/Wsib.png" className="functional_image" />
        <div className="d-flex flex-grow-1 flex-row justify-content-between align-items-center">
          <div>
            <h2 className="mb-0 text-xxl text-street-dark fw-semibold">
              Functional Abilities Form
            </h2>
            <h3 className="mb-0 text-street-dark text-md fw-semibold">
              for Planning Early and Safe Return to Work
            </h3>
          </div>
          <div className=" d-flex flex-row fw-normal align-items-center gap-16 text-xs text-street-dark">
            <div className="d-flex flex-row gap-18">
              <div className="d-flex flex-column" style={{ gap: "5px" }}>
                <p>Mail to:</p>
                <p>200 Front Street West</p>
                <p>Toronto ON M5V 3J1</p>
              </div>
              <div className="d-flex flex-column" style={{ gap: "5px" }}>
                <p>Or Fax to:</p>
                <p>416-344-4684</p>
                <p> or 1-888-313-7373</p>
              </div>
            </div>

            <div className="d-flex flex-column gap-10">
              <p>Claim No.</p>
              <input
                type="text"
                style={{ minWidth: "240px" }}
                className="px-16 h-40-px py-12 border-0-5 radius-8 border-sh-base-1-2"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="p-24 card d-flex flex-row gap-20 text-xs text-street-dark fw-normal">
        <h3 className="text-lg fw-semibold ">
          A. Section A to be completed by the employer and/or worker.
        </h3>
      </div>
    </div>
  );
};

export default FunctionalAbiltiesTab;
