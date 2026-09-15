import React from "react";
import "@assets/css/AuthForm.css";
const AuthFormWrapper = ({
  children,
  title = "Welcome Back",
  subText = "Welcome back! Please enter your details below.",
}: {
  children: React.ReactNode;
  title: string;
  subText: string;
}) => {
  return (
    <div className="max-w-400-px mx-auto d-flex flex-column  align-items-center gap-24 gap-sm-28 gap-md-32 w-100">
      <div className="d-flex align-items-center justify-content-center">
        <img
          className="auth-form-wrap-img "
          src="assets/images/street-logo-auth.png"
        />
      </div>
      <div className="d-flex flex-column align-items-center gap-24 gap-sm-28 gap-md-32">
        <div className="d-flex flex-column align-items-center gap-10 ">
          <div className="AuthMainText">{title}</div>
          <p className="AuthSubtext mb-0">{subText}</p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default AuthFormWrapper;
