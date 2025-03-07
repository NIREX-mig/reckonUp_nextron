import moment from "moment";
import React from "react";
import { FcMoneyTransfer } from "react-icons/fc";

const SearchPageTable = ({
  data,
  handleTableRowClick,
  currentPage,
  setCurrentPage,
  totalPages,
  handlePaymentClick,
}) => {
  return (
    <section className="px-4">
      <div className="h-[calc(100vh-230px)] overflow-x-auto border border-primary-600 md:rounded-lg">
        <table className="min-w-full divide-y divide-primary-600 ">
          <thead className="bg-primary-800 text-white sticky top-0 ">
            <tr>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Invoice No
              </th>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Address
              </th>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Mobile
              </th>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Date
              </th>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Total
              </th>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Total Paid
              </th>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Dues
              </th>
              <th
                scope="col"
                className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
              >
                Details
              </th>
            </tr>
          </thead>
          <tbody className="bg-primary-50 divide-y divide-gray-200">
            {data?.map((invoice , index : number) => {
              return (
                <tr key={index}>
                  <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                    {invoice?.invoiceNo}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium capitalize whitespace-nowrap">
                    {invoice?.customerName}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium capitalize whitespace-nowrap">
                    {invoice?.customerAddress}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                    {invoice.customerPhone === null
                      ? "N/A"
                      : invoice.customerPhone}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                    {moment(invoice.createdAt).format("MMM DD, YYYY")}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                    {`₹ ${invoice.totalAmt}`}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                    {invoice?.paymentHistory.reduce(
                      (sum: any, history: { paidAmount: any }) =>
                        sum + history.paidAmount,
                      0
                    )}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                    {
                      invoice?.paymentHistory[invoice.paymentHistory.length - 1]
                        ?.dueAmount
                    }
                  </td>
                  <td className="flex justify-center gap-2 px-2 py-2 text-sm font-normal whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleTableRowClick(invoice)}
                      className="bg-btn text-white px-4 py-1 rounded-md active:scale-95 transition-all duration-300"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePaymentClick(invoice)}
                      className="bg-btn text-white px-4 py-1 rounded-md active:scale-95 transition-all duration-300"
                    >
                      <FcMoneyTransfer size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="flex items-center px-5 py-2 text-sm text-white capitalize bg-btn border rounded-md gap-x-2 hover:bg-btn/95 disabled:bg-btn/50 cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-all duration-300"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 rtl:-scale-x-100"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18"
            />
          </svg>
          <span>previous</span>
        </button>

        <div className="items-center font-semibold md:flex gap-x-3">
          {` Page ${currentPage} of ${totalPages} `}
        </div>

        <button
          onClick={() =>
            setCurrentPage((prev: number) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className="flex items-center px-5 py-2 text-sm text-white capitalize bg-btn border rounded-md gap-x-2 hover:bg-btn/95  disabled:bg-btn/50 cursor-pointer disabled:cursor-not-allowed active:scale-95 transition-all duration-300"
        >
          <span>Next</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 rtl:-scale-x-100"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3"
            />
          </svg>
        </button>
      </div>
    </section>
  );
};

export default SearchPageTable;
