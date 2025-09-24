import AuthWrapper from "../../../components/Authentication/AuthWrapper";

import AuthFormWrapper from "../../../components/Authentication/AuthFormWrapper";
import LoginForm from "./components/LoginForm";
const Login = () => {
  return (
    <AuthWrapper
      sideimage="assets/images/auth/8e1ff61526c7396410d2ae15f20361181167f0c1.jpg"
      mtext="Welcome to the Street Haven Community"
      subText="Create an Account or Log In to Access Support, Resources & Community Events"
    >
      <AuthFormWrapper
        title="Welcome Back"
        subText="Welcome back! Please enter your details below."
      >
        <LoginForm />
      </AuthFormWrapper>
    </AuthWrapper>
  );
};

export default Login;
