import React from "react";

const SelectData = () => {
  return (
    <section className="px-3">
      <div className="flex items-center mb-4 ">
        <input type="checkbox" value="" className="w-4 h-4 accent-primary-900" />
        <label
          htmlFor=""
          className="ms-2 text-base font-medium text-primary-900"
        >
          Customer Details
        </label>
      </div>
      <div className="flex items-center mb-4 ">
        <input type="checkbox" value="" className="w-4 h-4 accent-primary-900" />
        <label
          htmlFor=""
          className="ms-2 text-base font-medium text-primary-900"
        >
          Exchange Details
        </label>
      </div>
      <div className="flex items-center mb-4 ">
        <input type="checkbox" value="" className="w-4 h-4 accent-primary-900" />
        <label
          htmlFor=""
          className="ms-2 text-base font-medium text-primary-900"
        >
          Payment History
        </label>
      </div>
      <div className="flex items-center mb-4 ">
        <input type="checkbox" value="" className="w-4 h-4 accent-primary-900" />
        <label
          htmlFor=""
          className="ms-2 text-base font-medium text-primary-900"
        >
          Gst Details
        </label>
      </div>
      
    </section>
  );
};

export default SelectData;
