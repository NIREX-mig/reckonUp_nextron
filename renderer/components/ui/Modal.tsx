import React, { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { TbFileInvoice } from "react-icons/tb";
import { useRouter } from "next/router";

const Modal = ({ isOpen, closeModal }) => {
  const [invoiceData, setInvoiceData] = useState(undefined);

  const router = useRouter();

  const handlGenrateInvoice = () => {
    router.push("/dashboard/viewInvoice/");
  };

  useEffect(() => {
    const setinvoice = async () => {
      const jsonInvoice = localStorage.getItem("finalInvoice");
      const ObjInvoice = await JSON.parse(jsonInvoice);
      setInvoiceData(ObjInvoice);
    };
    setinvoice();
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-200 border border-primary-900 rounded-lg shadow-xl max-w-[75rem] w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">ReckonUp</h2>
              <p className="text-sm text-gray-500 mt-1">
                Jewelry Billing Software
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlGenrateInvoice}
                className="p-2 text-primary-50 bg-btn/95 hover:bg-btn rounded-lg flex gap-2 items-center"
                title="Genrate Invoice"
              >
                <TbFileInvoice className="w-5 h-5" />
                Genrate
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("finalInvoice");
                  closeModal();
                }}
                className="p-2 text-white bg-red-400  hover:bg-red-500 rounded-lg"
                title="Close"
              >
                <IoCloseSharp className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="border-t border-primary-900 pt-6">
            <div className="flex gap-10">
              <div className="px-3 border-r">
                <table className=" text-sm text-gray-500 border flex w-[25rem]">
                  <thead className="text-sm text-gray-700 uppercase text-start w-full">
                    <tr className="flex flex-col justify-start text-start ">
                      <th scope="col" className=" py-1 bg-green-300 w-full">
                        Invoice No
                      </th>
                      <th scope="col" className="py-1 w-full">
                        Customer Name
                      </th>
                      <th scope="col" className="py-1 bg-green-300 w-full">
                        Phone Number
                      </th>
                      <th scope="col" className="py-1 w-full">
                        Address
                      </th>
                      <th scope="col" className="py-1 bg-green-300 w-full">
                        gross Amount
                      </th>
                      <th scope="col" className="py-1 w-full">
                        Making Cost
                      </th>
                      <th scope="col" className="py-1 bg-green-300 w-full">
                        Exchange Amount
                      </th>
                      <th scope="col" className="py-1 w-full">
                        GST Amount
                      </th>
                      <th scope="col" className="py-1 bg-green-300 w-full">
                        GST Percentage
                      </th>
                      <th scope="col" className="py-1 w-full">
                        Total Amount
                      </th>
                      <th scope="col" className="py-1 bg-green-300 w-full">
                        Exchange Category
                      </th>
                      <th scope="col" className="py-1 w-full">
                        Exchange Percentage
                      </th>
                      <th scope="col" className="py-1 bg-green-300 w-full">
                        Exchange Weight
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm w-full">
                    <tr className=" flex flex-col items-start text-black text-start">
                      <th
                        scope="row"
                        className="py-1 font-medium text-gray-900 whitespace-nowrap capitalize bg-green-300 w-full text-start"
                      >
                        {invoiceData?.invoiceNo}
                      </th>
                      <td className="py-1 capitalize w-full">
                        {invoiceData?.customerName}
                      </td>
                      <td className="py-1 bg-green-300 w-full">
                        {invoiceData?.customerPhone}
                      </td>
                      <td className="py-1 capitalize w-full">
                        {invoiceData?.customerAddress}
                      </td>
                      <td className="py-1 bg-green-300 w-full">
                        {`₹${invoiceData?.grossAmt}`}
                      </td>
                      <td className="py-1 w-full">
                        {`${invoiceData?.makingCost}%`}
                      </td>
                      <td className="py-1 bg-green-300 w-full">
                        {`₹ ${
                          invoiceData?.exchangeAmt === ""
                            ? "0"
                            : invoiceData?.exchangeAmt
                        }`}
                      </td>
                      <td className="py-1 w-full">{`₹${invoiceData?.GSTAMT}`}</td>
                      <td className="py-1 bg-green-300 w-full">
                        {`${invoiceData?.GSTPercentage}%`}
                      </td>
                      <td className="py-1 w-full">
                        {`₹${invoiceData?.totalAmt}`}
                      </td>
                      <td className="py-1 bg-green-300 w-full">
                        {invoiceData?.exchangeCategory === "select"
                          ? "N/A"
                          : invoiceData?.exchangeCategory}
                      </td>
                      <td className="py-1 w-full">
                        {`${
                          invoiceData?.exchangePercentage === ""
                            ? "0"
                            : invoiceData?.exchangePercentage
                        }%`}
                      </td>
                      <td className="py-1 bg-green-300 w-full">
                        {`${
                          invoiceData?.exchangeWeight === ""
                            ? "0 gram"
                            : `${invoiceData?.exchangeWeight} gram`
                        }`}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="overflow-y-auto h-[400px]">
                <p className="mb-3">Product List:</p>
                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-green-300">
                    <tr>
                      <th
                        scope="col"
                        className="py-1 border-r w-[8rem] text-center"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="py-1 w-[8rem] border-r text-center"
                      >
                        Category
                      </th>
                      <th
                        scope="col"
                        className="py-1 w-[8rem] border-r text-center"
                      >
                        Rate
                      </th>
                      <th scope="col" className="py-1 border-r text-center">
                        Quantity
                      </th>
                      <th scope="col" className="py-1 border-r text-center">
                        Weight
                      </th>
                      <th
                        scope="col"
                        className="py-1 border-r w-[9rem] text-center"
                      >
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData?.productList?.map((product, index) => {
                      return (
                        <tr
                          key={index}
                          className="odd:bg-white even:bg-green-100 cursor-pointer text-black"
                        >
                          <th
                            scope="row"
                            className="py-1 font-medium text-gray-900 whitespace-nowrap text-center"
                          >
                            {product.productName}
                          </th>
                          <td className="py-1 text-center">
                            {product.productCategory}
                          </td>
                          <td className="py-1 text-center">{product.rate}</td>
                          <td className="py-1 capitalize text-center">
                            {product.quantity}
                          </td>
                          <td className="py-1 text-center">
                            {product.netWeight}
                          </td>
                          <td className="py-1 capitalize text-center">
                            {product.amount}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
