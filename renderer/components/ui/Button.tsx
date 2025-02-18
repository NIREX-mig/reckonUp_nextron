import React from "react";

type CustomButton = {
  title: string;
  icon?: any;
  extraClass?: string;
  buttonType?: "submit" | "reset" | "button";
  disabled?: boolean;
  handleClick?: () => void;
};

const Button = ({
  title,
  extraClass,
  icon,
  handleClick,
  disabled,
  buttonType,
}: CustomButton) => {
  return (
    <button
      type={buttonType}
      className={`text-white bg-btn/95 hover:bg-btn disabled:bg-btn/50 rounded-lg px-4 py-2 text-center mx-auto w-full ${extraClass}`}
      disabled={disabled}
      onClick={handleClick}
    >
      {icon}
      {title}
    </button>
  );
};

export default Button;
