import React, { useState } from "react";
import Button from "../ui/Button";
import toast from "react-hot-toast";
import { APiRes } from "../../types";
import SelectDate from "./SelectDate";
import { AiOutlineLoading } from "react-icons/ai";

const ExportToExel = () => {
  const [date, setDate] = useState({
    start: "",
    end: "",
  });
  const [loading, setLoading] = useState(false);

  const [invoiceCheck, setInvoiceCheck] = useState(true);
  const [customerCheck, setCustoemrCheck] = useState(true);
  const [exchangeCheck, setExchangeCheck] = useState(false);
  const [productCheck, setProductCheck] = useState(true);
  const [paymentCheck, setPaymentCheck] = useState(false);

  const [invoiceDetailsCheck, setInvoiceDetailsCheck] = useState({
    invoiceNo: true,
    gstPercentage: false,
    gstAmount: false,
    discount: true,
    grossAmount: false,
    totalAmount: true,
    dueAmount: true,
    paymentStatus: false,
    createdAt: false,
  });
  const [customerDetailsCheck, setCustomerDetailsCheck] = useState({
    name: true,
    phone: true,
    address: true,
  });
  const [exchangeDetailsCheck, setExchangeDetailsCheck] = useState({
    category: false,
    weight: false,
    percentage: false,
    amount: false,
  });
  const [productDetailsCheck, setProductDetailsCheck] = useState({
    ProName: true,
    ProWeight: true,
    ProCategory: true,
    ProQuantity: true,
    ProAmount: true,
    ProRate: false,
    ProMaking: true,
  });
  const [paymentDetailsCheck, setPaymentDetailsCheck] = useState({
    TotalPaid: false,
  });

  const invoiceDetails = [
    { label: "Invoice No.", select: "invoiceNo" },
    { label: "Gst Percentage", select: "gstPercentage" },
    { label: "Gst Amount", select: "gstAmount" },
    { label: "Discount", select: "discount" },
    { label: "Gross Amount", select: "grossAmount" },
    { label: "Total Amount", select: "totalAmount" },
    { label: "Due Amount", select: "dueAmount" },
    { label: "Payment Status", select: "paymentStatus" },
    { label: "Invoice Date", select: "createdAt" },
  ];

  const customerDetails = [
    { label: "Name", select: "name" },
    { label: "Phone No.", select: "phone" },
    { label: "Address", select: "address" },
  ];

  const exchangeDetails = [
    { label: "Category", select: "category" },
    { label: "Weight", select: "weight" },
    { label: "Percentage", select: "percentage" },
    { label: "Amount", select: "amount" },
  ];

  const productsDetails = [
    { label: "Name", select: "ProName" },
    { label: "Weight", select: "ProWeight" },
    { label: "Category", select: "ProCategory" },
    { label: "Quentity", select: "ProQuantity" },
    { label: "Rate", select: "ProRate" },
    { label: "Amount", select: "ProAmount" },
    { label: "MakingCost( In % )", select: "ProMaking" },
  ];

  const paymentsDetails = [{ label: "Total Paid Amount", select: "TotalPaid" }];

  const handleExportToExcel = () => {
    const exportdata = {
      date: date,
      invoiceNo: invoiceDetailsCheck.invoiceNo,
      name: customerDetailsCheck.name,
      phone: customerDetailsCheck.phone,
      address: customerDetailsCheck.address,
      ExchangeCategory: exchangeDetailsCheck.category,
      ExchangeWeight: exchangeDetailsCheck.weight,
      ExchangePercentage: exchangeDetailsCheck.percentage,
      ExchangeAmount: exchangeDetailsCheck.amount,
      ProName: productDetailsCheck.ProName,
      ProWeight: productDetailsCheck.ProWeight,
      ProCategory: productDetailsCheck.ProCategory,
      ProQuantity: productDetailsCheck.ProQuantity,
      ProAmount: productDetailsCheck.ProAmount,
      ProRate: productDetailsCheck.ProRate,
      ProMaking: productDetailsCheck.ProMaking,
      gstPercentage: invoiceDetailsCheck.gstPercentage,
      gstAmount: invoiceDetailsCheck.gstAmount,
      discount: invoiceDetailsCheck.discount,
      grossAmount: invoiceDetailsCheck.grossAmount,
      totalAmount: invoiceDetailsCheck.totalAmount,
      TotalPaid: paymentDetailsCheck.TotalPaid,
      dueAmount: invoiceDetailsCheck.dueAmount,
      paymentStatus: invoiceDetailsCheck.paymentStatus,
      createdAt: invoiceDetailsCheck.createdAt,
    };

    setLoading(true);
    if (date.start === "" && date.end === "") {
      setLoading(false);
      toast.error("Date not selected!");
      return;
    }
    window.ipc.send("export2excel", exportdata);

    window.ipc.on("export2excel", (res: APiRes) => {
      if (!res.success) {
        setLoading(false);
        setDate({
          start: "",
          end: "",
        });
        toast.error(res.message);
        return;
      }
      setLoading(false);
      setDate({
        start: "",
        end: "",
      });
      toast.success("Saved Successfully.");
    });
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4 text-primary-900 ">
        Export Invoices in Excal
      </h2>
      <div className="w-full h-full">
        <div>
          <label className=" flex flex-col font-medium text-primary-700 mb-1">
            <span className="my-2">
              {
                "Note : Invoice Details, Customer Details, Exchange Details these data are Exportes"
              }
            </span>
          </label>
        </div>

        <div className="w-1/2">
          <label className=" flex gap-5 font-medium text-primary-700 mb-1">
            <span className="my-2">Select Date : </span>
            <SelectDate date={date} setDate={setDate} />
          </label>
        </div>

        <div className="flex flex-col gap-3 mb-3">
          <label htmlFor="details" className="text-xl font-semibold">
            Select Feilds to Export
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Invoice Details */}
            <div className=" border border-primary-400 p-3 rounded-md ">
              <div className=" flex gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={invoiceCheck}
                  onChange={() => setInvoiceCheck(!invoiceCheck)}
                  className="accent-primary-700"
                />
                <label htmlFor="invoice" className={`text-lg`}>
                  Invoice Details
                </label>
              </div>
              <div className="ml-5 grid grid-cols-2">
                {invoiceDetails.map((item, i) => {
                  return (
                    <div key={i} className=" flex gap-2">
                      <input
                        type="checkbox"
                        disabled={!invoiceCheck}
                        className="accent-primary-700"
                        checked={invoiceDetailsCheck[item.select] || false}
                        onChange={(e) =>
                          setInvoiceDetailsCheck((prev) => ({
                            ...prev,
                            [item.select]: e.target.checked,
                          }))
                        }
                      />
                      <label
                        htmlFor={item.label}
                        className={`${!invoiceCheck && "text-gray-300"}`}
                      >
                        {item.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Customer Details */}
            <div className=" border border-primary-400 p-3 rounded-md">
              <div className=" flex gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={customerCheck}
                  onChange={() => setCustoemrCheck(!customerCheck)}
                  className="accent-primary-700"
                />
                <label htmlFor="customer" className={`text-lg`}>
                  Customer Details
                </label>
              </div>
              <div className="ml-5">
                {customerDetails.map((item, i) => {
                  return (
                    <div key={i} className=" flex gap-2">
                      <input
                        type="checkbox"
                        disabled={!customerCheck}
                        className="accent-primary-700"
                        checked={customerDetailsCheck[item.select] || false}
                        onChange={(e) =>
                          setCustomerDetailsCheck((prev) => ({
                            ...prev,
                            [item.select]: e.target.checked,
                          }))
                        }
                      />
                      <label
                        htmlFor={item.label}
                        className={`${!customerCheck && "text-gray-300"}`}
                      >
                        {item.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Exchange Details */}
            <div className=" border border-primary-400 p-3 rounded-md">
              <div className=" flex gap-2 mb-2">
                <input
                  type="checkbox"
                  className="accent-primary-700"
                  checked={exchangeCheck}
                  onChange={() => setExchangeCheck(!exchangeCheck)}
                />
                <label htmlFor="exchange" className={`text-lg `}>
                  Exchange Details
                </label>
              </div>
              <div className="ml-5 ">
                {exchangeDetails.map((item, i) => {
                  return (
                    <div key={i} className=" flex gap-2">
                      <input
                        type="checkbox"
                        className="accent-primary-700"
                        disabled={!exchangeCheck}
                        checked={exchangeDetailsCheck[item.select] || false}
                        onChange={(e) =>
                          setExchangeDetailsCheck((prev) => ({
                            ...prev,
                            [item.select]: e.target.checked,
                          }))
                        }
                      />
                      <label
                        htmlFor={item.label}
                        className={`${!exchangeCheck && "text-gray-300"}`}
                      >
                        {item.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Product Details */}
            <div className=" border border-primary-400 p-3 rounded-md">
              <div className=" flex gap-2 mb-2">
                <input
                  type="checkbox"
                  className="accent-primary-700"
                  checked={productCheck}
                  onChange={() => setProductCheck(!productCheck)}
                />
                <label htmlFor="product" className={`text-lg `}>
                  Products Details
                </label>
              </div>
              <div className="ml-5 grid grid-cols-2">
                {productsDetails.map((item, i) => {
                  return (
                    <div key={i} className=" flex gap-2">
                      <input
                        type="checkbox"
                        className="accent-primary-700"
                        disabled={!productCheck}
                        checked={productDetailsCheck[item.select] || false}
                        onChange={(e) =>
                          setProductDetailsCheck((prev) => ({
                            ...prev,
                            [item.select]: e.target.checked,
                          }))
                        }
                      />
                      <label
                        htmlFor={item.label}
                        className={`${!productCheck && "text-gray-300"}`}
                      >
                        {item.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* payments Details */}
            <div className=" border border-primary-400 p-3 rounded-md">
              <div className=" flex gap-2 mb-2">
                <input
                  type="checkbox"
                  className="accent-primary-700"
                  checked={paymentCheck}
                  onChange={() => setPaymentCheck(!paymentCheck)}
                />
                <label htmlFor="payment" className={`text-lg `}>
                  Payments Details
                </label>
              </div>
              <div className="ml-5 grid grid-cols-2">
                {paymentsDetails.map((item, i) => {
                  return (
                    <div key={i} className=" flex gap-2">
                      <input
                        type="checkbox"
                        className="accent-primary-700"
                        disabled={!paymentCheck}
                        checked={paymentDetailsCheck[item.select] || false}
                        onChange={(e) =>
                          setPaymentDetailsCheck((prev) => ({
                            ...prev,
                            [item.select]: e.target.checked,
                          }))
                        }
                      />
                      <label
                        htmlFor={item.label}
                        className={`${!paymentCheck && "text-gray-300"}`}
                      >
                        {item.label}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        <Button
          buttonType="button"
          title="Export to Excel"
          extraClass="w-auto py-2"
          handleClick={handleExportToExcel}
          loading={loading}
          icon={<AiOutlineLoading size={20} />}
        />
      </div>
    </section>
  );
};

export default ExportToExel;
