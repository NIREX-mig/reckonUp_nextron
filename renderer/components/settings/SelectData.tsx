import React from "react";

const SelectData = ({ checked, setChecked }) => {
  return (
    <section className="px-3">
      <div className="flex items-center mb-4 ">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => {
            setChecked(!checked);
          }}
          className="w-4 h-4 accent-primary-900"
        />
        <label
          htmlFor=""
          className="ms-2 text-base font-medium text-primary-900"
        >
          Exchange Details
        </label>
      </div>
    </section>
  );
};

export default SelectData;
