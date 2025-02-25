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
      className={`text-white bg-btn hover:bg-btn/95  disabled:bg-btn/50 cursor-pointer disabled:cursor-not-allowed rounded-lg px-4 py-2 text-center mx-auto w-full active:scale-95 transition-all duration-300 ${extraClass}`}
      disabled={disabled}
      onClick={handleClick}
    >
      {icon}
      {title}
    </button>
  );
};

export default Button;
