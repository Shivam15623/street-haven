import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import { selectAuth, setLoggedOut } from "../../../redux/AuthSlice";
import { useLogoutMutation } from "../../../services/AuthApi";
import { showError } from "../../../utills/toastutills";
import { getErrorMessage } from "../../../utills/utills";

const AccountInactive: React.FC = () => {
  const navigate = useNavigate();
    const dispatch = useDispatch();
 const { user } = useSelector(selectAuth);
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (error) {
      showError(getErrorMessage(error))
    } finally {
      // Clear Redux auth state
      dispatch(setLoggedOut());

      // Redirect after state is cleared
      navigate("/login", { replace: true });
    }
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
              icon="mdi:lock-outline"
              className="text-danger-600"
              style={{ fontSize: "28px" }}
            />
          </div>

          <div className="d-flex flex-column gap-8">
            <h4 className="text-street-dark fw-semibold mb-0">
              Account Deactivated
            </h4>

            <p className="text-street-base text-sm mb-0">
              {user?.firstName
                ? `Hi ${user.firstName}, your account has been deactivated.`
                : "Your account has been deactivated."}
            </p>
            <p className="text-street-base text-sm mb-0">
              Please contact your administrator to restore access.
            </p>
          </div>

          <button
            className="btn btn-street-primary btn-street-lg radius-12 w-100 d-flex align-items-center justify-content-center text-sm mt-8"
            onClick={handleLogout}
            disabled={isLoading}
          >
            {isLoading ? "Logging out..." : "Back to Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountInactive;
