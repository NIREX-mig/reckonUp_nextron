import React from "react";

const InvoiceFooter = ({ mobile, whatsapp }) => {
  return (
    <footer className="mt-5">
      <div className=" -translate-y-10 translate-x-5 w-1/3 text-center">
        <p className="text-[13px] font-medium tracking-[2px] text-[#666]">
          Signature
        </p>
        <div className="mb-[2px] flex justify-center">
          <div className="relative h-[2px] w-[250px]">
            <div className="absolute bottom-0 h-[2px] w-full bg-gray-300" />
          </div>
        </div>
        <p className="text-[13px] tracking-[2px] text-[#666]">DD/MM/YYYY</p>
      </div>
      <p className="mt-4 text-[16px] tracking-[2px] text-[#666] text-center">
        Thanq for coming. have any problem contect here
        <span className="text-[#4318D1] mx-2">{mobile}</span>
        <span className="text-[#4318D1]">{whatsapp}</span>
      </p>
    </footer>
  );
};

export default InvoiceFooter;
