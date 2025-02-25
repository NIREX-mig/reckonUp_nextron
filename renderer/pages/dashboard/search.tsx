import React, { ReactElement, useEffect, useState } from "react";
import RootLayout from "../../components/rootLayout";
import { NextPageWithLayout } from "../_app";
import Head from "next/head";
import Modal from "../../components/ui/Modal";
import useModal from "../../hooks/useModal";
import { APiRes } from "../../types";
import Header from "../../components/ui/Header";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import toast from "react-hot-toast";
import SearchPageTable from "../../components/ui/SearchPageTable";

const SearchPage: NextPageWithLayout = () => {
  const { modalType, openModal, closeModal } = useModal();

  const [date, setDate] = useState({
    start: "",
    end: "",
  });
  const [currentPage, setCurrentPage] = useState(undefined);
  const [totalPages, setTotalPages] = useState(undefined);

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
    openModal("Invoice-Details");
    const jsonInvoice = JSON.stringify(invoice);
    localStorage.setItem("finalInvoice", jsonInvoice);
  };

  useEffect(() => {
    const getInvoices = () => {
      window.ipc.send("getallinvoice", { pageNo: currentPage });

      window.ipc.on("getallinvoice", (res: APiRes) => {
        if (res.success) {
          console.log(res.data);
          setInvoices(res.data.invoices);
          setFilteredData(res.data.invoices);
          setCurrentPage(res.data.currentPage);
          setTotalPages(res.data.totalPages);
        } else {
          toast.error(res.message);
        }
      });
    };

    getInvoices();
    setSearch("");
  }, [selectedOption, currentPage, closeModal]);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="bg-primary-50 px-4 py-2 h-full">
        <Modal type={modalType} closeModal={closeModal} />
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
                className="text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg text-sm sm:w-auto px-5 py-1.5 text-center active:scale-95 transition-all duration-300"
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
          <div className="h-[calc(100vh-160px)]">
            <SearchPageTable
              data={filteredData}
              handleTableRowClick={handleShowDetails}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              handlePaymentClick={(invoice) => {
                openModal("Payment");
                const jsonInvoice = JSON.stringify(invoice);
                localStorage.setItem("finalInvoice", jsonInvoice);
              }}
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
