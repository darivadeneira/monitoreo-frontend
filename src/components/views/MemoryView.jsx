import React, { useMemo, useState, useEffect } from 'react';
import { ResourceChart } from '../graficas/ResourceCharts';
import { AlertBanner } from '../alerts/AlertBanner';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import { CircularProgress } from "../graficas/CircularProgress";
import { getStoredThreshold, storeThreshold, MEMORY_THRESHOLD_KEY } from '../../services/thresholdService';
import { postAlert } from '../../api/alerts'; 

const MemoryView = ({ resources, historicalData }) => {
  const [showAlert, setShowAlert] = useState(false);
  const [thresholdGB, setThresholdGB] = useState(() => getStoredThreshold(MEMORY_THRESHOLD_KEY) || 4);

  // Agregar useEffect para monitorear el uso de memoria
  useEffect(() => {
    const thresholdMB = thresholdGB * 1024;
    if (resources.memory.used >= thresholdMB) {
      setShowAlert(true);
      
      // Llamar a la API para crear una alerta
      postAlert({
        resource_type: "Memory",
        threshold: thresholdGB,
        current_value: resources.memory.used,
      });

    } else {
      setShowAlert(false);
    }
  }, [resources.memory.used, thresholdGB]);

  const handleThresholdChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const numericValue = parseFloat(value);
    
    if (value === '' || value === '.') {
      setThresholdGB(0);
    } else if (!isNaN(numericValue) && numericValue >= 0) {
      setThresholdGB(numericValue);
      storeThreshold(MEMORY_THRESHOLD_KEY, numericValue);
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
    {
      header: "Uso de Memoria",
      accessorKey: "memory_mb",
      cell: ({ getValue }) => `${getValue()} MB`,
    }
  ];
  
  const data = useMemo(() => resources?.memory.processes || [], [resources?.memory.processes]);

  const table = useReactTable({
    data: data,
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

  // Obtener el color basado en el estado de alerta
  const getChartColor = () => {
    const thresholdMB = thresholdGB * 1024;
    return resources.memory.used >= thresholdMB ? '#DC2626' : '#36A2EB';  // Usando el mismo verde que CPU
  };

  const currentColor = getChartColor();

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Monitoreo de Memoria</h2>
      {showAlert && (
        <AlertBanner 
          message={`¡Alerta! El uso de Memoria ha superado ${thresholdGB} GB`}
          type="error" 
        />
      )}
      <div className="grid grid-cols-1 gap-4">
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className="bg-white p-4 rounded-lg shadow">
            <p><strong>Memoria Usada:</strong> {(resources.memory.used)} GB</p>
            <p><strong>Memoria Total:</strong> {(resources.memory.total / 1024).toFixed(2)} GB</p>
            <p><strong>Porcentaje Uso:</strong> {resources.memory.percentage.toFixed(2)}%</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite de alerta Memoria (GB):
              </label>
              <input
                type="text"
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                value={thresholdGB}
                onChange={handleThresholdChange}
                placeholder="Ingrese valor en GB"
              />
              <p className="text-sm text-gray-500 mt-1">
                {`${(thresholdGB * 1024).toFixed(2)} MB`}
              </p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-2">Uso de Memoria</h3>
            <CircularProgress
              title="Memoria"
              value={resources.memory.percentage}
              color={currentColor}
              size={180}
              warningThreshold={resources.memory.used >= thresholdGB * 1024 ? 0 : 101}
              onThresholdExceeded={setShowAlert}
            />
          </div>
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-2">Memoria Libre</h3>
            <CircularProgress
              title="Libre"
              value={100 - resources.memory.percentage}
              color={currentColor}
              size={180}
            />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-2xl lg:text-3xl font-bold mb-2">Uso de Memoria</h3>
          <ResourceChart
            title="Memory Usage"
            data={{
              labels: historicalData.memory.labels,
              values: historicalData.memory.values.map(val => (val.percentage))
            }}
            color={currentColor}
            warningThreshold={thresholdGB * 1024} // Pasamos el umbral en MB
          />
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-2xl font-bold mb-4 p-2">Procesos de Memoria</h3>
          <p className="text-sm text-gray-500">
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

          {/* Controles de paginación */}
          <div className="flex items-center justify-between p-4 border-t">
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded border hover:bg-gray-100"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                {'<<'}
              </button>
              <button
                className="px-3 py-1 rounded border hover:bg-gray-100"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                {'<'}
              </button>
              <button
                className="px-3 py-1 rounded border hover:bg-gray-100"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                {'>'}
              </button>
              <button
                className="px-3 py-1 rounded border hover:bg-gray-100"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                {'>>'}
              </button>
            </div>
            <span className="flex items-center gap-1">
              <div>Página</div>
              <strong>
                {table.getState().pagination.pageIndex + 1} de{' '}
                {table.getPageCount()}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryView;
