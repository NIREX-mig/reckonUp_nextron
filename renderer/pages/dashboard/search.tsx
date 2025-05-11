import React, { ReactElement, useEffect, useState } from 'react';
import RootLayout from '../../components/rootLayout';
import { NextPageWithLayout } from '../_app';
import Head from 'next/head';
import Modal from '../../components/ui/Modal';
import useModal from '../../hooks/useModal';
import { APiRes } from '../../types';
import Header from '../../components/ui/Header';
import toast from 'react-hot-toast';
import SearchPageTable from '../../components/ui/SearchPageTable';
import DateRange from '../../components/search/DateRange';
import SelectCategory from '../../components/search/SelectCategory';

const SearchPage: NextPageWithLayout = () => {
  const { modal, openModal, closeModal } = useModal();

  const [currentPage, setCurrentPage] = useState(undefined);
  const [totalPages, setTotalPages] = useState(undefined);

  const [filteredData, setFilteredData] = useState([]);

  const [filterCurrentPage, setFilterCurrentPage] = useState(undefined);
  const [filterTotalPage, setFilterTotalPage] = useState(undefined);

  const handleShowDetails = (invoice) => {
    openModal('Invoice-Details');
    const jsonInvoice = JSON.stringify(invoice);
    localStorage.setItem('finalInvoice', jsonInvoice);
  };

  const getInvoices = () => {
    window.ipc.send('getallinvoice', { pageNo: currentPage });

    window.ipc.on('getallinvoice', (res: APiRes) => {
      if (res.success) {
        setFilteredData(res.data.invoices);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
        setFilterCurrentPage(undefined);
        setFilterTotalPage(undefined);
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
      <section className="p-1 bg-primary-50 h-[calc(100%-16px)] overflow-auto rounded-xl m-2">
        <Modal type={modal.type} isOpen={modal.isOpen} onClose={closeModal} />
        <Header title="View Invoices" extraStyle="mb-2" />
        <div className="rounded-lg bg-primary-50 border border-primary-500">
          <div className="flex justify-between">
            <DateRange
              currentPage={filterCurrentPage}
              setCurrentPage={setFilterCurrentPage}
              setFilteredData={setFilteredData}
              setTotalPages={setFilterTotalPage}
              clear={getInvoices}
            />
            <SelectCategory
              currentPage={filterCurrentPage}
              setCurrentPage={setFilterCurrentPage}
              setFilteredData={setFilteredData}
              setTotalPages={setFilterTotalPage}
            />
          </div>
          <hr />
          <div className="h-[calc(100vh-145px)]">
            <SearchPageTable
              data={filteredData}
              handleTableRowClick={handleShowDetails}
              currentPage={filterCurrentPage === undefined ? currentPage : filterCurrentPage}
              setCurrentPage={
                filterCurrentPage === undefined ? setCurrentPage : setFilterCurrentPage
              }
              totalPages={filterTotalPage === undefined ? totalPages : filterTotalPage}
              handlePaymentClick={(invoice) => {
                openModal('Payment');
                const jsonInvoice = JSON.stringify(invoice);
                localStorage.setItem('finalInvoice', jsonInvoice);
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
