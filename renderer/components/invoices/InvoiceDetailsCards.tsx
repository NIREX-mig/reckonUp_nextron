import React from 'react';

const InvoiceDetailsCards = ({
  exchange,
  category,
  percentage,
  customeraddress,
  customername,
  customerphone,
}) => {
  return (
    <div className="flex justify-between">
      {/* <div> */}
      {/* {exchange && ( */}
      <div className=" text-left px-4">
        <p className=" text-[15px] font-semibold  text-black">EXCHANGE DETAILS</p>
        <p className="text-[15px] text-black">
          Category: {category === 'select' ? 'N/A' : category}
        </p>
        <p className="text-[15px] text-black">
          Percentage: {percentage === null ? 'N/A' : percentage}
        </p>
      </div>
      {/* )} */}
      {/* </div> */}
      <div className=" w-[150px] text-left px-4">
        <p className="text-[15px] font-semibold text-black">BILLED TO</p>
        <p className="text-[15px] text-black capitalize">{customername}</p>
        <p className="text-[15px] text-black capitalize">{customeraddress}</p>
        <p className="text-[15px] text-black capitalize">{customerphone}</p>
      </div>
    </div>
  );
};

export default InvoiceDetailsCards;
