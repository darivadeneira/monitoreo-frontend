import React, { useEffect, useState } from "react";
import { socket, connectSocket } from "../services/socketService";
import { ResourceChart } from "./ResourceCharts";

const MAX_DATA_POINTS = 30;

const SystemResources = () => {
  const [resources, setResources] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [historicalData, setHistoricalData] = useState({
    cpu: { labels: [], values: [] },
    memory: { labels: [], values: [] },
    disk: { labels: [], values: [] }
  });

  const updateHistoricalData = (newData) => {
    const currentTime = new Date().toLocaleTimeString();

    setHistoricalData(prev => ({
      cpu: {
        labels: [...prev.cpu.labels.slice(-MAX_DATA_POINTS), currentTime],
        values: [...prev.cpu.values.slice(-MAX_DATA_POINTS), newData.cpu]
      },
      memory: {
        labels: [...prev.memory.labels.slice(-MAX_DATA_POINTS), currentTime],
        values: [...prev.memory.values.slice(-MAX_DATA_POINTS), newData.memory]
      },
      disk: {
        labels: [...prev.disk.labels.slice(-MAX_DATA_POINTS), currentTime],
        values: [...prev.disk.values.slice(-MAX_DATA_POINTS), newData.disk]
      }
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
    <div className=" flex flex-col items-center justify-center w-full">
      <div className="mx-auto p-4">
        <h1 className="text-2xl font-bold text-center">Monitoreo de Recursos</h1>
      </div> 
      <div className="mx-auto p-4 items-center justify-center">
        <div className="flex flex-row justify-center items-center mb-4 gap-4">
          <p className="text-xl">
            Estado de conexión: {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
          </p>
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
            <div className="mb-6">
              <h3>Valores Actuales:</h3>
              <p><strong>CPU:</strong> {resources.cpu}%</p>
              <p><strong>Memoria:</strong> {Math.round(resources.memory)} MB</p>
              <p><strong>Disco:</strong> {Math.round(resources.disk)} GB</p>
            </div>
            
            {/* Primera fila: CPU y Memory */}
            <div className="flex flex-row mb-6">
              <div className="w-[600px]">
                <h3 className="text-3xl font-bold mb-2">CPU Usage</h3>
                <ResourceChart
                  title="CPU %"
                  data={historicalData.cpu}
                  color="#FF6384"
                />
              </div>

              <div className="w-[600px]">
                <h3 className="text-3xl font-bold mb-2">Memory Usage</h3>
                <ResourceChart
                  title="Memory (MB)"
                  data={historicalData.memory}
                  color="#36A2EB"
                />
              </div>
            </div>

            {/* Segunda fila: Disk */}
            <div className="w-[600px]">
              <h3 className="text-3xl font-bold mb-2">Disk Usage</h3>
              <ResourceChart
                title="Disk (GB)"
                data={historicalData.disk}
                color="#4BC0C0"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SystemResources;
