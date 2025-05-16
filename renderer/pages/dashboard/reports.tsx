import React, { ReactElement, useState, useMemo, useEffect } from "react";
import { NextPageWithLayout } from "../_app";
import RootLayout from "../../components/rootLayout";
import Head from "next/head";
import Header from "../../components/ui/Header";
import InvoiceSatatusChart from "../../components/reports/InvoiceSatatusChart";
import TotalRevenueChart from "../../components/reports/TotalRevenueChart";
import { FaFileInvoiceDollar, FaRegCreditCard } from "react-icons/fa";
import { MdPaid } from "react-icons/md";
import { IoMdWarning } from "react-icons/io";
import Select from "react-select";
import TotalPaymentsInMonth from "../../components/reports/TotalPaymentsInMonth";
import { APiRes } from "../../types";
import ProgressLevel from "../../components/reports/ProgressLevel";

const reports: NextPageWithLayout = () => {
  const currentYear = new Date().getFullYear();
  const startYear = 2023;

  const [year, setYear] = useState(currentYear);
  const [reportStats, setReportStats] = useState({
    totalInvoice: 0,
    totalPaymets: 0,
    totalPaidInovice: 0,
    totalDueInvoice: 0,
  });

  const [yearsData, setYearsData] = useState({
    paymentCount: [],
    invoiceCount: [],
  });
  const [paymentsInYear, setPaymentsInYear] = useState([]);

  const [growth, setGrowth] = useState(undefined);

  const yearOptions = useMemo(() => {
    return Array.from({ length: currentYear - startYear + 1 }, (_, index) => {
      const year = startYear + index;
      return { value: year, label: year.toString() };
    }).reverse();
  }, [currentYear]);

  // Default to current year if none selected
  const selected = yearOptions.find(
    (option) => option.value === (year || currentYear)
  );

  const growthInYear = () => {
    window.ipc.send("getYearlyGrowthPercentage", {year});

    window.ipc.on("getYearlyGrowthPercentage", async (res: APiRes) => {
      if (res.success) {
        const { data } = res;
        setGrowth(data)
      }
    });
  };

  const TotalRenenueInYear = () => {
    window.ipc.send("getYearlyRevenueChart", { year });

    window.ipc.on("getYearlyRevenueChart", async (res: APiRes) => {
      if (res.success) {
        const newPaymentCount: number[] = [];
        const newInvoiceCount: number[] = [];
        const newRevenue: number[] = [];

        for (const elm of res.data) {
          newPaymentCount.push(elm.paymentCount);
          newInvoiceCount.push(elm.invoiceCount);
          newRevenue.push(elm.totalRevenue);
        }

        setPaymentsInYear(newRevenue);
        setYearsData({
          invoiceCount: newInvoiceCount,
          paymentCount: newPaymentCount,
        });
      }
    });
  };

  const TotalStats = () => {
    window.ipc.send("getReportStats", year);

    window.ipc.on("getReportStats", async (res: APiRes) => {
      if (res.success) {
        setReportStats({
          totalDueInvoice: res.data.totalDueInvoices,
          totalInvoice: res.data.totalInvoices,
          totalPaidInovice: res.data.totalPaidInvoices,
          totalPaymets: res.data.totalPayments,
        });
      }
    });
  };

  useEffect(() => {
    growthInYear();
    TotalRenenueInYear();
    TotalStats();
  }, [year]);

  return (
    <React.Fragment>
      <Head>
        <title>ReckonUp - Devloped by NIreX</title>
      </Head>
      <section className="p-1 bg-primary-100 h-[calc(100%-16px)] overflow-auto rounded-xl m-2">
        <Header title="Reports" extraStyle="mb-2" />
        <div className="rounded-lg border border-primary-500 bg-primary-50 min-h-screen px-5 py-5">
          <div className="flex justify-between">
            <h2 className="text-3xl font-bold text-primary-900">
              Report Of <span>{year}</span>
            </h2>
            <Select
              options={yearOptions}
              value={selected}
              onChange={(selectedOption) => setYear(selectedOption.value)}
              placeholder="Select Year"
              isClearable
              className="outline-none "
            />
          </div>
          <div className=" w-full grid grid-cols-2 gap-x-5">
            <div>
              <div className="grid grid-cols-2 gap-x-5 gap-y-3 mt-5">
                <div className="h-[180px] bg-primary-200 p-5 border border-primary-300 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="text-[24px] font-semibold text-primary-800">
                      Total Invoices
                    </h3>
                    <FaFileInvoiceDollar
                      size={45}
                      className="p-3 bg-primary-800 text-white rounded-xl"
                    />
                  </div>

                  <h2 className="text-[40px] font-semibold mt-3 text-primary-900">
                    {reportStats.totalInvoice}
                  </h2>
                </div>
                <div className="h-[180px] bg-primary-200 p-5 border border-primary-300 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="text-[24px] font-semibold text-primary-800">
                      Total Payments
                    </h3>
                    <FaRegCreditCard
                      size={45}
                      className="p-3 bg-primary-800 text-white rounded-xl"
                    />
                  </div>

                  <h2 className="text-[40px] font-semibold mt-3 text-primary-900">
                    {reportStats.totalPaymets}
                  </h2>
                </div>
                <div className="h-[180px] bg-primary-200 p-5 border border-primary-300 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="text-[24px] font-semibold text-primary-800">
                      Total Paid Invoice
                    </h3>
                    <MdPaid
                      size={45}
                      className="p-3 bg-primary-800 text-white rounded-xl"
                    />
                  </div>

                  <h2 className="text-[40px] font-semibold mt-3 text-primary-900">
                    {reportStats.totalPaidInovice}
                  </h2>
                </div>
                <div className="h-[180px] bg-primary-200 p-5 border border-primary-300 rounded-lg">
                  <div className="flex justify-between">
                    <h3 className="text-[24px] font-semibold text-primary-800">
                      Total Due Invoice
                    </h3>
                    <IoMdWarning
                      size={45}
                      className="p-3 bg-primary-800 text-white rounded-xl"
                    />
                  </div>

                  <h2 className="text-[40px] font-semibold mt-3 text-primary-900">
                    {reportStats.totalDueInvoice}
                  </h2>
                </div>
              </div>

              <div className=" w-full border border-primary-300 bg-primary-200 rounded-lg p-3 mt-4">
                <TotalPaymentsInMonth payments={paymentsInYear} />
              </div>
            </div>
            <div className=" mt-5">
              <InvoiceSatatusChart
                paymentCount={yearsData.paymentCount}
                invoiceCount={yearsData.invoiceCount}
              />
              <ProgressLevel percentage={growth} />
            </div>
          </div>
        </div>
      </section>
    </React.Fragment>
  );
};

reports.getLayout = (page: ReactElement) => {
  return <RootLayout>{page}</RootLayout>;
};

export default reports;
