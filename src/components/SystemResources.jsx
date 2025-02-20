import React, { useEffect, useState } from "react";
import { socket, connectSocket } from "../services/socketService";
import { ResourceChart } from "./graficas/ResourceCharts";
import { CircularProgress } from "./graficas/CircularProgress";

const MAX_DATA_POINTS = 30;

const SystemResources = () => {
  const [resources, setResources] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewData, setViewData] = useState("chart");

  const [historicalData, setHistoricalData] = useState({
    cpu: { labels: [], values: [] },
    memory: { labels: [], values: [] },
    disk: { labels: [], values: [] },
  });

  const updateHistoricalData = (newData) => {
    const currentTime = new Date().toLocaleTimeString();

    setHistoricalData((prev) => ({
      cpu: {
        labels: [...prev.cpu.labels.slice(-MAX_DATA_POINTS), currentTime],
        values: [...prev.cpu.values.slice(-MAX_DATA_POINTS), newData.cpu],
      },
      memory: {
        labels: [...prev.memory.labels.slice(-MAX_DATA_POINTS), currentTime],
        values: [...prev.memory.values.slice(-MAX_DATA_POINTS), newData.memory],
      },
      disk: {
        labels: [...prev.disk.labels.slice(-MAX_DATA_POINTS), currentTime],
        values: [...prev.disk.values.slice(-MAX_DATA_POINTS), newData.disk],
      },
    }));
  };

  useEffect(() => {
    let isSubscribed = true;

    const handleResources = (data) => {
      if (isSubscribed) {
        setResources(data);
        updateHistoricalData(data);
      }
    };

    const handleConnect = () => {
      if (isSubscribed) {
        setIsConnected(true);
        setError(null);
        socket.emit("get_resources");
      }
    };

    const handleDisconnect = () => {
      if (isSubscribed) {
        setIsConnected(false);
        setError("Desconectado del servidor");
      }
    };

    const handleConnectError = (err) => {
      if (isSubscribed) {
        setIsConnected(false);
        setError("Error de conexión al servidor");
        console.error("Error de conexión:", err);
      }
    };

    const connect = async () => {
      try {
        if (!socket.connected) {
          await connectSocket();
        }

        setIsConnected(socket.connected);

        socket.off("connect").on("connect", handleConnect);
        socket.off("disconnect").on("disconnect", handleDisconnect);
        socket.off("connect_error").on("connect_error", handleConnectError);
        socket.off("resources").on("resources", handleResources);
      } catch (error) {
        if (isSubscribed) {
          setIsConnected(false);
          setError("Error de conexión al servidor");
          console.error("Error detallado:", error);
        }
      }
    };

    connect();

    return () => {
      isSubscribed = false;
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("resources", handleResources);
    };
  }, []);

  const handleReconnect = async () => {
    setIsLoading(true);
    setResources(null);

    try {
      if (socket.connected) {
        socket.disconnect();
      }

      await connectSocket();
      setError(null);
    } catch (error) {
      setError("Error al reconectar");
      console.error("Error de reconexión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[400px]">
      <div className="w-full max-w-7xl mx-auto p-6">
        {/* Estado de conexión */}
        <div className="flex flex-col md:flex-row mb-4 gap-4">
          <p className="text-lg md:text-xl">
            Estado de conexión: {isConnected ? "🟢 Conectado" : "🔴 Desconectado"}
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
            onClick={handleReconnect}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center cursor-not-allowed focus:outline-none disabled:opacity-75">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                <span>Reconectando...</span>
              </div>
            ) : (
              <span>Recargar</span>
            )}
          </button>
        </div>

        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : isLoading || !resources ? (
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4">Cargando recursos...</p>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <label className="mr-2 font-bold">Vista:</label>
              <select
                value={viewData}
                onChange={(e) => setViewData(e.target.value)}
                className="border p-1 rounded"
              >
                <option value="chart">Gráfica</option>
                <option value="circular">Circular</option>
              </select>
            </div>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <p>
                <strong>CPU:</strong> {resources.cpu}%
              </p>
              <p>
                <p><strong>Memoria:</strong> {resources.memory.used} MB / {resources.memory.total} MB ({resources.memory.percentage}%)</p>
              </p>
            </div>

            {/* Mostrar solo CircularProgress cuando la opción circular esté seleccionada */}
            {viewData === "circular" ? (
              <div className="mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="w-full h-[400px] flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4">USO CPU</h3>
                    <CircularProgress 
                      title="CPU" 
                      value={resources.cpu} 
                      color="#FF6384"
                      size={300} // Add size prop to CircularProgress component
                    />
                  </div>

                  <div className="w-full h-[400px] flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-4">USO MEMORIA</h3>
                    <CircularProgress 
                      title="Memoria" 
                      value={resources.memory.percentage} 
                      color="#36A2EB"
                      size={300}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="mb-6">
                {/* Mostrar gráficas de líneas solo si la opción no es circular */}
                <div className="flex flex-col lg:flex-row mb-6 gap-4">
                  <div className="w-full lg:w-[600px]">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-2">USO CPU</h3>
                    <ResourceChart title="CPU %" data={historicalData.cpu} color="#FF6384" />
                  </div>

                  <div className="w-full lg:w-[600px]">
                    <h3 className="text-2xl lg:text-3xl font-bold mb-2">USO MEMORIA</h3>
                    <ResourceChart title="Memory (%)" data={{
                      labels: historicalData.memory.labels,
                      values: historicalData.memory.values.map(val => (val.percentage))
                    }} color="#36A2EB" />

                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemResources;
