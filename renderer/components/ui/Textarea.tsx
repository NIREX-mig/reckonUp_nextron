import React from "react";

const Textarea = ({ title, row, value, handleTextChange, placeholder }) => {
  return (
    <div className="flex items-center gap-2 mb-2 justify-end">
      <label htmlFor={title} className="text-sm font-medium text-primary-800">
        {title}:
      </label>
      <textarea
        rows={row}
        autoComplete="off"
        value={value}
        onChange={handleTextChange}
        className="bg-gray-100 border border-primary-800 text-primary-900 text-sm font-semibold rounded-md focus:outline-purple-800 block py-1.5 px-2"
        placeholder={placeholder}
        required
      />
    </div>
  );
};

export default Textarea;
