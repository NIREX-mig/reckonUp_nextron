import React, { ReactElement, useEffect, useRef, useState } from "react";
import RootLayout from "../../components/rootLayout";
import { NextPageWithLayout } from "../_app";
import Head from "next/head";
import { FaArrowLeft } from "react-icons/fa";
import { FiPrinter } from "react-icons/fi";
import moment from "moment";
import { useRouter } from "next/router";
import { useReactToPrint } from "react-to-print";
import { APiRes } from "../../types";
import toast from "react-hot-toast";

const ViewInvoicePage: NextPageWithLayout = () => {
  const [finalInvoiceData, setFinalInvoiceData] = useState(undefined);
  const [setting, setSetting] = useState(undefined);
  const contentRef = useRef();
  const [qr, setQr] = useState(undefined);

  const router = useRouter();

  const reactToPrintFn = useReactToPrint({
    contentRef,
  });

  const handlePrintInvoice = () => {
    reactToPrintFn();
    localStorage.removeItem("finalInvoice");
  };

  useEffect(() => {
    const getsettingData = () => {
      window.ipc.send("fetchsetting", { finalInvoiceData });
      window.ipc.on("fetchsetting", (res: APiRes) => {
        if (res.success) {
          setSetting(res.data);
        } else {
          toast.error("Something Went Wrong!");
          router.back();
        }
      });
    };

    const getPaymentQrImage = () => {
      window.ipc.send("getqr", {});
      window.ipc.on("getqr", (res: APiRes) => {
        if (res.success) {
          setQr(res?.data);
        }
      });
    };

    const setinvoice = async () => {
      const jsonInvoice = localStorage.getItem("finalInvoice");
      const ObjInvoice = await JSON.parse(jsonInvoice);
      setFinalInvoiceData(ObjInvoice);
    };
    getPaymentQrImage();
    setinvoice();
    getsettingData();
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              localStorage.removeItem("finalInvoice");
              router.back();
            }}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="h-5 w-5" />
            Go Back
          </button>
          <button
            onClick={handlePrintInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-btn/95 text-white rounded-lg hover:bg-btn"
          >
            <FiPrinter className="h-5 w-5" />
            Print Invoice
          </button>
        </div>

        <div
          ref={contentRef}
          className="max-w-4xl mx-auto p-10 bg-white  text-zinc-900 rounded-lg text-sm"
        >
          <div className="flex justify-between items-center mb-2 font-semibold">
            <div>
              <h1 className="text-3xl font-bold text-green-600 mb-1">
                Invoice
              </h1>
              <p>Invoice No.: {finalInvoiceData?.invoiceNo}</p>
              <p>
                Date :{" "}
                {moment(finalInvoiceData?.createdAt).format("DD MMM YYYY")}
              </p>
            </div>
            <div className="text-right text-wrap w-[23rem]">
              <h2 className="text-3xl font-bold text-green-600 ">
                {setting?.shopName}
              </h2>
              <p className="capitalize">{setting?.address}</p>
              <p className="capitalize">Owner Name : {setting?.ownerName}</p>
              <p>{`${setting?.mobileNumber}, ${setting?.whatsappNumber}`}</p>
            </div>
          </div>

          <div className="mb-3">
            <div className="flex justify-between">
              <div>
                {finalInvoiceData?.exchange && (
                  <div className="mt-2 font-semibold">
                    <p className="font-bold">Exchange Details:</p>
                    <div>
                      <span>category : </span>
                      <span>
                        {finalInvoiceData?.exchangeCategory === "select"
                          ? "N/A"
                          : finalInvoiceData?.exchangeCategory}
                      </span>
                    </div>
                    <div>
                      <span>percentage : </span>
                      <span>{`${
                        finalInvoiceData?.exchangePercentage === null
                          ? "N/A"
                          : `${finalInvoiceData?.exchangePercentage}%`
                      }`}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-right font-semibold">
                <h2 className="font-bold text-green-600">BILL TO:</h2>
                <p className="capitalize">{finalInvoiceData?.customerName}</p>
                <p className="capitalize">
                  {finalInvoiceData?.customerAddress}
                </p>
                <p>{finalInvoiceData?.customerPhone}</p>
              </div>
            </div>
          </div>

          <table className="w-full mb-3">
            <thead>
              <tr className="border-b">
                <th className="text-center text-green-600">SNo</th>
                <th className="text-center w-[12rem] text-green-600">
                  Product Name
                </th>
                <th className="text-center text-green-600">Category</th>
                <th className="text-center text-green-600">Weight (g)</th>
                <th className="text-center text-green-600">Quantity</th>
                <th className="text-center text-green-600">Rate</th>
                <th className="text-center text-green-600">Making(%)</th>
                <th className="text-center text-green-600 w-[8rem]">Total</th>
              </tr>
            </thead>
            <tbody>
              {/* <tbody className="[&>*:nth-child(even)]:bg-green-200"> */}
              {finalInvoiceData?.productList.map((product, index) => {
                return (
                  <tr key={index} className="border-b font-semibold">
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

          <div className={`flex justify-between mb-2`}>
            <div className="absolute w-[140px] h-[140px]">
              <img
                src={qr}
                alt="QR-code"
                className="w-[140px] h-[140px] object-contain"
              />
            </div>

            <div></div>

            <div className="w-1/3">
              <div className="flex justify-between font-semibold">
                <span>Subtotal :</span>
                <span>{`₹ ${finalInvoiceData?.grossAmt}`}</span>
              </div>
              {finalInvoiceData?.GST && (
                <>
                  <div className="flex justify-between font-semibold">
                    <span>{`GST(${finalInvoiceData?.GSTPercentage}%) :`}</span>
                    <span>{`₹ ${finalInvoiceData?.GSTAMT}`}</span>
                  </div>
                </>
              )}
              {finalInvoiceData?.exchange && (
                <div className="flex justify-between font-semibold">
                  <span>{`Exchange Amt :`}</span>
                  <span>{`₹ ${finalInvoiceData?.exchangeAmt}`}</span>
                </div>
              )}
              <div className="flex justify-between font-bold border-t border-zinc-300 mt-1 pt-1">
                <span>Total:</span>
                <span>{` ₹ ${finalInvoiceData?.totalAmt}`}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="mb-2 w-1/3"></div>
            <div className="my-5">
              <div className="">
                <p className="text-gray-400">Signature</p>
                <p className="border-t w-40"></p>
              </div>
              <div>
                <p className="text-gray-400">MM / DD / YYYY</p>
              </div>
            </div>
          </div>
          <div className="bg-green-600 text-center py-1 mt-3 capitalize">
            THANK YOU FOR YOU BUSINESS WITH US!
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

ViewInvoicePage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default ViewInvoicePage;
