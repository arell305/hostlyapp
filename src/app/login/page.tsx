import { LoginButton } from "../components/shared/LoginButton";
import { FaApple } from "react-icons/fa";
import { FaGoogle } from "react-icons/fa";
import { FaPhone } from "react-icons/fa";

export default function Login() {
  return (
    <div className="bg-gradient-to-b from-customDarkBlue to-customPrimaryBlue h-[calc(100dvh)] flex justify-center items-center overflow-hidden">
      <div className="bg-white flex flex-col h-[70vh] md:h-[85%] w-[90%] md:w-[70%] max-w-[800px] max-h-[600px] rounded-xl shadow-md">
        <h1 className="leading-tight text-5xl md:text-6xl font-semibold mt-6 md:mt-14 text-center">
          Login to HostlyApp
        </h1>
        <div className="flex flex-col mt-6 md:mt-12 justify-center items-center space-y-4">
          <LoginButton
            text="Continue with Google"
            href="https://google.com"
            icon={<FaGoogle size={20} />}
          />
          <LoginButton
            icon={<FaApple size={22} />}
            text="Continue with Apple"
            href="https://apple.com"
          />
        </div>
        <div className="rounded-full mx-auto h-1 mt-8 w-[70%] bg-gradient-to-r from-[#2C3AF8] to-[#00008B]"></div>
        <div className="flex flex-col justify-center items-center mt-4 md:mt-8">
          <p className="text-2xl mb-3 mt-3">Need an Account?</p>
          <LoginButton
            icon={<FaPhone size={20} />}
            text="Talk With Sales"
            href="https://apple.com"
          />
        </div>
      </div>
    </div>
  );
}
