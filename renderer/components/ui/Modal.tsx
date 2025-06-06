import React, { useEffect, useState } from "react";
import { IoCloseSharp } from "react-icons/io5";
import { TbFileInvoice } from "react-icons/tb";
import { useRouter } from "next/router";
import moment from "moment";
import Button from "./Button";
import toast from "react-hot-toast";
import { APiRes } from "../../types";
import { ModalType } from "../../hooks/useModal";
import Input from "./Input";

interface ModalProps {
  type: ModalType | null;
  isOpen: boolean;
  onClose: () => void;
  modalData?: any;
}

const Modal: React.FC<ModalProps> = ({ type, isOpen, onClose, modalData }) => {
  const [invoiceData, setInvoiceData] = useState(undefined);
  const [pay, setPay] = useState(0);
  const router = useRouter();
  const [paymentDateCheck, setPaymentDateCheck] = useState(false);
  const [paymentDate, setPaymentDate] = useState("");

  const handlGenrateInvoice = () => {
    router.push("/dashboard/viewInvoice/");
  };

  const addPaymentAndUpdateInvoice = (modalData, paidAmount) => {
    const newDueAmount: number = invoiceData?.dueAmount - paidAmount;
    const newPaymentStatus: string =
      newDueAmount === 0 ? "Full Paid" : "Due Amount";

    const payment = {
      paidAmount: pay,
      createdAt:
        paymentDate.length === 0
          ? new Date()?.toISOString()
          : new Date(paymentDate).toISOString(),
    };

    let index;
    if (pay != 0) {
      index = modalData?.findIndex(
        (inv) => inv?.invoiceNo === invoiceData?.invoiceNo
      );
    }

    if (index !== -1) {
      modalData[index] = {
        ...modalData[index],
        dueAmount: newDueAmount,
        paymentStatus: newPaymentStatus,
      };
    }

    modalData[index]?.payments?.push(payment);
  };

  const handlePayAmount = () => {
    addPaymentAndUpdateInvoice(modalData, pay);

    window.ipc.send("payment", {
      invoiceNo: invoiceData?.invoiceNo,
      paymentDate,
      paidAmount: pay,
    });

    window.ipc.on("payment", (res: APiRes) => {
      if (!res.success) {
        setPay(0);
        setPaymentDate("");
        toast.error(res.message);
        return;
      }
      setPay(0);
      toast.success(res.message);
    });
    onClose();
  };

  useEffect(() => {
    const setinvoice = async () => {
      const jsonInvoice = localStorage.getItem("finalInvoice");
      const ObjInvoice = await JSON.parse(jsonInvoice);
      setInvoiceData(ObjInvoice);
    };
    setinvoice();
  }, [type, modalData]);

  useEffect(() => {
    const handleCloseModalByKey = (event) => {
      if (event.ctrlKey && event.key === "x") {
        onClose();
      } else if (event.key === "Enter") {
        event.preventDefault();
        if (type === "Invoice-Details") {
          handlGenrateInvoice();
        } else if (type === "Payment") {
          handlePayAmount(invoiceData);
        }
      }
    };

    window.addEventListener("keydown", handleCloseModalByKey);
    return () => {
      window.removeEventListener("keydown", handleCloseModalByKey);
    };
  }, [type]);

  useEffect(() => {
    if (!paymentDateCheck) {
      setPaymentDate("");
    }
  }, [paymentDateCheck]);

  if (!isOpen) return null;
  return (
    <>
      {type === "Invoice-Details" && (
        <div className="fixed z-[200] inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center p-2">
          <div className="bg-primary-50 border border-primary-900 rounded-lg shadow-xl max-w-[75rem] w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    <span>Reckon</span>
                    <span className="text-primary-900">Up</span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Jewellery Billing Software
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlGenrateInvoice}
                    className="p-2 text-primary-100 bg-primary-900 hover:bg-primary-950 rounded-lg flex gap-1 items-center active:scale-95 transition-all duration-300"
                    title="Genrate Invoice"
                  >
                    <TbFileInvoice className="w-5 h-5" />
                    Genrate
                  </button>
                  <button
                    onClick={() => {
                      localStorage.removeItem("finalInvoice");
                      onClose();
                    }}
                    className="p-2 text-white bg-red-400  hover:bg-red-500 rounded-lg"
                    title="Close"
                  >
                    <IoCloseSharp className="w-5 h-5 text-black active:scale-95 transition-all duration-300" />
                  </button>
                </div>
              </div>

              {/* Details */}
              <div className="border-t border-primary-900 pt-3 flex gap-2">
                <div className="w-1/2">
                  <div className="flex gap-2">
                    {/* Customer Details */}
                    <div className="w-1/2 bg-primary-100 border border-primary-500 text-primary-900 rounded-lg p-4">
                      <h5 className="font-bold text-primary-950">
                        Customer Details
                      </h5>
                      <div className="p-2 flex flex-col gap-1">
                        <div className="text-sm font-semibold">
                          <span>Name: </span>
                          <span className="capitalize">
                            {invoiceData?.name}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Number: </span>
                          <span className="capitalize">
                            {invoiceData?.phone}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Address: </span>
                          <span className="capitalize">
                            {invoiceData?.address}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Exchange Details */}
                    <div className="w-1/2 bg-primary-100 border border-primary-500 text-primary-900 rounded-lg p-4">
                      <h5 className="font-bold text-primary-950">
                        Exchange Details
                      </h5>
                      <div className="p-2 flex flex-col gap-1">
                        <div className="text-sm font-semibold">
                          <span>Category: </span>
                          <span className="capitalize">
                            {invoiceData?.exchangeCategory === "select"
                              ? "N/A"
                              : invoiceData?.exchangeCategory}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Weight: </span>
                          <span className="capitalize">
                            {`${
                              invoiceData?.exchangeWeight === "N/A"
                                ? "N/A"
                                : `${invoiceData?.exchangeWeight} gram`
                            }`}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Percentage: </span>
                          <span className="capitalize">
                            {`${
                              invoiceData?.exchangePercentage === "N/A"
                                ? "N/A"
                                : `${invoiceData?.exchangePercentage}%`
                            }`}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Amount: </span>
                          <span className="capitalize">
                            {`₹ ${
                              invoiceData?.exchangeAmount === "N/A"
                                ? "N/A"
                                : invoiceData?.exchangeAmount
                            }`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {/* Other Details */}
                    <div className="w-1/2 bg-primary-100 border border-primary-500 text-primary-900 mt-2 rounded-lg p-4">
                      <h5 className="font-bold text-primary-950">
                        Other Details
                      </h5>
                      <div className="p-2 flex flex-col gap-1">
                        <div className="text-sm font-semibold">
                          <span>Invoice No: </span>
                          <span className="capitalize">
                            {invoiceData?.invoiceNo}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Gross Amount: </span>
                          <span className="capitalize">{`₹${invoiceData?.grossAmount}`}</span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>GST(%): </span>
                          <span className="capitalize">
                            {`${
                              invoiceData?.gstPercentage === "N/A"
                                ? "0"
                                : `${invoiceData?.gstPercentage}%`
                            }     (₹${
                              invoiceData?.gstAmount === 0
                                ? "0"
                                : `${invoiceData?.gstAmount}`
                            })`}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Total Amount: </span>
                          <span className="capitalize">{`₹${invoiceData?.totalAmount}`}</span>
                        </div>
                      </div>
                    </div>
                    {/* payment Details */}
                    <div className="w-1/2 bg-primary-100 border border-primary-500 text-primary-900 mt-2 rounded-lg p-4">
                      <h5 className="font-bold text-primary-950">
                        Payment Details
                      </h5>
                      <div className="p-2 flex flex-col gap-1">
                        <div className="text-sm font-semibold">
                          <span>Total Amount: </span>
                          <span className="capitalize">{`₹${invoiceData?.totalAmount}`}</span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Paid Amount: </span>
                          <span className="capitalize">
                            {`₹${invoiceData?.payments.reduce(
                              (sum, history) => sum + history.paidAmount,
                              0
                            )}`}
                          </span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Discount: </span>
                          <span className="capitalize">{`₹${invoiceData?.discount}`}</span>
                        </div>
                        <div className="text-sm font-semibold">
                          <span>Due Amount: </span>
                          <span className="capitalize">{`₹${invoiceData?.dueAmount}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status */}
                  <div className="border bg-green-50  border-primary-800 text-primary-900 mt-2 rounded-lg py-2 px-4">
                    <h5 className="flex items-center justify-between font-bold text-primary-950 mb-2">
                      Payment Status
                      <p
                        className={`text-sm font-normal px-3 rounded-full py-0.5 ${
                          invoiceData?.dueAmount === 0
                            ? "bg-green-500 text-white"
                            : " bg-red-600 text-white"
                        }`}
                      >
                        {invoiceData?.paymentStatus}
                      </p>
                    </h5>
                    <div className="h-[85px] overflow-auto">
                      {invoiceData?.payments.map((payment, index) => {
                        return (
                          <div key={index} className="flex h-14">
                            <div
                              className={`${
                                index === 0 ? "bg-green-600" : "bg-gray-400"
                              } w-[5px] h-[85%] my-auto rounded-full`}
                            ></div>
                            <div className="w-full -translate-x-1">
                              <div className="flex justify-between px-3 font-bold text-primary-950 ">
                                <p className="">{index + 1} payment</p>
                                <p>{`₹${payment.paidAmount}`}</p>
                              </div>
                              <div className="flex justify-between px-3 font-bold text-primary-800 text-sm mt-1">
                                <p className="">
                                  {moment(payment.createdAt).format(
                                    "MMM DD, YYYY"
                                  )}
                                </p>
                                <p className="text-green-500  capitalize">
                                  paid
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="">
                  <div className="overflow-y-auto h-[484px] bg-primary-100 border border-primary-900 rounded-lg p-4">
                    <p className="mb-3 font-bold text-primary-950">
                      Product List:
                    </p>
                    <table className="min-w-full ">
                      <thead className="bg-primary-800 text-white sticky top-0 ">
                        <tr>
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
                            Category
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
                          >
                            Weight
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
                          >
                            Quantity
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
                          >
                            Making
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-2 font-normal text-sm w-[8rem] text-left rtl:text-right"
                          >
                            Amount
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData?.products?.map((product, index) => {
                          return (
                            <tr key={index}>
                              <td className="px-2 py-2  text-sm font-medium whitespace-nowrap ">
                                {product?.name}
                              </td>
                              <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                                {product?.category}
                              </td>
                              <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                                {product?.weight}
                              </td>
                              <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                                {product?.quantity}
                              </td>
                              <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                                {`${product?.makingCost}%`}
                              </td>
                              <td className="px-2 py-2 text-sm font-medium whitespace-nowrap">
                                {product?.amount}
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
      )}

      {type === "Payment" && (
        <div className="fixed inset-0 bg-black/60 bg-opacity-75 flex items-center justify-center p-4 z-[200]">
          <div className="bg-primary-50 border border-primary-900 rounded-lg shadow-xl max-w-[75rem] w-[500px]  max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    <span>Reckon</span>
                    <span className="text-primary-900">Up</span>
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Jewellery Billing Software
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      localStorage.removeItem("finalInvoice");
                      onClose();
                      setPay(0);
                    }}
                    className="p-2 text-white bg-red-400  hover:bg-red-500 rounded-lg"
                    title="Close"
                  >
                    <IoCloseSharp className="w-5 h-5 text-black active:scale-95 transition-all duration-300" />
                  </button>
                </div>
              </div>

              <div className="border-t border-primary-900 pt-3 flex flex-col gap-2">
                <h2 className="text-xl font-bold">Make Payment</h2>
                <div className="border border-primary-900 p-3 rounded-lg bg-primary-100">
                  <div className="text-base font-semibold">
                    <span>Total: </span>
                    <span>{`₹${invoiceData?.totalAmount}`}</span>
                  </div>
                  <div className="text-base font-semibold">
                    <span>Due: </span>
                    <span>{`₹${invoiceData?.dueAmount}`}</span>
                  </div>
                  <div>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={paymentDateCheck}
                        onChange={() => setPaymentDateCheck(!paymentDateCheck)}
                        className="accent-primary-700"
                      />
                      <label
                        htmlFor="customer"
                        className="text-sm font-semibold"
                      >
                        Select Payment Date (If Required)
                      </label>
                    </div>
                    <div className="ml-5">
                      <div className=" flex gap-2 items-center mb-2">
                        <label
                          htmlFor="date"
                          className={`${!paymentDateCheck && "text-gray-300"}`}
                        >
                          Date :
                        </label>
                        <Input
                          type="date"
                          value={paymentDate}
                          handleChangeText={(e) =>
                            setPaymentDate(e.target.value)
                          }
                          otherStyle="disabled:text-gray-300 disabled:border-gray-300"
                          disabled={!paymentDateCheck}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <label htmlFor="pay" className="font-bold text-primary-900">
                      Amount:{" "}
                    </label>
                    <input
                      type="number"
                      value={isNaN(pay) ? "" : pay}
                      min="0"
                      autoFocus={true}
                      onChange={(e) => setPay(e.target.valueAsNumber)}
                      onFocus={(e) => e.target.select()}
                      className={`bg-primary-100 border border-primary-800 text-primary-900 text-sm font-semibold rounded-md focus:outline-primary-900 inline-block py-1.5 px-2`}
                    />
                  </div>
                  <Button
                    buttonType="button"
                    title="Pay or Add"
                    handleClick={handlePayAmount}
                    extraClass="sm:w-auto mt-3"
                  />
                </div>
                <div>
                  <h2 className="font-bold mb-3">Payment History</h2>
                  <div className="h-[100px] overflow-auto">
                    {invoiceData?.payments.map((payment, index) => {
                      return (
                        <div key={index} className="flex h-14">
                          <div
                            className={`${
                              index === 0 ? "bg-green-600" : "bg-gray-400"
                            } w-[5px] h-[85%] my-auto rounded-full`}
                          ></div>
                          <div className="w-full -translate-x-1">
                            <div className="flex justify-between px-3 font-bold text-primary-950 ">
                              <p className="">{index + 1} payment</p>
                              <p>{`₹${payment.paidAmount}`}</p>
                            </div>
                            <div className="flex justify-between px-3 font-bold /text-primary-800 text-sm mt-1">
                              <p className="">
                                {moment(payment.createdAt).format(
                                  "MMM DD, YYYY"
                                )}
                              </p>
                              <p className="text-green-500  capitalize">paid</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Modal;
