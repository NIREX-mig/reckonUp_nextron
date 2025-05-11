import React from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { MonthsChartLable } from '../../constents';

// Register components with Chart.js
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Title, Tooltip, Legend);

const options: any = {
  responsive: true,
  plugins: {
    filler: {
      propagate: false,
    },
    interaction: {
      intersect: false,
    },
  },
};

const TotalPaymentsInMonth = ({ payments }) => {
  const data = {
    labels: MonthsChartLable,
    datasets: [
      {
        label: 'Amounts',
        data: payments,
        borderColor: '#176437',
        fill: false,
        tension: 0.4, // For smooth curves
      },
    ],
  };
  return (
    <div className=" h-full w-fullp-3 bg-primary-200">
      <h2 className="text-2xl font-semibold text-primary-900 mb-3">Total Payments In year</h2>
      <Line options={options} data={data} />
    </div>
  );
};

export default TotalPaymentsInMonth;
