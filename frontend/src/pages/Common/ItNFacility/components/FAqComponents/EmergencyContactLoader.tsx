const EmergencyContactLoader = () => {
  return (
    <div
      className="p-16 rounded-3 help-blur placeholder-glow"
      style={{ boxShadow: "0px 0px 10px 0px #00000012" }}
    >
      <div className="d-flex flex-row gap-3 align-items-start">
        {/* Icon placeholder */}
        <span
          className="placeholder rounded-3"
          style={{ width: "40px", height: "40px" }}
        />

        <div className="d-flex flex-column gap-3 w-100">
          {/* Title */}
          <span
            className="placeholder col-4 rounded"
            style={{ height: "14px" }}
          />

          {/* Contact rows */}
          {Array.from({ length: 3 }).map((_, idx) => (
            <span
              key={idx}
              className="placeholder col-7 rounded"
              style={{ height: "12px" }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmergencyContactLoader;
