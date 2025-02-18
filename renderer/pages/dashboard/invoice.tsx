import React, { ReactElement, useEffect, useState } from "react";
import RootLayout from "../../components/rootLayout";
import { NextPageWithLayout } from "../_app";
import Head from "next/head";
import { HiRefresh } from "react-icons/hi";
import { MdDownloadDone } from "react-icons/md";
import { useRouter } from "next/router";
import ProductTable from "../../components/ui/ProductTable";
import { APiRes } from "../../types";
import Header from "../../components/ui/Header";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";
import Button from "../../components/ui/Button";
import Switch from "../../components/ui/Switch";
import toast from "react-hot-toast";

interface Product {
  rate: string;
  quantity: string;
  productName: string;
  netWeight: string;
  productCategory: string;
  makingCost: number;
}

interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
}

interface ExchangeDetails {
  exchangeCategory: string;
  weight: string;
  percentage: string;
  exchangeAmt: string;
}

interface SingleProduct {
  rate: number;
  quantity: number;
  productName: string;
  netWeight: number;
  productCategory: string;
  makingCost: number;
  amount: number;
}

const InvoicePage: NextPageWithLayout = () => {
  const router = useRouter();

  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    phone: "",
    address: "",
  });

  const [exchangeDetails, setExchangeDetails] = useState<ExchangeDetails>({
    exchangeCategory: "select",
    weight: "",
    percentage: "",
    exchangeAmt: "",
  });

  const [exchange, setExchange] = useState(false);

  const [productDetails, setProductDetails] = useState<Product>({
    rate: "",
    quantity: "",
    productName: "",
    netWeight: "",
    productCategory: "gold",
    makingCost: undefined,
  });

  const [invoiceNo, setInvoiceNo] = useState<string>("");

  const [checkedbox, setcheckedbox] = useState(false);

  const [totalAmt, setTotalAmt] = useState(0);

  const [grossAmt, setGrossAmt] = useState(undefined);

  const [GST, setGST] = useState(undefined);
  const [GSTAMT, setGSTAMT] = useState(0);

  const [productList, setProductList] = useState([]);

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
    let rate = parseFloat(productDetails.rate);
    let weight = parseFloat(productDetails.netWeight);
    let quantity = parseFloat(productDetails.quantity);
    let makingCostPercentage = productDetails.makingCost;

    // calculate product amount using <(rate / 10) * weight> formula
    let amount: number = parseFloat(((rate / 10) * weight).toFixed(2));

    // conver making cost in Rupees
    const makingCostInRupee = (amount * makingCostPercentage) / 100;
    amount = parseFloat((amount + makingCostInRupee).toFixed(2));

    // create a single final product with all calculation
    let singleProduct: SingleProduct = {
      productName: productDetails.productName,
      productCategory: productDetails.productCategory,
      netWeight: weight,
      quantity: quantity,
      rate: rate,
      amount: amount,
      makingCost: productDetails.makingCost,
    };

    // set singleProduct object in productList array
    productList.push(singleProduct);

    // After set singleProduct in array clear product section
    setProductDetails({
      rate: "",
      quantity: "",
      productName: "",
      netWeight: "",
      productCategory: "gold",
      makingCost: undefined,
    });

    let grossamount = 0;

    // calculate grossAmount
    productList.map((product) => {
      return (grossamount += product.amount);
    });

    // set GrossAmount and totalAmount
    setGrossAmt(parseFloat(grossamount.toFixed(2)));
    setTotalAmt(parseFloat(grossamount.toFixed(2)));
  };

  const handleGenrateInvoice = () => {
    if (
      customerDetails.name.length === 0 ||
      customerDetails.address.length === 0 ||
      customerDetails.phone.length === 0
    ) {
      toast.error("Add Customer Details!");
      return;
    }

    // check before submit productList is not Empty
    if (productList.length === 0) {
      toast.error("Add Atleast One Product!");
      return;
    }

    let invoiceData = {
      // customer Details
      customerName: customerDetails.name.toLowerCase(),
      customerPhone: customerDetails.phone,
      customerAddress: customerDetails.address,

      // exchange Details
      exchange: exchange,
      exchangeCategory: exchangeDetails.exchangeCategory,
      exchangeWeight: exchangeDetails.weight,
      exchangePercentage: exchangeDetails.percentage,
      exchangeAmt: exchangeDetails.exchangeAmt,

      // product Details
      productList: productList,

      // gst Details
      GST: checkedbox,
      GSTPercentage: GST,
      GSTAMT: GSTAMT,

      // invoice Details
      invoiceNo: invoiceNo,
      grossAmt: grossAmt,
      totalAmt: totalAmt,
      createdAt: Date.now(),
    };

    // set invoice Data in localStorage
    const jsonInvoice = JSON.stringify(invoiceData);
    localStorage.setItem("finalInvoice", jsonInvoice);

    // save invoice in database
    window.ipc.send("createinvoice", { invoiceData });

    window.ipc.on("createinvoice", (res: APiRes) => {
      console.log(res);
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
      weight: "",
      percentage: "",
      exchangeAmt: "",
    });
    setProductDetails({
      rate: "",
      quantity: "",
      productName: "",
      netWeight: "",
      productCategory: "gold",
      makingCost: 0,
    });
    setcheckedbox(false);
    setGST("");
    setGSTAMT(0);
    setGrossAmt(0);
    setTotalAmt(0);
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
    if (numericValue < 0)
      setProductDetails((prev) => ({
        ...prev,
        makingCost: 0,
      }));
    else if (numericValue > 100)
      setProductDetails((prev) => ({
        ...prev,
        makingCost: 100,
      }));
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
    const gstInRupee = (grossAmt * inputValue) / 100;

    // calculate total
    let total = parseFloat((grossAmt + gstInRupee).toFixed(2));

    // set gst amount
    setGSTAMT(gstInRupee);
    setTotalAmt(total);
  };

  const handleGstBlur = () => {
    if (GST === "") return; // Allow empty value
    const numericValue = Number(GST);
    if (numericValue < 0.0) setGST(0);
    else if (numericValue > 100.0) setGST(100);
  };

  const handleExchangeAmountAdd = () => {
    if (exchangeDetails.exchangeAmt === "") {
      return;
    }
    let total = totalAmt - parseFloat(exchangeDetails.exchangeAmt);
    setTotalAmt(total);
    setTotalAmt(total);
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
      <section className=" py-2 px-4 bg-primary-50 h-full">
        <Header title="Create Invoice" extraStyle="" />
        {/* Invoice Details section */}
        <section className="flex-col lg:flex-row w-full lg:h-[14rem] mt-3 flex gap-2">
          {/* Customer Details section  */}
          <div className="p-2 bg-primary-200 rounded-lg border border-primary-500 lg:w-[22rem] w-full ">
            <h2 className="font-bold text-primary-800">Customer Details</h2>
            {/* customer detail  */}
            <div className="py-4 w-[19rem]">
              {/* customer Name section   */}
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

              {/* customer phone number  */}
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

              {/* customer address  */}
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
          <div className="p-2 bg-primary-200 rounded-lg border border-primary-500 w-full">
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
                      className="bg-primary-100 border border-primary-800 disabled:border-gray-300 text-gray-900 text-sm rounded-md focus:outline-purple-600 block py-1.5 px-5 "
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
                    value={exchangeDetails.weight}
                    handleChangeText={(e) =>
                      setExchangeDetails((prev) => ({
                        ...prev,
                        weight: e.target.value,
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
                    value={exchangeDetails.percentage}
                    handleChangeText={(e) =>
                      setExchangeDetails((prev) => ({
                        ...prev,
                        percentage: e.target.value,
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
                    value={exchangeDetails.exchangeAmt}
                    handleChangeText={(e) => {
                      setExchangeDetails((prev) => ({
                        ...prev,
                        exchangeAmt: e.target.value,
                      }));
                    }}
                    disabled={!exchange}
                    placeholder="Amount"
                  />
                  <Button
                    title="Add"
                    buttonType="submit"
                    handleClick={handleExchangeAmountAdd}
                    disabled={!exchange}
                    extraClass="w-auto px-4 ml-3"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Detail Section  */}
          <div className="p-3 bg-primary-200 rounded-lg border border-primary-500 w-full">
            {/* invoice Number  */}
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
                  {/* rate  */}
                  <Input
                    title="Rate(10g)"
                    lableStyle="text-primary-800"
                    otherStyle="w-[130px]"
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
                  {/* category  */}
                  <div className="flex items-center gap-2 mb-2">
                    <label
                      htmlFor="product"
                      className="text-sm font-medium text-gray-900"
                    >
                      Category:
                    </label>
                    <select
                      value={productDetails.productCategory}
                      onChange={(e) =>
                        setProductDetails((prev) => ({
                          ...prev,
                          productCategory: e.target.value,
                        }))
                      }
                      className="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-md focus:outline-purple-600 block p-1.5"
                    >
                      <option defaultValue="gold">gold</option>
                      <option value="silver">silver</option>
                    </select>
                  </div>

                  {/* quantity */}
                  <Input
                    title="Quantity"
                    lableStyle="text-primary-800"
                    otherStyle="w-[130px]"
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
              {/* product name and weight */}
              <div className="flex gap-3">
                {/* product name  */}
                <Input
                  title="Product"
                  lableStyle="text-primary-800"
                  otherStyle="w-[200px]"
                  type="text"
                  value={productDetails.productName}
                  handleChangeText={(e) =>
                    setProductDetails((prev) => ({
                      ...prev,
                      productName: e.target.value,
                    }))
                  }
                  placeholder="Product Name"
                />

                {/* making cost */}
                <Input
                  title="Making Cost (in %)"
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
                    title="Net Weight (in gram)"
                    lableStyle="text-primary-800"
                    type="number"
                    min="0"
                    step="0.01"
                    value={productDetails.netWeight}
                    handleChangeText={(e) =>
                      setProductDetails((prev) => ({
                        ...prev,
                        netWeight: e.target.value,
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
        <section className="mt-2">
          <ProductTable
            productList={productList}
            setProductList={setProductList}
            grossAmt={grossAmt}
            setGrossAmt={setGrossAmt}
            setGSTAMT={setGSTAMT}
            setTotalAmt={setTotalAmt}
            gst={GST}
            exchangeAmt={
              exchangeDetails.exchangeAmt === ""
                ? 0
                : exchangeDetails.exchangeAmt
            }
          />
        </section>

        {/* total Amount section  */}
        <section className="w-full p-2 border rounded-lg mt-2 flex justify-between bg-primary-200 border-primary-500">
          <div></div>

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
              className="text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:outline-none focus:ring-purple-600 font-medium rounded-lg w-full sm:w-auto px-6 py-2.5 text-center flex gap-3 mb-2"
            >
              Clear invoice
            </button>
          </div>

          {/*  gst section */}
          <div>
            <div className="flex gap-2 items-center h-5 mb-2">
              <input
                type="checkbox"
                className="w-4 h-4 border border-primary-900 rounded bg-primary-100 focus:outline-purple-600 accent-primary-900"
                onChange={() => {
                  setcheckedbox(!checkedbox);
                  setGST("");
                  setTotalAmt(totalAmt - GSTAMT);
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
                  className={`bg-white border border-gray-400 text-gray-900 text-sm rounded-md block w-[3rem] py-1 px-2 mb-0.5 ${
                    !checkedbox && "text-gray-300"
                  } focus:outline-purple-600`}
                  disabled={!checkedbox}
                />
              </div>
            </div>
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
                  GST === "" || GST === undefined ? 0 : GST
                }%)`}</span>
                <span>{`₹ ${GSTAMT}`}</span>
              </div>
            )}

            {/* Exchange amount */}
            {exchange && (
              <div className="flex justify-between font-semibold">
                <span>Exchange Amount :</span>
                <span>{`₹ ${
                  exchangeDetails.exchangeAmt === ""
                    ? 0
                    : exchangeDetails.exchangeAmt
                }`}</span>
              </div>
            )}

            {/* Total amount */}
            <div className="flex justify-between font-bold border-t border-zinc-300 mt-1 pt-1">
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
