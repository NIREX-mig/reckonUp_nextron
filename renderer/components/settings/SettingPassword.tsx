import React, { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { APiRes } from "../../types";
import toast from "react-hot-toast";
import { AiOutlineLoading } from "react-icons/ai";

const SettingPassword = () => {
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = () => {
    if (
      passwords.confirmPassword.length === 0 ||
      passwords.newPassword.length === 0 ||
      passwords.currentPassword.length === 0
    ) {
      toast.error("All Feilds Are Required.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Error occured");
      return;
    } else {
      setError(null);
    }
    setIsSubmiting(true);
    window.ipc.send("update-setting-password", passwords);
    window.ipc.on("update-setting-password", (res: APiRes) => {
      setTimeout(() => {
        if (res.success) {
          setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setIsSubmiting(false);
          toast.success(res.message);
        } else {
          setPasswords({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setIsSubmiting(false);
          toast.error(res.message);
        }
      }, 1000);
    });
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-6">Update your setting password</h3>
      <div className="w-[450px] flex flex-col gap-y-2">
        <Input
          type="password"
          title="Current Password"
          value={passwords.currentPassword}
          handleChangeText={(e) => {
            setPasswords((prev) => ({
              ...prev,
              currentPassword: e.target.value,
            }));
          }}
          lableStyle="sm:text-[18px]"
          otherStyle="w-[270px]"
          placeholder="current password"
        />

        <Input
          type="password"
          title="New Password"
          value={passwords.newPassword}
          handleChangeText={(e) => {
            setPasswords((prev) => ({
              ...prev,
              newPassword: e.target.value,
            }));
          }}
          lableStyle="sm:text-[18px]"
          otherStyle="w-[270px]"
          placeholder="new password"
        />

        <Input
          type="password"
          title="Confirm Password"
          value={passwords.confirmPassword}
          handleChangeText={(e) => {
            setPasswords((prev) => ({
              ...prev,
              confirmPassword: e.target.value,
            }));
          }}
          lableStyle="sm:text-[18px]"
          otherStyle="w-[270px]"
          placeholder="confirm password"
        />
        {error && (
          <p className="text-red-600 font-semibold text-end">
            confirm and new password does not match.
          </p>
        )}

        <Button
          buttonType="button"
          title={isSubmiting ? "Updating ...." : "Update Password"}
          disabled={isSubmiting}
          handleClick={handleSubmit}
          extraClass="py-1.5"
          loading={isSubmiting}
          icon={<AiOutlineLoading size={20} />}
        />
      </div>
    </div>
  );
};

export default SettingPassword;
