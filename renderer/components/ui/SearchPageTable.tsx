import moment from "moment";
import React, { useState, useEffect } from "react";
import Pagination from "./Pagination";

const SearchPageTable = ({
  data,
  handleTableRowClick,
  currentPage,
  setCurrentPage,
  totalPages,
  handlePaymentClick,
}) => {
  const [selectedRow, setSelectedRow] = useState(0);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowDown") {
        setSelectedRow((prev) => Math.min(prev + 1, data.length - 1));
      } else if (event.key === "ArrowUp") {
        setSelectedRow((prev) => Math.max(prev - 1, 0));
      } else if (event.key === "Enter") {
        handleTableRowClick(data[selectedRow]);
      } else if (event.ctrlKey && event.key === "p") {
        handlePaymentClick(data[selectedRow]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedRow, data, handleTableRowClick, handlePaymentClick]);

  return (
    <section className="px-2">
      <div className="h-[calc(100vh-190px)] overflow-x-auto border border-primary-600 md:rounded-lg">
        <table className="min-w-full divide-y divide-primary-600">
          <thead className="bg-primary-800 text-white sticky top-0">
            <tr>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Invoice No
              </th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Name
              </th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Address
              </th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Mobile
              </th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Date
              </th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Total
              </th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Total Paid
              </th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Dues
              </th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-primary-50 divide-y divide-gray-200">
            {data?.map((invoice, index) => (
              <tr
                key={index}
                className={`cursor-pointer hover:bg-primary-200 ${
                  selectedRow === index ? "bg-primary-300" : ""
                }`}
              >
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {invoice?.invoiceNo}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium capitalize whitespace-nowrap">
                  {invoice?.name}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium capitalize whitespace-nowrap">
                  {invoice?.address}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {invoice.phone}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {moment(invoice.createdAt).format("MMM DD, YYYY")}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {`₹ ${invoice.totalAmount}`}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {invoice?.payments.reduce(
                    (sum, history) => sum + history.paidAmount,
                    0
                  )}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {invoice?.dueAmount}
                </td>
                <td className="flex justify-center gap-2 px-2 py-[2px] text-sm font-normal whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleTableRowClick(invoice)}
                    className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-1 rounded-md active:scale-95 transition-all duration-300"
                  >
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePaymentClick(invoice)}
                    className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-1 rounded-md active:scale-95 transition-all duration-300"
                  >
                    Pay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        totalPages={totalPages}
      />
    </section>
  );
};

export default SearchPageTable;
