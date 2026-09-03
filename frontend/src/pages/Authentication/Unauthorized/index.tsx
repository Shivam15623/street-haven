import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { selectAuth } from "../../../redux/AuthSlice";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useSelector(selectAuth);

  const handleGoBack = () => {
    navigate("/", { replace: true });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center px-3"
      style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}
    >
      <div
        className="card shadow-4 radius-16 border-0 text-center p-32 p-sm-40"
        style={{ maxWidth: "420px", width: "100%" }}
      >
        <div className="d-flex flex-column align-items-center gap-16">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger-50"
            style={{ width: "64px", height: "64px" }}
          >
            <Icon
              icon="mdi:shield-alert-outline"
              className="text-danger-600"
              style={{ fontSize: "28px" }}
            />
          </div>

          <div className="d-flex flex-column gap-8">
            <h4 className="text-street-dark fw-semibold mb-0">
              Access Denied
            </h4>

            <p className="text-street-base text-sm mb-0">
              {user?.firstName
                ? `Hi ${user.firstName}, you don't have permission to view this page.`
                : "You don't have permission to view this page."}
            </p>
            <p className="text-street-base text-sm mb-0">
              Contact your administrator if you believe this is a mistake.
            </p>
          </div>

          <button
            className="btn btn-street-primary btn-street-lg radius-12 w-100 d-flex align-items-center justify-content-center text-sm mt-8"
            onClick={handleGoBack}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;