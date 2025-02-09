import React from 'react';
import {Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register( CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend );

const options = {
  responsive: true,
  animation: {
    duration: 0
  },
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

export const ResourceChart = ({ title, data, color }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.values,
        borderColor: color,
        backgroundColor: color + '40',
        fill: true,
      },
    ],
  };

  return <Line options={options} data={chartData} />;
};
