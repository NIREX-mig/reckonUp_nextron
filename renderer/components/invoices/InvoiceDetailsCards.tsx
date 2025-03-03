import moment from "moment";
import React from "react";

const InvoiceDetailsCards = ({
  category,
  percentage,
  customeraddress,
  customername,
  customerphone,
  invoiceNumber,
  date,
}) => {
  return (
    <div className="mb-5 grid grid-cols-3 gap-8 ">
      <div className="relative overflow-hidden rounded-[40px] border-[1px] border-[#f0f0f0] bg-white p-10 shadow-[0_15px_40px_-15px_rgba(67,24,209,0.1)]">
        <div className="absolute left-[-100px] top-[-100px] h-[200px] w-[200px] rotate-[25deg] bg-gradient-to-r from-[#4318D1] to-[#AB78FF] opacity-[0.05]" />
        <p className="mb-3 text-[15px] font-light tracking-[2px] text-[#666]">
          INVOICE DETAILS
        </p>
        <p className="bg-gradient-to-r from-[#4318D1] to-[#AB78FF] bg-clip-text text-[15px] font-medium tracking-[2px] text-transparent">
          Invoice# {invoiceNumber}
        </p>
        <p className="bg-gradient-to-r from-[#4318D1] to-[#AB78FF] bg-clip-text text-[12px] font-medium tracking-[2px] text-transparent">
          Date: {moment(date).format("DD/MM/YYYY")}
        </p>
      </div>

      <div className="relative overflow-hidden rounded-[40px] border-[1px] border-[#f0f0f0] bg-white p-7 shadow-[0_15px_40px_-15px_rgba(67,24,209,0.1)]">
        <div className="absolute right-[-100px] top-[-100px] h-[200px] w-[200px] rotate-[25deg] bg-gradient-to-r from-[#4318D1] to-[#AB78FF] opacity-[0.05]" />
        <p className="mb-3 text-[14px] font-light tracking-[2px] text-[#666]">
          EXCHANGE DETAILS
        </p>
        <p className="bg-gradient-to-r from-[#4318D1] to-[#AB78FF] bg-clip-text text-[15px] font-medium tracking-[2px] text-transparent">
          Category: {category === "select" ? "N/A" : category}
        </p>
        <p className="bg-gradient-to-r from-[#4318D1] to-[#AB78FF] bg-clip-text text-[15px] font-medium tracking-[2px] text-transparent">
          Percentage: {percentage === null ? "N/A" : percentage}
        </p>
      </div>

      {/* <div></div> */}

      <div className="relative overflow-hidden rounded-[40px] border-[1px] border-[#f0f0f0] bg-white p-7 shadow-[0_15px_40px_-15px_rgba(67,24,209,0.1)]">
        <div className="absolute left-[-100px] top-[-100px] h-[200px] w-[200px] rotate-[25deg] bg-gradient-to-r from-[#4318D1] to-[#AB78FF] opacity-[0.05]" />
        <p className="mb-3 text-[14px] font-light tracking-[2px] text-[#666]">
          BILLED TO
        </p>
        <p className="bg-gradient-to-r from-[#4318D1] to-[#AB78FF] bg-clip-text text-[15px] font-medium tracking-[2px] text-transparent capitalize">
          {customername}
        </p>
        <p className="bg-gradient-to-r from-[#4318D1] to-[#AB78FF] bg-clip-text text-[15px] font-medium tracking-[2px] text-transparent capitalize">
          {customeraddress}
        </p>
        <p className="bg-gradient-to-r from-[#4318D1] to-[#AB78FF] bg-clip-text text-[15px] font-medium tracking-[2px] text-transparent capitalize">
          {customerphone}
        </p>
      </div>
    </div>
  );
};

export default InvoiceDetailsCards;
