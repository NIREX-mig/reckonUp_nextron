import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { MonthsChartLable } from '../../constents';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const options: any = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const InvoiceSatatusChart = ({ invoiceCount, paymentCount }) => {
  const data = {
    labels: MonthsChartLable,
    datasets: [
      {
        label: 'No of payments',
        data: paymentCount,
        backgroundColor: 'indigo',
        // backgroundColor: "#12668c",
        borderWidth: 1,
        borderRadius: Number.MAX_VALUE,
        borderSkipped: false,
      },
      {
        label: 'No of invoices',
        data: invoiceCount,
        // backgroundColor: "#193874",
        backgroundColor: 'teal',
        borderWidth: 1,
        borderRadius: Number.MAX_VALUE,
        borderSkipped: false,
      },
    ],
  };

  return (
    <div className="h-[50%] border border-primary-300 rounded-lg p-3 bg-primary-200">
      <h2 className="text-2xl font-semibold text-primary-900 mb-3">Total Revenue In A year</h2>
      <Bar options={options} data={data} />
    </div>
  );
};

export default InvoiceSatatusChart;
