import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS } from 'chart.js/auto';

export const ResourceChart = ({ title, data, color, warningThreshold }) => {
  const getColor = (values) => {
    // Para CPU, comparamos el último valor (más reciente) con el umbral
    if (title.includes("CPU")) {
      const currentValue = values[values.length - 1];
      return currentValue >= warningThreshold ? '#DC2626' : color;
    } 
    // Para memoria, mantenemos la lógica existente
    else if (title.includes("Memory")) {
      const maxMemoryUsageGB = Math.max(...values) / 100 * data.totalMemoryGB;
      return maxMemoryUsageGB >= warningThreshold ? '#DC2626' : color;
    }
    return color;
  };

  const currentColor = getColor(data.values);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 0
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      x: {
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      }
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: 2,
        fill: true
      },
      point: {
        radius: 3,
        hitRadius: 10,
        hoverRadius: 5
      }
    }
  };

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: title,
        data: data.values,
        borderColor: currentColor,
        backgroundColor: currentColor + '40',
        fill: true,
      }
    ]
  };

  return (
    <div className="w-full h-[300px]">
      <Line options={options} data={chartData} />
    </div>
  );
};