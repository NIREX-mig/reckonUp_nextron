import React, { ReactElement, useEffect, useState } from 'react';
import { NextPageWithLayout } from '../_app';
import RootLayout from '../../components/rootLayout';
import Head from 'next/head';
import Header from '../../components/ui/Header';
import Modal from '../../components/ui/Modal';
import { APiRes } from '../../types';
import toast from 'react-hot-toast';
import { IoSearchOutline } from 'react-icons/io5';
import DueInvoiceTable from '../../components/ui/DueInvoiceTable';

const DueHistoryPage: NextPageWithLayout = () => {
  const [search, setSearch] = useState('');
  const [dueInvoices, setDueInvoices] = useState([]);
  const [filterData, setFilterdData] = useState([]);
  const [page, setpage] = useState({
    currentPage: undefined,
    totalPage: undefined,
  });

  const handleSearchInvoice = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);

    const searchedData =
      searchValue.length === 0
        ? dueInvoices
        : dueInvoices?.filter((item) => item.customerName.toLowerCase().includes(searchValue));

    setFilterdData(searchedData);
  };

  useEffect(() => {
    window.ipc.send('getdueinvoices', { pageNo: page.currentPage });

    window.ipc.on('getdueinvoices', async (res: APiRes) => {
      console.log(res);
      if (res.success) {
        setDueInvoices(res.data.invoices);
        setFilterdData(res.data.invoices);
      } else toast.error(res.message);
    });
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="p-1 bg-primary-50 h-[calc(100%-16px)] overflow-auto rounded-xl m-2">
        <Header title="Due Invoices History" extraStyle="mb-2" />
        {/* <Modal closeModal={} type={} /> */}
        <div className="rounded-lg border border-primary-500 bg-primary-50 h-[calc(100%-70px)] px-5 py-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="mx-auto flex items-center">
              <IoSearchOutline size={20} className="text-primary-700 translate-x-7" />
              <input
                type="text"
                className="bg-primary-100 border border-primary-900 text-primary-900 text-sm font-semibold rounded-md focus:outline-primary-900 block w-[300px] p-1.5 px-2 placeholder:px-1 indent-6"
                placeholder="Search By Customer Name"
                value={search}
                onChange={handleSearchInvoice}
                required
              />
            </div>
          </div>
          <div className="w-full">
            {/* {filterData?.map((data, index) => {
              return (
                <article
                  key={index}
                  className="border-[1px] border-primary-300 w-[270px] rounded-3xl p-5 bg-primary-200 text-primary-950"
                >
                  <p className=" capitalize font-semibold">
                    <span>InvoiceNo : </span>
                    <span className="text-xl">{`INV${(data?.invoiceNo).toString().padStart(3, "0")}`}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Name : </span>
                    <span>{data.name}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Address : </span>
                    <span>{data.address}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Number : </span>
                    <span>{data.phone}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Total : </span>
                    <span>{data.totalAmount}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Paid : </span>
                    <span className="text-green-600">{data.paidAmount}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Discount : </span>
                    <span className="text-blue-700">{data.discount}</span>
                  </p>
                  <p className=" capitalize font-semibold">
                    <span>Due : </span>
                    <span className="text-red-600">{data.dueAmount}</span>
                  </p>
                </article>
              );
            })} */}
            <DueInvoiceTable invoiceData={filterData} />
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
