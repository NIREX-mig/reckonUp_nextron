import moment from "moment";
import React from "react";

const InvoiceDetailsCards = ({
  exchange,
  category,
  percentage,
  customeraddress,
  customername,
  customerphone,
}) => {
  return (
    <div className="mb-5 flex justify-between">
      {/* <div> */}
        {/* {exchange && ( */}
          <div className=" text-left w-[250px] rounded-xl border-[1px] border-[#f0f0f0] bg-white px-4 py-2">
            <p className="mb-2 text-lg font-light tracking-[1px] text-black">
              EXCHANGE DETAILS
            </p>
            <p className="text-[15px] tracking-[1px] text-black">
              Category: {category === "select" ? "N/A" : category}
            </p>
            <p className="text-[15px] tracking-[1px] text-black">
              Percentage: {percentage === null ? "N/A" : percentage}
            </p>
          </div>
        {/* )} */}
      {/* </div> */}
      <div className="rounded-xl border-[1px] border-[#f0f0f0] bg-white w-[200px] text-left px-4 py-2">
        <p className="mb-1 text-lg font-light tracking-[1px] text-black">
          BILLED TO
        </p>
        <p className="text-[15px] font-medium tracking-[1px] text-black capitalize">
          {customername}
        </p>
        <p className="text-[15px] font-medium tracking-[1px] text-black capitalize">
          {customeraddress}
        </p>
        <p className="text-[15px] font-medium tracking-[1px] text-black capitalize">
          {customerphone}
        </p>
      </div>
    </div>
  );
};

export default InvoiceDetailsCards;
