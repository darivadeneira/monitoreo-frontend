import React, { useMemo } from 'react';
import { ResourceChart } from '../graficas/ResourceCharts';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

import { CircularProgress } from "../graficas/CircularProgress";

const MemoryView = ({ resources, historicalData }) => {

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

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Monitoreo de Memoria</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className='flex flex-1 space-between gap-4'>
          <div className="bg-white p-4 rounded-lg shadow">
            <p><strong>Memoria Usada:</strong> {resources.memory.used} MB</p>
            <p><strong>Memoria Total:</strong> {resources.memory.total} MB</p>
            <p><strong>Porcentaje Uso:</strong> {resources.memory.percentage}%</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <CircularProgress
              title="Memoria"
              value={resources.memory.percentage}
              color="#36A2EB"
              size={100}
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
            color="#36A2EB"
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
