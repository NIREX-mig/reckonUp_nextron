import moment from "moment";
import React from "react";
import { FcMoneyTransfer } from "react-icons/fc";

const DashboardPageTable = ({
  data,
  handleTableRowClick,
  handlePaymentClick,
}) => {
  return (
    <section className="">
      <div className="h-[calc(100vh-130px)] overflow-x-auto border border-primary-600 md:rounded-lg">
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
                Payment
              </th>
            </tr>
          </thead>
          <tbody className="bg-primary-50 divide-y divide-gray-200">
            {data?.map((invoice, index) => {
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
                      (sum, history) => sum + history.paidAmount,
                      0
                    )}
                  </td>
                  <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                    {
                      invoice?.paymentHistory[invoice.paymentHistory.length - 1]
                        ?.dueAmount
                    }
                  </td>
                  <td className=" flex gap-2 items-center px-2 py-2 text-sm font-normal whitespace-nowrap">
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
    </section>
  );
};

export default DashboardPageTable;
