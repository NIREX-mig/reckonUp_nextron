import React, { ReactElement, useEffect, useState } from "react";
import RootLayout from "../../components/rootLayout";
import { NextPageWithLayout } from "../_app";
import Head from "next/head";
import { useRouter } from "next/router";
import Modal from "../../components/ui/Modal";
import useModal from "../../hooks/useModal";
import moment from "moment";
import Pagination from "../../components/ui/Pagination";
import { APiRes } from "../../types";
import Header from "../../components/ui/Header";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import { NextPage } from "next";

const SearchPage: NextPage & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
} = () => {
  const router = useRouter();

  const { openModal, isOpen, closeModal } = useModal();

  const [date, setDate] = useState({
    start: "",
    end: "",
  });

  const [currentPage, setCurrentPage] = useState(undefined);
  const [totalPages, setTotalPages] = useState(undefined);

  const [loading, setLoading] = useState(false);

  const [selectedOption, setSelectedOption] = useState("invoiceNo");

  const [search, setSearch] = useState("");

  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  const handleFetchInvoiceByDateRange = async (e) => {
    e.preventDefault();
    window.ipc.send("fetchbydaterange", {
      startingDate: date.start,
      endingDate: date.end,
      pageNo: currentPage,
    });

    window.ipc.on("fetchbydaterange", (res: APiRes) => {
      if (res.success) {
        setFilteredData(res.data.invoices);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.message);
      }
    });
  };

  const handleFetchInvoiceBySelection = (e) => {
    e.preventDefault();
    if (selectedOption === "invoiceNo") {
      window.ipc.send("fetchbyinvoiceno", { invoiceNo: search.toUpperCase() });

      window.ipc.on("fetchbyinvoiceno", (res: APiRes) => {
        if (res.success) {
          setFilteredData(res.data.invoices);
          setCurrentPage(res.data.currentPage);
          setTotalPages(res.data.totalPages);
        } else {
          toast.error(res.message);
        }
      });
    }

    if (selectedOption === "customerName") {
      window.ipc.send("fetchbycustomername", {
        customerName: search.toLowerCase(),
        pageNo: currentPage,
      });

      window.ipc.on("fetchbycustomername", (res: APiRes) => {
        if (res.success) {
          setFilteredData(res.data.invoices);
          setCurrentPage(res.data.currentPage);
          setTotalPages(res.data.totalPages);
        } else {
          toast.error(res.message);
        }
      });
    }
  };

  const handleShowDetails = (invoice) => {
    openModal();
    const jsonInvoice = JSON.stringify(invoice);
    localStorage.setItem("finalInvoice", jsonInvoice);
  };

  useEffect(() => {
    const getInvoices = () => {
      setLoading(true);
      window.ipc.send("getallinvoice", { pageNo: currentPage });

      window.ipc.on("getallinvoice", (res: APiRes) => {
        if (res.success) {
          setLoading(false);
          setInvoices(res.data.invoices);
          setFilteredData(res.data.invoices);
          setCurrentPage(res.data.currentPage);
          setTotalPages(res.data.totalPages);
        } else {
          setLoading(false);
          toast.error(res.message);
        }
      });
      setLoading(false);
    };

    getInvoices();
    setSearch("");
  }, [selectedOption, currentPage]);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="bg-primary-50 px-4 py-2 h-full">
        <Modal isOpen={isOpen} closeModal={closeModal} />
        <Header title="View Invoices" extraStyle="mb-3" />
        <div className="rounded-lg bg-primary-200 border border-primary-500">
          <div className="flex justify-between">
            <form
              onSubmit={handleFetchInvoiceByDateRange}
              className="max-w-sm p-4 flex gap-2"
            >
              <Input
                type="date"
                value={date.start}
                handleChangeText={(e) =>
                  setDate((prev) => ({
                    ...prev,
                    start: e.target.value,
                  }))
                }
              />
              <span className="my-auto text-black font-bold">to</span>
              <Input
                type="date"
                value={date.end}
                otherStyle=""
                handleChangeText={(e) =>
                  setDate((prev) => ({
                    ...prev,
                    end: e.target.value,
                  }))
                }
              />

              <Button
                title="Search"
                buttonType="submit"
                extraClass="px-5 py-1"
              />
              <button
                type="button"
                onClick={() => {
                  setDate({ start: "", end: "" });
                  setFilteredData(invoices);
                }}
                className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm sm:w-auto px-5 py-1.5 text-center"
              >
                Clear
              </button>
            </form>
            <form
              onSubmit={handleFetchInvoiceBySelection}
              className=" p-4 flex gap-2"
            >
              <select
                className="bg-primary-100 border border-primary-900 text-gray-900 text-sm rounded-md focus:outline-purple-600 block w-30 p-1.5 px-2"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                <option defaultValue="invoiceNo">invoiceNo</option>
                <option value="customerName">Customer Name</option>
              </select>
              <Input
                type="text"
                placeholder="Search"
                value={search}
                handleChangeText={(e) => {
                  setSearch(e.target.value);
                  setFilteredData(invoices);
                }}
              />

              <Button title="Search" buttonType="submit" />
            </form>
          </div>
          <hr />
          <div className="h-[calc(100vh-210px)] border">
            <div className=" overflow-x-auto shadow-md">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                <thead className="text-xs text-black uppercase bg-green-300">
                  <tr>
                    <th
                      scope="col"
                      className="px-3 py-2 border-r w-[8rem] text-center"
                    >
                      Invoice No
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 w-[8rem] border-r text-center"
                    >
                      Invoice Date
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 w-[8rem] border-r text-center"
                    >
                      Invoice Time
                    </th>
                    <th scope="col" className="px-3 py-2 border-r text-center">
                      Customer Name
                    </th>
                    <th scope="col" className="px-3 py-2 border-r text-center">
                      mobile NO
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 border-r w-[9rem] text-center"
                    >
                      Address
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 border-r w-[8rem] text-center"
                    >
                      GrossAmt
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-2 border-r w-[8rem] text-center"
                    >
                      making Cost
                    </th>
                    <th scope="col" className="px-3 py-3 w-[8rem] text-center">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!loading && filteredData.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="py-3 text-lg font-bold border border-gray-200 text-center"
                      >
                        No invoices available.
                      </td>
                    </tr>
                  )}
                  {loading
                    ? Array.from({ length: 12 }).map((_, index) => (
                        <tr
                          key={index}
                          className="odd:bg-white even:bg-green-200 text-black"
                        >
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-24 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-28 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-16 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-36 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <div className="h-4 w-20 bg-gray-200 animate-pulse rounded"></div>
                          </td>
                        </tr>
                      ))
                    : filteredData?.map((invoice, index) => {
                        return (
                          <tr
                            key={index}
                            onClick={() => {
                              handleShowDetails(invoice);
                            }}
                            className="odd:bg-white even:bg-green-200 cursor-pointer text-black"
                          >
                            <th
                              scope="row"
                              className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap text-center"
                            >
                              {invoice.invoiceNo}
                            </th>
                            <td className="px-3 py-2 text-center">
                              {moment(invoice.createdAt).format("MMM DD, YYYY")}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {moment(invoice.createdAt).format("LT")}
                            </td>
                            <td className="px-3 py-2 capitalize text-center">
                              {invoice.customerName}
                            </td>
                            <td className="px-3 py-2 text-center">
                              {invoice.customerPhone === null
                                ? "N/A"
                                : invoice.customerPhone}
                            </td>
                            <td className="px-3 py-2 capitalize text-center">
                              {invoice.customerAddress}
                            </td>
                            <td className="px-3 py-2 text-center">{`₹ ${invoice.grossAmt}`}</td>
                            <td className="px-3 py-2 text-center">{`${invoice.makingCost}%`}</td>
                            <td className="px-3 py-2 text-center">{`₹ ${invoice.totalAmt}`}</td>
                          </tr>
                        );
                      })}
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

SearchPage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default SearchPage;
