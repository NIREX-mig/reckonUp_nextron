import React, { ReactElement, useEffect, useState } from "react";
import RootLayout from "../../components/rootLayout";
import type { NextPageWithLayout } from "../_app";
import Head from "next/head";
import { FaDollarSign } from "react-icons/fa";
import { ImStatsDots } from "react-icons/im";
import { TfiStatsUp } from "react-icons/tfi";
import { FiFileText } from "react-icons/fi";
import moment from "moment";
import useModal from "../../hooks/useModal";
import Modal from "../../components/ui/Modal";
import { APiRes } from "../../types";
import Header from "../../components/ui/Header";
import toast from "react-hot-toast";

const iconMap: { [key: string]: JSX.Element } = {
  FaDollarSign: <FaDollarSign />,
  ImStatsDots: <ImStatsDots />,
  TfiStatsUp: <TfiStatsUp />,
  FiFileText: <FiFileText />,
};

const ServerIconRenderer: React.FC<{ iconName: string }> = ({ iconName }) => {
  const Icon = iconMap[iconName];
  return Icon;
};

const DashboardPage: NextPageWithLayout = () => {
  const { isOpen, openModal, closeModal } = useModal();

  const [search, setSearch] = useState("");

  const [invoices, setInvoices] = useState([]);
  const [filteredData, setFilterdData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [selectedOption, setSelectedOption] = useState("invoiceNo");

  const [stats, setStats] = useState([
    {
      title: "Total Sales",
      value: "₹0",
      icon: "FaDollarSign",
    },
    {
      title: "Total Invoices",
      value: "0",
      icon: "FiFileText",
    },
    {
      title: "Today Growth",
      value: "₹0",
      icon: "ImStatsDots",
    },
    {
      title: "Monthly Growth",
      value: "₹0",
      icon: "TfiStatsUp",
    },
  ]);

  const handleSearchInvoice = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearch(searchValue);

    // search functionality

    if (selectedOption === "invoiceNo") {
      const searchedData =
        searchValue.length === 0
          ? invoices
          : invoices.filter((item) =>
              item.invoiceNo.toLowerCase().includes(searchValue)
            );

      setFilterdData(searchedData);
    }

    if (selectedOption === "customerName") {
      const searchedData =
        searchValue.length === 0
          ? invoices
          : invoices.filter((item) =>
              item.customerName.toLowerCase().includes(searchValue)
            );

      setFilterdData(searchedData);
    }
  };

  const handleShowDetails = (invoice) => {
    openModal();
    const jsonInvoice = JSON.stringify(invoice);
    localStorage.setItem("finalInvoice", jsonInvoice);
  };

  useEffect(() => {
    const getTracks = () => {
      window.ipc.send("tracks", {});

      window.ipc.on("tracks", (res: APiRes) => {
        if (res.success) {
          setLoading(false);
          setStats(res.data);
        } else {
          setLoading(false);
          toast.error(res.message);
        }
      });
    };

    const getMonthlyInvoice = () => {
      setLoading(true);
      window.ipc.send("fetchmonthlyinvoice", {});

      window.ipc.on("fetchmonthlyinvoice", (res: APiRes) => {
        if (res.success) {
          setLoading(false);
          setInvoices(res.data);
          setFilterdData(res.data);
        } else {
          setLoading(false);
          toast.error(res.message);
        }
      });
    };

    getMonthlyInvoice();
    getTracks();
  }, []);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <div className="px-4 py-2 bg-primary-50">
        <Modal isOpen={isOpen} closeModal={closeModal} />
        <Header title="Dashboard" extraStyle="mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-2">
          {stats.map((stat) => (
            <div key={stat.title} className="bg-primary-900 rounded-lg ">
              <div className=" -translate-x-[3px] -translate-y-[3px] bg-primary-200 rounded-lg p-4  border border-primary-500">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-lg bg-primary-800 text-primary-50`}
                  >
                    <ServerIconRenderer iconName={stat.icon} />
                  </div>
                  <div className=" text-center">
                    <h3 className="text-primary-800 text-md font-bold mb-1">
                      {stat.title}
                    </h3>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-lg bg-primary-200 mb-3 border border-primary-500 p-2">
          <h2 className="text-lg font-semibold mb-1 text-primary-950">
            Monthly Invoices
          </h2>
          <div>
            <form className=" p-4 flex gap-2">
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
          <div className="h-[calc(100vh-140px)]">
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
                        No invoices available In This Month.
                      </td>
                    </tr>
                  )}
                  {loading
                    ? Array.from({ length: 15 }).map((_, index) => (
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
        </div>
      </div>
    </React.Fragment>
  );
};

DashboardPage.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default DashboardPage;
