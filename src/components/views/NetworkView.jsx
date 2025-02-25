import React from 'react';
import { CircularProgress } from '../graficas/CircularProgress';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  getPaginationRowModel,
} from "@tanstack/react-table";

const NetworkView = ({ resources }) => {
  const columns = [
    {
      header: "No.",
      accessorFn: (_, index) => index + 1,
    },
    {
      header: "PID",
      accessorKey: "pid",
    },
    {
      header: "Aplicación",
      accessorKey: "name",
    }
  ];

  const table = useReactTable({
    data: resources?.network?.network_apps || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const renderInterfacesInfo = () => {
    return Object.entries(resources.network.active_interfaces).map(([name, data]) => (
      <div key={name} className="mb-2">
        <p className="font-medium">{name}:</p>
        <p className="ml-4 text-sm text-gray-600">Tráfico total: {data.total_traffic.toFixed(2)} MB</p>
      </div>
    ));
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-4">Monitoreo de Red</h2>
      <div className="grid grid-cols-1 gap-4">
        {/* Panel superior con métricas */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Información general */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold mb-3">Información de Red</h3>
            <div className="space-y-2">
              <p><strong>Total enviado:</strong> {resources.network.total_sent.toFixed(2)} MB</p>
              <p><strong>Total recibido:</strong> {resources.network.total_recv.toFixed(2)} MB</p>
              <p><strong>Tráfico total:</strong> {resources.network.total_traffic.toFixed(2)} MB</p>
              <div className="mt-4">
                <h4 className="font-bold mb-2">Interfaces:</h4>
                {renderInterfacesInfo()}
              </div>
            </div>
          </div>

          {/* Velocidad de subida */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-2">Velocidad de Subida</h3>
            <CircularProgress
              title="Upload"
              value={Number(resources.network.upload_speed).toFixed(2)}
              color="#4CAF50"
              size={180}
              suffix="Mbps"
              max={1}
            />
          </div>

          {/* Velocidad de bajada */}
          <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-2">Velocidad de Bajada</h3>
            <CircularProgress
              title="Download"
              value={Number(resources.network.download_speed).toFixed(2)}
              color="#2196F3"
              size={180}
              suffix="Mbps"
              max={1}
            />
          </div>
        </div>

        {/* Tabla de aplicaciones */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <h3 className="text-xl font-bold p-4">Aplicaciones usando la red</h3>
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

export default NetworkView;
