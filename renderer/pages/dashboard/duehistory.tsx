import React, { ReactElement, useEffect, useMemo, useState } from "react";
import { NextPageWithLayout } from "../_app";
import RootLayout from "../../components/rootLayout";
import Head from "next/head";
import Header from "../../components/ui/Header";
import Modal from "../../components/ui/Modal";
import { APiRes } from "../../types";
import toast from "react-hot-toast";
import { IoSearchOutline } from "react-icons/io5";
import DueInvoiceTable from "../../components/ui/DueInvoiceTable";
import Select from "react-select";
import Pagination from "../../components/ui/Pagination";
import useModal from "../../hooks/useModal";
import Button from "../../components/ui/Button";

const DueHistoryPage: NextPageWithLayout = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2023;

  const { modal, openModal, closeModal } = useModal();

  const [year, setYear] = useState(currentYear);

  const [search, setSearch] = useState("");
  const [filterData, setFilterdData] = useState([]);
  const [currentPage, setCurrentPage] = useState(undefined);
  const [totalPage, setTotalPage] = useState(undefined);

  const yearOptions = useMemo(() => {
    return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
      const year = startYear + index;
      return { value: year, label: year.toString() };
    }).reverse();
  }, [currentYear]);

  const selected = yearOptions.find(
    (option) => option.value === (year || currentYear)
  );

  const getdueinvoices = () => {
    window.ipc.send("getdueinvoices", { pageNo: currentPage, year });

    window.ipc.on("getdueinvoices", async (res: APiRes) => {
      if (res.success) {
        setFilterdData(res.data.invoices);
        setTotalPage(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      } else toast.error(res.message);
    });
  };

  const handleSearchInvoice = () => {
     window.ipc.send("dueInvoice-name", { pageNo: currentPage, name: search });

    window.ipc.on("dueInvoice-name", async (res: APiRes) => {
      if (res.success) {
        setFilterdData(res.data.invoices);
        setTotalPage(res.data.totalPages);
        setCurrentPage(res.data.currentPage);
      } else toast.error(res.message);
    });
  };

  const handleReset = () => {
    setSearch("");
    getdueinvoices();
  };

  useEffect(() => {
    getdueinvoices();
  }, [year, currentPage]);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="p-1 bg-primary-50 h-[calc(100%-16px)] overflow-auto rounded-xl m-2">
        <Modal type={modal.type} isOpen={modal.isOpen} onClose={closeModal} modalData={filterData}/>
        <Header title="Due Invoices History" extraStyle="mb-2" />
        {/* <Modal closeModal={} type={} /> */}
        <div className="rounded-lg border border-primary-500 bg-primary-50 h-[calc(100%-70px)] p-2">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className=" flex gap-3 ">
              <div className="mx-auto flex items-center">
                <IoSearchOutline
                  size={20}
                  className="text-primary-700 translate-x-7"
                />
                <input
                  type="text"
                  className="bg-primary-100 border border-primary-900 text-primary-900 text-sm font-semibold rounded-md focus:outline-primary-900 block w-[300px] p-1.5 px-2 placeholder:px-1 indent-6"
                  placeholder="Search By Customer Name"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  required
                />
              </div>
              <Button
                title="Search"
                buttonType="button"
                handleClick={handleSearchInvoice}
                extraClass="sm:w-auto py-1.5"
              />

              <Button
                title="Reset"
                buttonType="button"
                handleClick={handleReset}
                extraClass="sm:w-auto py-1.5 bg-red-600 hover:bg-red-700"
              />
            </div>

            <Select
              options={yearOptions}
              value={selected}
              onChange={(selectedOption) => setYear(selectedOption.value)}
              placeholder="Select Year"
              isClearable
              className="outline-none "
            />
          </div>
          <div className="w-full">
            <DueInvoiceTable
              invoiceData={filterData}
              handlePaymentClick={(invoice) => {
                openModal("Payment");
                const jsonInvoice = JSON.stringify(invoice);
                localStorage.setItem("finalInvoice", jsonInvoice);
              }}
            />
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPage}
            />
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
