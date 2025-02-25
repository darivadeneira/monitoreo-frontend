import React, { useState, useEffect, useRef } from 'react';
import { ResourceChart } from '../graficas/ResourceCharts';
import { CircularProgress } from '../graficas/CircularProgress';
import { AlertBanner } from '../alerts/AlertBanner';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { getStoredThreshold, storeThreshold, CPU_THRESHOLD_KEY } from '../../services/thresholdService';
import { postAlert } from '../../api/alerts'; // Corregido para usar postAlert

const CpuView = ({ resources, historicalData }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [threshold, setThreshold] = useState(() => getStoredThreshold(CPU_THRESHOLD_KEY) || 80);
  const debounceRef = useRef(null); // Referencia para manejar el debounce

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      storeThreshold(CPU_THRESHOLD_KEY, threshold);
    }, 2000); // Esperamos 2 segundos antes de guardar el nuevo umbral

    return () => clearTimeout(debounceRef.current);
  }, [threshold]);

  const handleThresholdChange = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Solo números
    const numericValue = parseInt(value, 10);

    if (value === '') {
      setThreshold(0);
    } else if (numericValue >= 0 && numericValue <= 100) {
      setThreshold(numericValue);
    }
  };

  const handleThresholdExceeded = async (isExceeded) => {
    setShowAlert(isExceeded);

    if (isExceeded) {
      try {
        await postAlert({
          resource_type: "CPU",
          threshold,
          current_value: resources.cpu.cpu_percentage,
        });
      } catch (error) {
        console.error('Error al crear alerta de CPU:', error);
      }
    }
  };

  const columns = [
    {
      header: "No.",
      accessorFn: (_, index) => index + 1,
    },
    {
      header: "PID",
      accessorKey: "pid",
      sortingFn: (rowA, rowB) => {
        const a = parseInt(rowA.original.pid, 10);
        const b = parseInt(rowB.original.pid, 10);
        return isNaN(a) || isNaN(b) ? 0 : a - b;
      }
    },
    {
      header: "Nombre",
      accessorKey: "name",
    },
  ];

  const table = useReactTable({
    data: resources?.cpu.processes || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Monitoreo de CPU</h2>
      {showAlert && (
        <AlertBanner 
          message={`¡Alerta! El uso de CPU ha superado el ${threshold}%`}
          type="error" 
        />
      )}
      <div className="grid grid-cols-1 gap-4">
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className="bg-white p-4 rounded-lg shadow">
            <p><strong>CPU Uso Actual:</strong> {resources.cpu.cpu_percentage}%</p>
            <p><strong>Procesos Activos:</strong> {resources.cpu.process_count}</p>
            <p><strong>Frecuencia de trabajo:</strong> {resources.cpu.cpu_frequency.current} GHz</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite de alerta CPU (%):
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={threshold}
                onChange={handleThresholdChange}
                placeholder="Ingrese valor (0-100)"
              />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-2">Uso del CPU</h3>
            <CircularProgress
              title="CPU"
              value={resources.cpu.cpu_percentage}
              color="#4CAF50"
              size={180}
              warningThreshold={threshold}
              onThresholdExceeded={handleThresholdExceeded}
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-2">Temperatura CPU</h3>
            <CircularProgress
              title="°C"
              value={resources.cpu.cpu_temperature}
              color="#FF6384"
              size={180}
              suffix="°C"
            />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <ResourceChart
            title="CPU Usage %"
            data={{
              labels: historicalData.cpu.labels,
              values: historicalData.cpu.values.map(val => val.cpu_percentage)
            }}
            color="#4CAF50"
            warningThreshold={threshold}
          />
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-xl font-bold p-4">Procesos</h3>
          <p className="text-sm text-gray-500 ml-2">
            Mostrando página {table.getState().pagination.pageIndex + 1} de{' '}
            {table.getPageCount()}
          </p>
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="bg-gray-100 border-b p-2 text-left cursor-pointer hover:bg-gray-200"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{ asc: " 🔼", desc: " 🔽" }[header.column.getIsSorted()] ?? null}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="border-b p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CpuView;
