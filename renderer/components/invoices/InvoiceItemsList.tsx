import React from "react";

const InvoiceItemsList = ({ productList }) => {
  return (
    <div className="mb-3 rounded-xl border-[1px] border-[#f0f0f0] bg-white shadow-[0_15px_40px_-15px_rgba(67,24,209,0.1)] p-3">
      <table className="w-full mb-3 ">
        <thead className="bg-[#4318D1] bg-clip-text text-[15px] font-medium tracking-[2px] text-transparent capitalize">
          <tr className="border-b">
            <th className="text-center">SNo</th>
            <th className="text-center w-[12rem]">Product Name</th>
            <th className="text-center">Category</th>
            <th className="text-center">Weight (g)</th>
            <th className="text-center">Quantity</th>
            <th className="text-center">Rate</th>
            <th className="text-center">Making(%)</th>
            <th className="text-center w-[8rem]">Total</th>
          </tr>
        </thead>
        <tbody>
          {productList?.map((product, index) => {
            return (
              <tr key={index} className="border-b">
                <td className="text-center">{index + 1}</td>
                <td className="text-center">{product.productName}</td>
                <td className="text-center">{product.productCategory}</td>
                <td className="text-center">{product.netWeight}</td>
                <td className="text-center">{product.quantity}</td>
                <td className="text-center">{product.rate}</td>
                <td className="text-center">{product.makingCost}</td>
                <td className="text-center">{`₹ ${product.amount}`}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceItemsList;
