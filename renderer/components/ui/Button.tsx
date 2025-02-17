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
      className={`text-white bg-gradient-to-b border from-primary-600 to-primary-700 border-primary-800 hover:from-primary-700 hover:to-primary-800 hover:border-primary-900 active:from-primary-800 active:to-primary-900 active:border-primary-950 rounded-lg p-2 text-center mx-auto w-full ${extraClass}`}
    >
      {icon}
      {title}
    </button>
  );
};

export default Button;
