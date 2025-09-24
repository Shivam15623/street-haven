
import AuthWrapper from "../../../components/Authentication/AuthWrapper";
import AuthFormWrapper from "../../../components/Authentication/AuthFormWrapper";
import SignupForm from "./components/SignupForm";

const SignUp = () => {
  return (
    <AuthWrapper
   
      sideimage="assets/images/auth/8ab73d2538fa1c5701724c322cc398c29f40c77f.jpg"
      mtext="Join Our Safe Space"
      subText="Sign Up to Connect with Services, Workshops & Peer Support"
    >
      <AuthFormWrapper
        title="Welcome!"
        subText="Lets login into  your account first"
      >
        <SignupForm />
      </AuthFormWrapper>
    </AuthWrapper>
  );
};

export default SignUp;
