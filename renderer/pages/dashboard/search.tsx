import React, { ReactElement, useEffect, useState } from "react";
import RootLayout from "../../components/rootLayout";
import { NextPageWithLayout } from "../_app";
import Head from "next/head";
import Modal from "../../components/ui/Modal";
import useModal from "../../hooks/useModal";
import { APiRes } from "../../types";
import Header from "../../components/ui/Header";
import toast from "react-hot-toast";
import SearchPageTable from "../../components/ui/SearchPageTable";
import DateRange from "../../components/search/DateRange";
import SelectCategory from "../../components/search/SelectCategory";

const SearchPage: NextPageWithLayout = () => {
  const { modalType, openModal, closeModal } = useModal();

  const [currentPage, setCurrentPage] = useState(undefined);
  const [totalPages, setTotalPages] = useState(undefined);

  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilteredData] = useState(invoices);

  const handleShowDetails = (invoice) => {
    openModal("Invoice-Details");
    const jsonInvoice = JSON.stringify(invoice);
    localStorage.setItem("finalInvoice", jsonInvoice);
  };

  const getInvoices = () => {
    window.ipc.send("getallinvoice", { pageNo: currentPage });

    window.ipc.on("getallinvoice", (res: APiRes) => {
      if (res.success) {
        setInvoices(res.data.invoices);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
      } else {
        toast.error(res.message);
      }
    });
  };

  useEffect(() => {
    getInvoices();
  }, [currentPage]);

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
            <DateRange
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setFilteredData={setFilteredData}
              setTotalPages={setTotalPages}
            />
            <SelectCategory
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              setFilteredData={setFilteredData}
              setTotalPages={setTotalPages}
            />
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