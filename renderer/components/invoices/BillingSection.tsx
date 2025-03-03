import React from "react";

const BillingSection = ({
  subtotal,
  gst,
  GstPercentage,
  GSTAmount,
  exchange,
  exchangeAmount,
  totalAmount,
  paidAmount,
  discount,
  qrSrc,
}) => {
  return (
    <div className="flex justify-between">
      <div className="relative h-[180px] overflow-hidden rounded-[40px] border-[1px] border-[#f0f0f0] bg-white p-4 shadow-[0_15px_40px_-15px_rgba(67,24,209,0.1)]">
        <img
          src={qrSrc}
          alt="QR-code"
          className="w-[140px] h-[140px] object-contain"
        />
      </div>
      <div className="w-[300px]">
        <div className="relative overflow-hidden rounded-[40px] border-[1px] border-[#f0f0f0] bg-white p-10 shadow-[0_15px_40px_-15px_rgba(67,24,209,0.1)]">
          <div className="absolute left-[-200px] top-[-200px] h-[400px] w-[400px] rotate-[25deg] bg-gradient-to-r from-[#4318D1] to-[#AB78FF] opacity-[0.02]" />
          <div className="mb-2 flex justify-between">
            <span className="text-[18px] text-[#666]">Subtotal:</span>
            <span className="text-[18px] text-[#333]">{`₹ ${subtotal}`}</span>
          </div>
          {gst && (
            <div className=" mb-2 flex justify-between">
              <span className="text-[18px] text-[#666]">{`GST(${GstPercentage}%) :`}</span>
              <span className="text-[18px] text-[#333]">{`₹ ${GSTAmount}`}</span>
            </div>
          )}
          {exchange && (
            <div className="mb-2 flex justify-between">
              <span className="text-[18px] text-[#666]">{`Exchange Amt :`}</span>
              <span className="text-[18px] text-[#333]">{`₹ ${exchangeAmount}`}</span>
            </div>
          )}
          <div className="mb-2 flex justify-between text-[#4318D1] border-t border-[#4318D1] ">
            <span className="text-[18px]">Total:</span>
            <span className="text-[18px]">{` ₹ ${totalAmount}`}</span>
          </div>

          <div className=" mb-2 flex justify-between">
            <span className="text-[18px] text-[#666]">Paid Amount :</span>
            <span className="text-[18px] text-[#333]">{`₹ ${paidAmount}`}</span>
          </div>
          <div className="md-2 flex justify-between">
            <span className="text-[18px] text-[#666]">Discount :</span>
            <span className="text-[18px] text-[#333]">{`₹ ${discount}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSection;
