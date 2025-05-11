import React from 'react';

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
      <div className="h-[160px] rounded-xl border-[1px] border-[#f0f0f0] bg-white p-2">
        <img src={qrSrc} alt="QR-code" className="w-[140px] h-[140px] object-contain" />
      </div>
      <div className="w-[200px]">
        <div className="">
          <div className="mb-1 flex justify-between">
            <span className="text-[15px]]">Subtotal:</span>
            <span className="text-[15px]">{`₹ ${subtotal}`}</span>
          </div>
          {gst && (
            <div className=" mb-1 flex justify-between">
              <span className="text-[15px]">{`GST(${GstPercentage}%) :`}</span>
              <span className="text-[15px]">{`₹ ${GSTAmount}`}</span>
            </div>
          )}
          {exchange && (
            <div className="mb-1 flex justify-between">
              <span className="text-[15px]">{`Exchange Amt :`}</span>
              <span className="text-[15px]">{`₹ ${exchangeAmount}`}</span>
            </div>
          )}
          <div className="mb-1 flex justify-between border-t border-gray-500 ">
            <span className="text-[15px]">Total:</span>
            <span className="text-[15px]">{` ₹ ${totalAmount}`}</span>
          </div>

          <div className=" mb-1 flex justify-between">
            <span className="text-[15px]">Paid Amount :</span>
            <span className="text-[15px]">{`₹ ${paidAmount}`}</span>
          </div>
          <div className="md-1 flex justify-between">
            <span className="text-[15px]">Discount :</span>
            <span className="text-[15px]">{`₹ ${discount}`}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingSection;
