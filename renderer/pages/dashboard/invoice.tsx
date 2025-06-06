import React, { ReactElement, useEffect, useState } from "react";
import RootLayout from "../../components/rootLayout";
import { NextPageWithLayout } from "../_app";
import Head from "next/head";
import { HiRefresh } from "react-icons/hi";
import { MdDownloadDone } from "react-icons/md";
import { useRouter } from "next/router";
import ProductTable from "../../components/ui/ProductTable";
import {
  APiRes,
  CustomerDetails,
  ExchangeDetails,
  finalInvoice,
  Product,
} from "../../types";
import Header from "../../components/ui/Header";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import toast from "react-hot-toast";

const InvoicePage: NextPageWithLayout = () => {
  const router = useRouter();

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    phone: "",
    address: "",
  });

  const [exchangeDetails, setExchangeDetails] = useState<ExchangeDetails>({
    exchangeCategory: "select",
    exchangeWeight: 0,
    exchangePercentage: 0,
    exchangeAmount: 0,
  });

  const [paymentDetails, setPaymentDetails] = useState({
    pay: 0,
    discount: 0,
  });

  const [exchange, setExchange] = useState(false);

  const [productDetails, setProductDetails] = useState<Product>({
    name: "",
    category: "gold",
    weight: 0,
    quantity: 0,
    rate: 0,
    makingCost: 0,
  });

  const [invoiceNo, setInvoiceNo] = useState<string>("");

  const [checkedbox, setcheckedbox] = useState(false);

  const [grossAmt, setGrossAmt] = useState(0);

  const [GST, setGST] = useState(0);
  const [GSTAMT, setGSTAMT] = useState(0);

  const [productList, setProductList] = useState([]);

  let totalAmt = Math.round(grossAmt + GSTAMT - exchangeDetails.exchangeAmount);
  let due = Math.max(
    0,
    Math.round(totalAmt - paymentDetails.pay - paymentDetails.discount)
  );

  const genrateInvoiceNo = async () => {
    window.ipc.send("totalcountofinvoice", {});

    window.ipc.on("totalcountofinvoice", (res: APiRes) => {
      if (res.success) {
        const invoiceno = `INV${(res.data + 1).toString().padStart(3, "0")}`;
        setInvoiceNo(invoiceno);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    // convert rate, weight and quentity for preform find amount calculation
    let rate = productDetails.rate;
    let weight = productDetails.weight;
    let quantity = productDetails.quantity;
    let makingCostPercentage = productDetails.makingCost;

    // calculate product amount using <(rate / 10) * weight> formula
    let amount: number = parseInt(((rate / 10) * weight).toFixed(2));

    // conver making cost in Rupees
    const makingCostInRupee = (amount * makingCostPercentage) / 100;
    amount = parseFloat((amount + makingCostInRupee).toFixed(2));

    // create a single final product with all calculation
    let singleProduct: Product = {
      name: String(productDetails.name),
      category: String(productDetails.category),
      weight: Number(weight),
      quantity: Number(quantity),
      rate: Number(rate),
      amount: Number(amount),
      makingCost: Number(productDetails.makingCost),
    };

    // set singleProduct object in productList array
    productList.push(singleProduct);

    // After set singleProduct in array clear product section
    setProductDetails({
      rate: 0,
      quantity: 0,
      name: "",
      weight: 0,
      category: "gold",
      makingCost: 0,
    });

    // calculate grossAmount
    let grossamount = productList.reduce(
      (total, item) => total + item.amount,
      0
    );

    // set GrossAmount and totalAmount
    setGrossAmt(parseFloat(grossamount.toFixed(2)));
  };

  const handleGenrateInvoice = () => {
    if (customerDetails.name.length === 0) {
      toast.error("Add Customer Details!");
      return;
    }

    /// check before submit productList is not Empty
    if (productList.length === 0) {
      toast.error("Add Atleast One Product!");
      return;
    }

    let invoiceData: finalInvoice = {
      // customer Details
      name: customerDetails.name.toLowerCase(),
      phone: customerDetails.phone,
      address: customerDetails.address,

      // exchange Details
      exchange: String(exchange),
      exchangeCategory: exchangeDetails.exchangeCategory,
      exchangeWeight: exchangeDetails.exchangeWeight,
      exchangePercentage: exchangeDetails.exchangePercentage,
      exchangeAmount: exchangeDetails.exchangeAmount,

      // product Details
      products: productList,

      // gst Details
      gst: String(checkedbox),
      gstPercentage: GST,
      gstAmount: GSTAMT,

      // invoice Details,
      grossAmount: grossAmt,
      totalAmount: totalAmt,

      // payment details
      discount: paymentDetails.discount,
      payments: {
        paidAmount: paymentDetails.pay,
        dueAmount: due,
      },
    };

    // set invoice Data in localStorage
    const jsonInvoice = JSON.stringify(invoiceData);
    localStorage.setItem("finalInvoice", jsonInvoice);

    // save invoice in database
    window.ipc.send("createinvoice", { invoiceData });

    window.ipc.on("createinvoice", (res: APiRes) => {
      if (res.success) {
        toast.success(res.message);
        setTimeout(() => {
          router.push("/dashboard/viewInvoice/");
        }, 500);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleClearInvoice = () => {
    setCustomerDetails({
      name: "",
      phone: "",
      address: "",
    });
    setExchangeDetails({
      exchangeCategory: "select",
      exchangeWeight: 0,
      exchangePercentage: 0,
      exchangeAmount: 0,
    });
    setProductDetails({
      name: "",
      category: "gold",
      weight: 0,
      rate: 0,
      quantity: 0,
      makingCost: 0,
    });
    setPaymentDetails({
      pay: 0,
      discount: 0,
    });
    setcheckedbox(false);
    setGST(0);
    setGSTAMT(0);
    setGrossAmt(0);
    setProductList([]);
  };

  const handleMakingCostChange = (e) => {
    const inputValue = e.target.value;

    // Allow empty input or numbers between 0 and 100
    if (
      inputValue === "" ||
      (Number(inputValue) >= 0 && Number(inputValue) <= 100)
    ) {
      setProductDetails((prev) => ({
        ...prev,
        makingCost: inputValue,
      }));
    }
  };

  const handleMakingCostBlur = () => {
    if (productDetails.makingCost === undefined) return; // Allow empty value
    const numericValue = Number(productDetails.makingCost);
    if (numericValue < 0) {
      setProductDetails((prev) => ({
        ...prev,
        makingCost: 0,
      }));
    } else if (numericValue > 100) {
      setProductDetails((prev) => ({
        ...prev,
        makingCost: 100,
      }));
    }
  };

  const handleGstChange = (e) => {
    const inputValue = e.target.value;

    // Allow empty input or numbers between 0 and 100
    if (
      inputValue === "" ||
      (parseFloat(inputValue) >= 0.0 && parseFloat(inputValue) <= 100)
    ) {
      setGST(inputValue);
    }

    // convert gst percentage to rupees
    const gstInRupee = Number(((grossAmt * inputValue) / 100).toFixed(0));

    // set gst amount
    setGSTAMT(gstInRupee);
  };

  const handleGstBlur = () => {
    if (GST === undefined) return; // Allow empty value
    const numericValue = Number(GST);
    if (numericValue < 0.0) setGST(0);
    else if (numericValue > 100.0) setGST(100);
  };

  const handlePayOnBlur = () => {
    if (paymentDetails.pay === undefined) return; // Allow empty value

    if (paymentDetails.pay <= 0) {
      setPaymentDetails((prev) => ({
        ...prev,
        pay: 0,
      }));
    } else if (paymentDetails.pay >= totalAmt) {
      setPaymentDetails((prev) => ({
        ...prev,
        pay: totalAmt,
      }));
    }
  };

  useEffect(() => {
    genrateInvoiceNo();
    handleClearInvoice();
  }, [router]);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="p-1 bg-primary-50 h-[calc(100%-16px)] overflow-auto rounded-xl m-2">
        <Header title="Create Invoice" extraStyle="" />

        {/* Invoice Details section */}
        <section className="flex-col lg:flex-row w-full lg:h-[14rem] mt-2 flex gap-1">
          <div className="p-2 bg-primary-50 rounded-lg border border-primary-500 lg:w-[22rem] w-full ">
            <h2 className="font-bold text-primary-800">Customer Details</h2>
            {/* customer detail  */}
            <div className="py-4 w-[19rem]">
              <Input
                title="Customer name"
                lableStyle="text-primary-900"
                otherStyle="mb-2"
                type="text"
                value={customerDetails.name}
                handleChangeText={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Customer Name"
              />

              <Input
                title="Phone No"
                lableStyle="text-primary-900"
                otherStyle="mb-2"
                type="number"
                min="0"
                value={customerDetails.phone}
                handleChangeText={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="Phone number"
              />

              <Textarea
                title="Address"
                row={2}
                value={customerDetails.address}
                handleTextChange={(e) =>
                  setCustomerDetails((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="address"
              />
            </div>
          </div>

          {/* Exchange Detail section  */}
          <div className="p-2 bg-primary-50 rounded-lg border border-primary-500 w-[300px]">
            <div className="flex justify-between">
              <h2 className="font-bold text-primary-800">Exchange Details</h2>
              <Switch
                isSwitchOn={exchange}
                setSwitchOn={setExchange}
                setExchangeDetails={setExchangeDetails}
              />
            </div>
            <div>
              <div>
                <div className="w-[17rem]">
                  {/* Exchange product Name section   */}
                  <div className="flex items-center gap-2 mb-2 justify-end">
                    <label
                      htmlFor="category"
                      className={`text-sm font-medium ${
                        !exchange ? "text-gray-300" : "text-primary-900"
                      }`}
                    >
                      Product Category:
                    </label>
                    <select
                      value={exchangeDetails.exchangeCategory}
                      onChange={(e) =>
                        setExchangeDetails((prev) => ({
                          ...prev,
                          exchangeCategory: e.target.value,
                        }))
                      }
                      disabled={!exchange}
                      className="bg-primary-100 border border-primary-800 disabled:border-gray-300 text-gray-900 text-sm rounded-md focus:outline-primary-900 block py-1.5 px-5"
                    >
                      <option defaultValue="select" className="p-2">
                        Select
                      </option>
                      <option value="gold" className="p-2">
                        Gold
                      </option>
                      <option value="silver" className="p-2">
                        Silver
                      </option>
                    </select>
                  </div>

                  {/* exchange product weight section */}
                  <Input
                    title="Weight"
                    lableStyle={
                      !exchange ? "text-gray-300" : "text-primary-900"
                    }
                    otherStyle="disabled:border-gray-300 mb-2 "
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      isNaN(exchangeDetails.exchangeWeight)
                        ? ""
                        : exchangeDetails.exchangeWeight
                    }
                    handleChangeText={(e) =>
                      setExchangeDetails((prev) => ({
                        ...prev,
                        exchangeWeight: e.target.valueAsNumber,
                      }))
                    }
                    placeholder="Weight"
                    disabled={!exchange}
                  />
                  {/* exchange product percentage section  */}
                  <Input
                    title="percentage"
                    lableStyle={
                      !exchange ? "text-gray-300" : "text-primary-900"
                    }
                    otherStyle="disabled:border-gray-300 mb-2 "
                    type="number"
                    min="0"
                    value={
                      isNaN(exchangeDetails.exchangePercentage)
                        ? ""
                        : exchangeDetails.exchangePercentage
                    }
                    handleChangeText={(e) =>
                      setExchangeDetails((prev) => ({
                        ...prev,
                        exchangePercentage: e.target.valueAsNumber,
                      }))
                    }
                    disabled={!exchange}
                    placeholder="Percentage"
                  />
                </div>
                {/* exchange product amount section  */}
                <div className="flex ">
                  <Input
                    title="Amount"
                    lableStyle={
                      !exchange ? "text-gray-300" : "text-primary-900"
                    }
                    otherStyle="w-[100px] disabled:border-gray-300 mb-2 "
                    type="number"
                    min="0"
                    value={
                      isNaN(exchangeDetails.exchangeAmount)
                        ? ""
                        : exchangeDetails.exchangeAmount
                    }
                    handleChangeText={(e) => {
                      setExchangeDetails((prev) => ({
                        ...prev,
                        exchangeAmount: e.target.valueAsNumber,
                      }));
                    }}
                    disabled={!exchange}
                    placeholder="Amount"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Detail Section  */}
          <div className="p-3 bg-primary-50 rounded-lg border border-primary-500 w-full">
            <div className="flex justify-between">
              <h2 className="font-bold text-primary-800">Product Details</h2>
              {/* invoice number  */}
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium text-primary-900">
                  Invoice No:
                </span>
                <span className="font-semibold text-primary-800">
                  {invoiceNo}
                </span>

                <HiRefresh
                  size={25}
                  className="hover:cursor-pointer active:animate-spin"
                  onClick={genrateInvoiceNo}
                />
              </div>
            </div>

            {/* product rate and category and quintity  */}
            <form onSubmit={handleAddProduct}>
              <div className="p-2">
                <div className="flex gap-4">
                  {/* product rate  */}
                  <Input
                    title="Rate(10g)"
                    lableStyle="text-primary-800"
                    otherStyle="w-[120px]"
                    type="number"
                    min="0"
                    value={productDetails.rate}
                    handleChangeText={(e) =>
                      setProductDetails((prev) => ({
                        ...prev,
                        rate: e.target.value,
                      }))
                    }
                    placeholder="rate"
                  />

                  {/*  product category  */}
                  <div className="flex items-center gap-2 mb-2">
                    <label
                      htmlFor="product"
                      className="text-sm font-medium text-primary-800"
                    >
                      Category:
                    </label>
                    <select
                      value={productDetails.category}
                      onChange={(e) =>
                        setProductDetails((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="bg-primary-50 font-medium border border-primary-800 text-primary-900 text-sm rounded-md focus:outline-primary-900 block p-1.5"
                    >
                      <option defaultValue="gold" className="font-medium">
                        gold
                      </option>
                      <option value="silver" className="font-medium">
                        silver
                      </option>
                    </select>
                  </div>

                  {/* product quantity */}
                  <Input
                    title="Quantity"
                    lableStyle="text-primary-800"
                    otherStyle="w-[60px]"
                    type="number"
                    min="0"
                    value={productDetails.quantity}
                    handleChangeText={(e) =>
                      setProductDetails((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                    placeholder="Quantity"
                  />
                </div>
              </div>

              {/* product name and weight and making cost */}
              <div className="flex gap-3">
                {/* product name  */}
                <Input
                  title="Product"
                  lableStyle="text-primary-800"
                  otherStyle="w-[200px]"
                  type="text"
                  value={productDetails.name}
                  handleChangeText={(e) =>
                    setProductDetails((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Product Name"
                />

                {/* making cost */}
                <Input
                  title="Making Cost(in %)"
                  lableStyle="text-primary-800"
                  otherStyle="w-[150px] mb-2"
                  type="number"
                  min="0"
                  value={productDetails.makingCost}
                  handleChangeText={handleMakingCostChange}
                  handleOnBlur={handleMakingCostBlur}
                />
              </div>
              <div>
                {/* product weight  and add button  */}
                <div className="flex justify-between">
                  {/* product weight  */}
                  <Input
                    title="Net Weight(gram)"
                    lableStyle="text-primary-800"
                    type="number"
                    min="0"
                    step="0.001"
                    value={productDetails.weight}
                    handleChangeText={(e) =>
                      setProductDetails((prev) => ({
                        ...prev,
                        weight: e.target.value,
                      }))
                    }
                    placeholder="Net Weight"
                  />

                  {/* product add button  */}

                  <Button
                    buttonType="submit"
                    extraClass="sm:w-auto px-8 py-2 flex gap-2"
                    icon={<MdDownloadDone size={20} />}
                    title="Add"
                  />
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* add invoice tabel  */}
        <section className="mt-1">
          <ProductTable
            productList={productList}
            setProductList={setProductList}
            grossAmt={grossAmt}
            setGrossAmt={setGrossAmt}
            setGSTAMT={setGSTAMT}
            gst={GST}
          />
        </section>

        {/* total Amount section  */}
        <section className="w-full h-[130px] p-2 border rounded-lg mt-1 flex justify-between bg-primary-50 border-primary-500">
          {/* print and clear Button section */}
          <div className="my-auto flex gap-3 ">
            <Button
              title="Genrate Invoice"
              buttonType="button"
              extraClass="sm:w-auto mb-2 font-medium"
              handleClick={handleGenrateInvoice}
            />
            <button
              type="button"
              onClick={handleClearInvoice}
              className="text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:outline-none focus:ring-purple-600 font-medium rounded-md w-full sm:w-auto px-6 py-2.5 text-center flex gap-3 mb-2 active:scale-95 transition-all duration-300"
            >
              Clear invoice
            </button>
          </div>

          {/*  gst section and discount */}
          <div>
            <div className="flex gap-2 items-center h-5 mb-2">
              <input
                type="checkbox"
                className="w-4 h-4 border border-primary-900 rounded bg-primary-100 focus:outline-primary-600 accent-primary-900"
                onChange={() => {
                  setcheckedbox(!checkedbox);
                  setGST(0);
                  setGSTAMT(0);
                }}
                checked={checkedbox}
                required
              />
              <label className="">GST INVOICE</label>
            </div>

            <div className="">
              {/* GST */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="gst"
                  className={`text-sm font-medium inline-block ${
                    !checkedbox && "text-gray-300"
                  }`}
                >
                  GST(%):
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={GST}
                  onChange={handleGstChange}
                  onBlur={handleGstBlur}
                  className={`bg-white border border-gray-400 text-gray-900 text-sm rounded-md block w-full py-1 px-2 mb-0.5 ${
                    !checkedbox && "text-gray-300"
                  } focus:outline-purple-600`}
                  disabled={!checkedbox}
                />
              </div>
            </div>

            <Input
              title="Discount"
              lableStyle="text-primary-900"
              otherStyle=""
              type="number"
              min="0"
              value={
                isNaN(paymentDetails.discount) ? "" : paymentDetails.discount
              }
              handleChangeText={(e) => {
                setPaymentDetails((prev) => ({
                  ...prev,
                  discount: e.target.valueAsNumber,
                }));
              }}
              placeholder="discont"
            />
          </div>

          {/* payment section */}
          <div>
            <div className="flex justify-between font-semibold">
              <span>Pay :</span>
              <span>{`₹ ${paymentDetails.pay}`}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Due :</span>
              <span>{`₹ ${due}`}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Discont :</span>
              <span>{`₹ ${paymentDetails.discount}`}</span>
            </div>
            <Input
              title="Pay Amount"
              lableStyle="text-primary-900"
              otherStyle=""
              type="number"
              min="0"
              value={paymentDetails.pay}
              handleChangeText={(e) => {
                setPaymentDetails((prev) => ({
                  ...prev,
                  pay: e.target.value,
                }));
              }}
              handleOnBlur={handlePayOnBlur}
              placeholder="Pay amount"
            />
          </div>

          {/* total*/}
          <div className="w-1/6">
            {/* Gross total */}
            <div className="flex justify-between font-semibold">
              <span>Gross Total :</span>
              <span>{`₹ ${grossAmt}`}</span>
            </div>

            {/* Gst  */}
            {checkedbox && (
              <div className="flex justify-between font-semibold">
                <span>{`GST(${
                  GST === 0 || GST === undefined ? 0 : GST
                }%)`}</span>
                <span>{`₹ ${GSTAMT}`}</span>
              </div>
            )}

            {/* Exchange amount */}
            {exchange && (
              <div className="flex justify-between font-semibold">
                <span>Exchange Amount :</span>
                <span>{`₹ ${
                  exchangeDetails.exchangeAmount === 0
                    ? 0
                    : exchangeDetails.exchangeAmount
                }`}</span>
              </div>
            )}

            {/* Total amount */}
            <div className="flex justify-between font-bold border-t border-primary-900 mt-1 pt-1">
              <span>Total :</span>
              <span>{`₹ ${totalAmt}`}</span>
            </div>
          </div>
        </section>
      </section>
    </React.Fragment>
  );
};

InvoicePage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default InvoicePage;
