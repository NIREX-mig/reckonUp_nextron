import React, { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputFeild {
  title?: string;
  type: "text" | "number" | "date";
  min?: string | number;
  max?: string | number;
  step?: string | number;
  disabled?: boolean;
  value: string | number;
  handleChangeText: (e) => void;
  handleOnBlur?: () => void;
  otherStyle?: string;
  lableStyle?: string;
  placeholder?: string;
  icon?: any;
  auth?: boolean;
}

const Input = ({
  title,
  type,
  min,
  max,
  step,
  disabled,
  value,
  handleChangeText,
  handleOnBlur,
  otherStyle,
  lableStyle,
  placeholder,
}: InputFeild) => {
  return (
    <div className="flex items-center gap-2 justify-end">
      {title && (
        <label htmlFor={title} className={`text-sm font-medium ${lableStyle}`}>
          {title}
          {type != "date" && ":"}
        </label>
      )}

      <input
        type={type}
        autoComplete="off"
        onFocus={(e) => e.target.select()}
        value={value}
        min={`${min}`}
        step={`${step}`}
        max={`${max}`}
        onChange={handleChangeText}
        onBlur={handleOnBlur}
        className={`bg-primary-100 border border-primary-800 text-primary-900 text-sm font-semibold rounded-md focus:outline-purple-800 inline-block py-1.5 px-2 ${otherStyle}`}
        placeholder={placeholder}
        disabled={disabled}
        required
      />
    </div>
  );
};

export default Input;
