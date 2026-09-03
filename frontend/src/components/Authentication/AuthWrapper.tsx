import React from "react";

const AuthWrapper = ({
  sideimage = "assets/images/auth/8e1ff61526c7396410d2ae15f20361181167f0c1.jpg",
  mtext,
  subText,
  children,
}: {
  sideimage: string;
  mtext: string;
  subText: string;
  children: React.ReactNode;
}) => {
  return (
    <section className="auth bg-base d-flex flex-wrap">
      <div className="auth-left d-lg-block d-none">
        <div className="image-wrapper h-100">
          <img src={sideimage} className="h-100 w-100" alt="" />
          <div className="Authgradient-overlay"></div>
          <div className="auth-textBox text-white d-flex flex-column justify-content-center gap-10 align-items-center">
            <div className="mtext">{mtext}</div>
            <p className="mb-0">{subText}</p>
          </div>
        </div>
      </div>
      <div className="auth-right py-20 px-16 py-md-24 py-lg-32 px-md-20 px-lg-24 d-flex flex-column justify-content-center">
        {children}
        <p className="authbottomText ">Copyright 2025 © StreetHaven</p>
      </div>
    </section>
  );
};

export default AuthWrapper;
