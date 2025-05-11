import React, { ReactElement, useEffect, useState } from 'react';
import RootLayout from '../../components/rootLayout';
import type { NextPageWithLayout } from '../_app';
import Head from 'next/head';
import { FaDollarSign } from 'react-icons/fa';
import { FiFileText } from 'react-icons/fi';
import { MdPaid } from 'react-icons/md';
import { IoMdWarning } from 'react-icons/io';
import useModal from '../../hooks/useModal';
import Modal from '../../components/ui/Modal';
import { APiRes } from '../../types';
import Header from '../../components/ui/Header';
import toast from 'react-hot-toast';
import DashboardPageTable from '../../components/ui/DashboardPageTable';

const iconMap: { [key: string]: JSX.Element } = {
  FaDollarSign: <FaDollarSign />,
  MdPaid: <MdPaid />,
  IoMdWarning: <IoMdWarning />,
  FiFileText: <FiFileText />,
};

const ServerIconRenderer: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName];
  return Icon;
};

const DashboardPage: NextPageWithLayout = () => {
  const { modal, openModal, closeModal } = useModal();

  const [search, setSearch] = useState('');

  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilterdData] = useState([]);

  const [selectedOption, setSelectedOption] = useState('invoiceNo');

  const [stats, setStats] = useState([
    {
      title: 'Outstanding',
      value: '₹0',
      icon: 'FaDollarSign',
    },
    {
      title: 'Total Invoices',
      value: '0',
      icon: 'FiFileText',
    },
    {
      title: 'Paid Inovices',
      value: '0',
      icon: 'MdPaid',
    },
    {
      title: 'Due Invoices',
      value: '0',
      icon: 'IoMdWarning',
    },
  ]);

  const handleSearchInvoice = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);

    // search functionality

    if (selectedOption === 'invoiceNo') {
      const searchedData =
        searchValue.length === 0
          ? invoices
          : invoices.filter((item) => item.invoiceNo.toLowerCase().includes(searchValue));

      setFilterdData(searchedData);
    }

    if (selectedOption === 'customerName') {
      const searchedData =
        searchValue.length === 0
          ? invoices
          : invoices.filter((item) => item.customerName.toLowerCase().includes(searchValue));

      setFilterdData(searchedData);
    }
  };

  const handleShowDetails = (invoice) => {
    openModal('Invoice-Details');
    const jsonInvoice = JSON.stringify(invoice);
    localStorage.setItem('finalInvoice', jsonInvoice);
  };

  useEffect(() => {
    const getStats = () => {
      window.ipc.send('tracks', {});

      window.ipc.on('tracks', (res: APiRes) => {
        console.log(res);
        if (res.success) {
          setStats(res.data);
        } else {
          toast.error(res.message);
        }
      });
    };

    const getMonthlyInvoice = () => {
      window.ipc.send('fetchmonthlyinvoice', {});

      window.ipc.on('fetchmonthlyinvoice', (res: APiRes) => {
        if (res.success) {
          setInvoices(res.data);
          setFilterdData(res.data);
        } else {
          toast.error(res.message);
        }
      });
    };

    getMonthlyInvoice();
    getStats();
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <div className="px-2 py-2 bg-primary-50 h-[calc(100%-16px)] overflow-auto rounded-xl m-2">
        <Modal type={modal.type} isOpen={modal.isOpen} onClose={closeModal} />
        <Header title="Dashboard" extraStyle="mb-3" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-primary-900 rounded-lg ">
              <div className=" -translate-x-[3px] -translate-y-[3px] bg-primary-200 rounded-lg p-4  border border-primary-500">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg bg-primary-800 text-primary-50`}>
                    <ServerIconRenderer iconName={stat.icon} />
                  </div>
                  <div className=" text-center">
                    <h3 className="text-primary-800 text-md font-bold mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-primary-50 mb-1 border border-primary-500 p-2">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold ml-2 text-primary-950">Monthly Invoices</h2>
            <form className=" p-1 flex gap-2">
              <select
                id="search"
                className="bg-primary-100 border border-primary-800 text-primary-800 text-sm rounded-md focus:outline-primary-900 block w-30 p-1.5"
                value={selectedOption}
                onChange={(e) => setSelectedOption(e.target.value)}
              >
                <option defaultValue="invoiceNo">invoiceNo</option>
                <option value="customerName">Customer Name</option>
              </select>
              <div>
                <input
                  type="text"
                  className="bg-primary-100 border border-primary-900 text-primary-900 text-sm font-semibold rounded-md focus:outline-primary-900 block w-52 p-1.5 px-2 placeholder:px-1"
                  placeholder="Search"
                  value={search}
                  onChange={handleSearchInvoice}
                  required
                />
              </div>
            </form>
          </div>
          <hr />
          <DashboardPageTable
            data={filteredData}
            handleTableRowClick={handleShowDetails}
            handlePaymentClick={(invoice) => {
              openModal('Payment');
              const jsonInvoice = JSON.stringify(invoice);
              localStorage.setItem('finalInvoice', jsonInvoice);
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
};

DashboardPage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default DashboardPage;
