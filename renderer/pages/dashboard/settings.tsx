import React, { ReactElement, useEffect, useState } from "react";
import RootLayout from "../../components/rootLayout";
import { NextPageWithLayout } from "../_app";
import Head from "next/head";
import Header from "../../components/ui/Header";
import toast from "react-hot-toast";
import ExportToExel from "../../components/settings/ExportToExel";
import FeedBack from "../../components/settings/FeedBack";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Tabs from "../../components/settings/Tabs";
import ShopDetails from "../../components/settings/ShopDetails";
import Profile from "../../components/settings/Profile";
import SettingPassword from "../../components/settings/SettingPassword";
import { APiRes } from "../../types";
import { useIsOnline } from "react-use-is-online";
import { AiOutlineLoading } from "react-icons/ai";

const SettingPage: NextPageWithLayout = () => {
  const { isOffline } = useIsOnline();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [settingPassword, setSettingPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const [activeTab, setActiveTab] = useState("general");

  const [otpContainer, setOtpcontainer] = useState(false);
  const [otp, setOtp] = useState(null);
  const [otpIsValid, setOtpIsValid] = useState(false);
  const [otpSubmit, setOtpSubmit] = useState(false);

  const [forgotPassword, setForgotPassword] = useState({
    new: "",
    confirm: "",
  });
  const [passwordSubmit, setPasswordSubmit] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);

    window.ipc.send("login-setting", { settingPassword });
    window.ipc.on("login-setting", (res: APiRes) => {
      setTimeout(() => {
        if (res.success) {
          setSettingPassword("");
          setIsAuthenticating(false);
          toast.success(res.message);
          setIsAuthenticated(true);
        } else {
          setSettingPassword("");
          setIsAuthenticating(false);
          toast.error(res.message);
        }
      }, 1000);
    });
  };

  const handleOtpSubmit = () => {
    setOtpSubmit(true);

    window.ipc.send("validate-setting-otp", { otp });
    window.ipc.on("validate-setting-otp", (res: APiRes) => {
      if (res.success) {
        toast.success(res.message);
        setOtpSubmit(false);
        setOtpIsValid(true);
      } else {
        setOtpSubmit(false);
        setOtpIsValid(false);
        toast.error(res.message);
      }
    });
  };

  const handleSubmitNewPassword = () => {
    setPasswordSubmit(true);

    window.ipc.send("forgot-setting-password", forgotPassword);
    window.ipc.on("forgot-setting-password", (res: APiRes) => {
      if (res.success) {
        toast.success(res.message);
        setPasswordSubmit(true);
        setOtpcontainer(false);
      } else {
        setOtpIsValid(false);
        toast.error(res.message);
      }
      setPasswordSubmit(false);
    });
  };

  const handleClickForgotPassword = () => {
    if (isOffline) {
      toast.error("Please Connect To The 🛜 Internet.");
      return;
    }

    window.ipc.send("setting-forgot-email", {});
    window.ipc.on("setting-forgot-email", (res: APiRes) => {
      if (res.success) {
        setOtpcontainer(true);
        toast.success(res.message);
      } else {
        setOtpcontainer(false);
        toast.error(res.message);
      }
    });
  };

  if (!isAuthenticated) {
    return (
      <div className=" p-1 bg-primary-50 overflow-auto rounded-xl m-2 flex flex-col items-center justify-center h-[calc(100%-16px)]">
        {!otpContainer && (
          <div className="border border-primary-950 rounded-md p-5 ">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-2xl font-bold text-primary-900">
                Authentication Required
              </h3>
              <p className="text-lg font-semibold text-primary-800">
                Please enter your setting password to access settings
              </p>
            </div>
            <form onSubmit={handlePasswordSubmit}>
              <div className="mt-5 flex flex-col">
                <Input
                  type="password"
                  title="Password"
                  lableStyle="text-primary-900 sm:text-lg"
                  otherStyle="w-[300px] mx-auto"
                  handleChangeText={(e) => setSettingPassword(e.target.value)}
                  value={settingPassword}
                  placeholder="Enter your setting password"
                />

                <p
                  onClick={handleClickForgotPassword}
                  className=" font-semibold hover:underline inline-block focus:outline-primary-900 text-end mr-6 mt-2"
                >
                  Forger Password
                </p>

                <Button
                  title={isAuthenticating ? "Submiting..." : "Submit"}
                  buttonType="submit"
                  disabled={isAuthenticating}
                  extraClass="mt-2 sm:w-[400px]"
                  loading={isAuthenticating}
                  icon={<AiOutlineLoading size={20} />}
                />
              </div>
            </form>
          </div>
        )}
        {otpContainer && (
          <div className="border border-primary-950 rounded-md p-5 ">
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-2xl font-bold text-primary-900">
                Authentication Required
              </h3>
              <p className="text-lg font-semibold text-primary-800">
                Validate Otp And Change Password.
              </p>
            </div>
            <div className="mt-5 flex flex-col">
              <Input
                type="text"
                title="OTP"
                lableStyle="text-primary-900 sm:text-lg"
                otherStyle="w-[300px] mx-auto"
                handleChangeText={(e) => setOtp(e.target.value)}
                value={otp}
                placeholder="Enter 6 Digit Otp"
              />

              <Button
                title={otpSubmit ? "Submiting..." : "Submit Otp"}
                buttonType="button"
                disabled={otpSubmit}
                handleClick={handleOtpSubmit}
                extraClass="mt-2 sm:w-[400px]"
                loading={otpSubmit}
                icon={<AiOutlineLoading size={20} />}
              />
            </div>

            <br />

            <div className="mt-5 flex flex-col">
              <Input
                type="password"
                title="New Password"
                lableStyle={`text-primary-900 sm:text-lg ${
                  !otpIsValid && "opacity-40"
                }`}
                otherStyle="w-[300px] mx-auto disabled:border-gray-500 disabled:bg-gray-300"
                handleChangeText={(e) =>
                  setForgotPassword((prev) => ({
                    ...prev,
                    new: e.target.value,
                  }))
                }
                value={forgotPassword.new}
                disabled={!otpIsValid}
              />

              <Input
                type="password"
                title="Confirm Password"
                lableStyle={`text-primary-900 sm:text-lg ${
                  !otpIsValid && "opacity-40"
                }`}
                otherStyle="w-[300px] mx-auto mt-1 disabled:border-gray-500 disabled:bg-gray-300"
                handleChangeText={(e) =>
                  setForgotPassword((prev) => ({
                    ...prev,
                    confirm: e.target.value,
                  }))
                }
                value={forgotPassword.confirm}
                disabled={!otpIsValid}
              />

              <Button
                title={passwordSubmit ? "Submiting..." : "Submit Password"}
                buttonType="button"
                disabled={!otpIsValid}
                handleClick={handleSubmitNewPassword}
                extraClass="mt-2 sm:w-[400px]"
                loading={passwordSubmit}
                icon={<AiOutlineLoading size={20} />}
              />
            </div>
            <p
              onClick={() => setOtpcontainer(false)}
              className=" font-semibold hover:underline text-blue-500 focus:outline-primary-900 mr-6 mt-2 text-center"
            >
              Go Back
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <div className="p-1 bg-primary-50 h-[calc(100%-16px)] rounded-xl m-2">
        <Header title="Settings" extraStyle="mb-3" />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="bg-primary-50 border-primary-500 border text-primary-900 rounded-lg p-6 h-[calc(100%-135px)] overflow-auto">
          {activeTab === "general" && <ShopDetails />}
          {activeTab === "export" && <ExportToExel />}
          {activeTab === "profile" && <Profile />}
          {activeTab === "settings" && <SettingPassword />}
          {activeTab === "feedback" && <FeedBack />}
        </div>
      </div>
    </React.Fragment>
  );
};

SettingPage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default SettingPage;
