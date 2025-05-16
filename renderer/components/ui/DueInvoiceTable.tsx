import React from 'react';
import { FcMoneyTransfer } from 'react-icons/fc';

const DueInvoiceTable = ({ invoiceData, handlePaymentClick }) => {
  return (
    <section>
      <div className="h-[calc(100vh-190px)] overflow-x-auto border border-primary-600 md:rounded-lg">
        <table className="min-w-full divide-y divide-primary-600">
          <thead className="bg-primary-800 text-white sticky top-0">
            <tr>
              <th className="px-3 py-[2px] text-sm font-normal text-left">Invoice No</th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">Name</th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">Address</th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">Mobile</th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">Total Amt</th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">Paid Amt</th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">Discount</th>
              <th className="px-3 py-[2px] text-sm font-normal text-left">Dues</th>
              <th className="px-3 py-[2px] text-center text-sm font-normal">Action</th>
            </tr>
          </thead>
          <tbody className="bg-primary-50 divide-y divide-gray-200">
            {invoiceData?.map((invoice, index) => (
              <tr key={index} className={`cursor-pointer hover:bg-primary-200`}>
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
                  {invoice?.phone}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {`₹${invoice?.totalAmount}`}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {`₹${invoice?.payments?.reduce((sum, history) => sum + history.paidAmount, 0)}`}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {invoice?.discount}
                </td>
                <td className="px-2 py-[2px] text-sm font-medium whitespace-nowrap">
                  {invoice?.dueAmount}
                </td>
                <td className="flex justify-center gap-2 px-2 py-[2px] text-sm font-normal whitespace-nowrap">
                          {/* <button
                            type="button"
                            onClick={() => handleTableRowClick(invoice)}
                            className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-1 rounded-md active:scale-95 transition-all duration-300"
                          >
                            Details
                          </button> */}
                          <button
                            type="button"
                            onClick={() => handlePaymentClick(invoice)}
                            className="bg-primary-900 hover:bg-primary-800 text-white px-4 py-1 rounded-md active:scale-95 transition-all duration-300"
                          > Pay
                          </button>
                        </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default DueInvoiceTable;
