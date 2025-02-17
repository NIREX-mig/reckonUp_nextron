import React, { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import NewPasswordContainer from "../components/forgotpassword/NewPasswordContainer";
import OtpContainer from "../components/forgotpassword/OtpContainer";
import ForgotContainer from "../components/forgotpassword/ForgotContainer";
import { useRouter } from "next/router";
import { APiRes } from "../types";
import toast, { Toaster } from "react-hot-toast";

export default function ForgotPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [finalOtp, setFinalOtp] = useState("");
  const [formData, setFormData] = useState({
    newpassword: "",
    comfirmpassword: "",
  });
  const [fpContainer, setFPContainer] = useState(true);
  const [otpContainer, setOtpContainer] = useState(false);
  const [npContainer, setNPContainer] = useState(false);

  const handleOnChange = (e) => {
    setUsername(e.target.value);
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    window.ipc.send("forgotpasswordemail", { username });

    window.ipc.on("forgotpasswordemail", (res: APiRes) => {
      if (res.success) {
        localStorage.setItem("tempToken", res.data);
        toast.success(res.message);
        setFPContainer(false);
        setOtpContainer(true);
        setNPContainer(false);
      } else {
        toast.error(res.message);
        setOtpContainer(false);
        setNPContainer(false);
        setFPContainer(true);
      }
    });
  };

  const handleOtpSumbmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("tempToken");
    window.ipc.send("validateotp", { otp: finalOtp, token });

    window.ipc.on("validateotp", (res: APiRes) => {
      if (res.success) {
        toast.success(res.message);
        setFPContainer(false);
        setOtpContainer(false);
        setNPContainer(true);
      } else {
        toast.error(res.message);
        setOtpContainer(true);
        setNPContainer(false);
        setFPContainer(false);
      }
    });
  };

  const handleNewPasswordSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("tempToken");

    window.ipc.send("forgotpassword", {
      newpassword: formData.newpassword,
      token,
    });

    window.ipc.on("forgotpassword", (res: APiRes) => {
      if (res.success) {
        localStorage.removeItem("tempToken");
        toast.success(res.message);
        setTimeout(() => {
          router.push("/");
        }, 500);
      } else {
        toast.error(res.message);
        setOtpContainer(false);
        setNPContainer(true);
        setFPContainer(false);
      }
    });
  };

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="bg-primary-50 h-screen flex justify-center gap-5 items-center">
        <Toaster />
        <div className="bg-primary-50 rounded-lg p-4">
          <Image
            src="/LoginAnimation.gif"
            alt="loginanimationgif"
            width={500}
            height={500}
            className=""
            priority
          />
        </div>
        {fpContainer && (
          <ForgotContainer
            username={username}
            handleOnChange={handleOnChange}
            handleUsernameSubmit={handleUsernameSubmit}
          />
        )}
        {otpContainer && (
          <OtpContainer
            finalOtp={finalOtp}
            setFinalOtp={setFinalOtp}
            handleOtpSumbmit={handleOtpSumbmit}
          />
        )}
        {npContainer && (
          <NewPasswordContainer
            formData={formData}
            setFormData={setFormData}
            handleNewPasswordSubmit={handleNewPasswordSubmit}
          />
        )}
      </section>
    </React.Fragment>
  );
}
