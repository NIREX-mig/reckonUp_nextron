import React from 'react';

type CustomButton = {
  title: string;
  icon?: any;
  extraClass?: string;
  buttonType?: 'submit' | 'reset' | 'button';
  disabled?: boolean;
  loading?: boolean;
  handleClick?: () => void;
};

const Button = ({
  title,
  extraClass,
  icon,
  handleClick,
  disabled,
  buttonType,
  loading,
}: CustomButton) => {
  return (
    <button
      type={buttonType}
      className={`text-white bg-primary-900 hover:bg-primary-950  disabled:bg-gray-500 cursor-pointer disabled:cursor-not-allowed rounded-lg px-4 py-1 text-center mx-auto w-full active:scale-95 transition-all duration-300 ${extraClass} ${
        loading && 'flex justify-center items-center gap-3'
      }`}
      disabled={disabled}
      onClick={handleClick}
    >
      {icon && <span className={`${loading && 'animate-spin'}`}>{loading && icon}</span>}
      {title}
    </button>
  );
};

export default Button;
