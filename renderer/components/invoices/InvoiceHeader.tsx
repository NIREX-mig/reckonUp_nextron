import React from "react";

const InvoiceHeader = ({ shopName, address }) => {
  return (
    <div className="relative mb-10 flex items-center justify-between">
      <div className="flex items-center gap-5">
        <div className="relative h-[100px] w-[100px]">
          <div className="absolute left-[10px] top-[10px] flex h-[90px] w-[90px] items-center justify-center rounded-full bg-white shadow-[0_8px_32px_-15px_rgba(67,24,209,0.5)]">
            <img
              src="https://placehold.co/100x100"
              alt="Logo"
              className="h-[80px] w-[80px]"
            />
          </div>
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-[#4318D1] via-[#AB78FF] to-[#4318D1] bg-[200%_auto] bg-clip-text text-[30px] font-thin tracking-[6px] text-transparent">
            {shopName}
          </h1>
          <p className="text-[15px] tracking-[7px] text-[#333]">{address}</p>
        </div>
      </div>
      <div className="relative text-right">
        <h2 className="bg-gradient-to-r from-[#4318D1] via-[#AB78FF] to-[#4318D1] bg-[200%_auto] bg-clip-text text-[50px] font-thin tracking-[10px] text-transparent">
          INVOICE
        </h2>
      </div>
    </div>
  );
};

export default InvoiceHeader;
