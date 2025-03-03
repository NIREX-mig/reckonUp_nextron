import React, { ReactElement, useEffect, useState } from "react";
import { NextPageWithLayout } from "../_app";
import RootLayout from "../../components/rootLayout";
import Head from "next/head";
import Header from "../../components/ui/Header";
import Modal from "../../components/ui/Modal";
import { APiRes } from "../../types";
import toast from "react-hot-toast";

const DueHistoryPage: NextPageWithLayout = () => {
  const [search, setSearch] = useState("");
  const [dueInvoices, setDueInvoices] = useState([]);
  const [filterData, setFilterdData] = useState([]);
  const handleSearchInvoice = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);

    const searchedData =
      searchValue.length === 0
        ? dueInvoices
        : dueInvoices?.filter((item) =>
            item.customerName.toLowerCase().includes(searchValue)
          );

    setFilterdData(searchedData);
  };

  useEffect(() => {
    window.ipc.send("getdueinvoices", {});

    window.ipc.on("getdueinvoices", async (res: APiRes) => {
      if (res.success) {
        setDueInvoices(res.data);
        setFilterdData(res.data);
      } else toast.error(res.message);
    });
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="bg-primary-50 py-2 px-4">
        <Header title="Due Invoices History" extraStyle="mb-3" />
        {/* <Modal closeModal={} type={} /> */}
        <div className="rounded-lg border border-primary-500 bg-primary-200 min-h-screen px-5 py-5">
          <div>
            <form className="flex items-center gap-2 mb-5">
              <label
                htmlFor="search"
                className="font-bold tracking-wide text-xl text-primary-800"
              >
                Search By Customer Name
              </label>
              <input
                type="text"
                className="bg-primary-100 border border-primary-900 text-primary-900 text-sm font-semibold rounded-md focus:outline-primary-900 block w-[300px] p-1.5 px-2 placeholder:px-1"
                placeholder="Search by customer name"
                value={search}
                onChange={handleSearchInvoice}
                required
              />
            </form>
          </div>
          <div className="grid grid-cols-4 gap-5">
            {filterData?.map((data, index) => {
              return (
                <article
                  key={index}
                  className="border-[1px] border-[#666] w-[270px] rounded-3xl p-5 bg-primary-100"
                >
                  <p className=" capitalize font-semibold">
                    <span>InvoiceNo : </span>
                    <span>{data.invoiceNo}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Name : </span>
                    <span>{data.customerName}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Address : </span>
                    <span>{data.customerAddress}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Number : </span>
                    <span>{data.customerPhone}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Total : </span>
                    <span>{data.totalAmt}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Paid : </span>
                    <span>{data.paidAmount}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Discount : </span>
                    <span>{data.discount}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Due : </span>
                    <span>{data.due}</span>
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

DueHistoryPage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default DueHistoryPage;
