import React, { useEffect, useState } from "react";
import { socket, connectSocket, getSocket } from "../services/socketService";
import { ResourceChart } from "./graficas/ResourceCharts";
import { CircularProgress } from "./graficas/CircularProgress";
import CpuView from './views/CpuView';
import MemoryView from './views/MemoryView';
import NetworkView from './views/NetworkView';  // Add import
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const MAX_DATA_POINTS = 30;

const SystemResources = ({ view }) => {
  const location = useLocation();
  const { user } = useAuth();
  const [resources, setResources] = useState(null);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [viewData, setViewData] = useState("chart");

  const [historicalData, setHistoricalData] = useState({
    cpu: { labels: [], values: [] },
    memory: { labels: [], values: [] },
    disk: { labels: [], values: [] },
    network: { labels: [], values: [] }, // Add network historical data
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
      network: {
        labels: [...prev.network.labels.slice(-MAX_DATA_POINTS), currentTime],
        values: [...prev.network.values.slice(-MAX_DATA_POINTS), newData.network],
      },
    }));
  };

  useEffect(() => {
    let isSubscribed = true;
    let currentSocket = null;

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
        currentSocket?.emit("get_resources");
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

    const setupSocketListeners = (socket) => {
      if (!socket) return;
      
      socket.on("connect", handleConnect);
      socket.on("disconnect", handleDisconnect);
      socket.on("connect_error", handleConnectError);
      socket.on("resources", handleResources);
    };

    const connect = async () => {
      try {
        if (!user) {
          throw new Error('No hay usuario autenticado');
        }

        currentSocket = await connectSocket();
        if (currentSocket) {
          setupSocketListeners(currentSocket);
          setIsConnected(currentSocket.connected);
        }
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
      if (currentSocket) {
        currentSocket.off("connect", handleConnect);
        currentSocket.off("disconnect", handleDisconnect);
        currentSocket.off("connect_error", handleConnectError);
        currentSocket.off("resources", handleResources);
      }
    };
  }, [user]);

  useEffect(() => {
    console.log("Current view:", view); // Para debug
    console.log("Current path:", location.pathname); // Para debug
  }, [view, location]);

  const handleReconnect = async () => {
    setIsLoading(true);
    setResources(null);

    try {
      // Desconectar socket existente
      const currentSocket = getSocket();
      if (currentSocket) {
        currentSocket.removeAllListeners();
        currentSocket.close();
      }

      // Crear nueva conexión
      const newSocket = await connectSocket();
      
      // Configurar listeners para el nuevo socket
      newSocket.on("resources", (data) => {
        setResources(data);
        updateHistoricalData(data);
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
        setError("Desconectado del servidor");
      });

      setIsConnected(true);
      setError(null);
      
      // Solicitar recursos inmediatamente
      newSocket.emit("get_resources");
    } catch (error) {
      setError("Error al reconectar");
      console.error("Error de reconexión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (error) {
      return <p className="text-red-500 text-center">{error}</p>;
    }

    if (isLoading || !resources) {
      return (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4">Cargando recursos...</p>
        </div>
      );
    }

    switch (view) {
      case 'cpu':
        return <CpuView resources={resources} historicalData={historicalData} />;
      case 'memory':
        return <MemoryView resources={resources} historicalData={historicalData} />;
      case 'network':
        return <NetworkView resources={resources} historicalData={historicalData} />;  // Add network case
      default:
        return (
          <div className="w-full">
            {/* Información de recursos en cards responsivas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="font-bold">CPU:</p>
                <p>{resources.cpu.cpu_percentage}%</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="font-bold">Memoria:</p>
                <p>{resources.memory.used} MB / {resources.memory.total} MB</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="font-bold">Porcentaje Memoria:</p>
                <p>{resources.memory.percentage}%</p>
              </div>
              {/* New network card */}
              <div className="bg-white p-4 rounded-lg shadow">
                <p className="font-bold">Red:</p>
                <p>↑ {resources.network.upload_speed} Mbps</p>
                <p>↓ {resources.network.download_speed} Mbps</p>
              </div> 
            </div>

            {/* Selector de vista movido al centro */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center bg-white px-4 py-2 rounded-lg shadow">
                <label className="mr-2 font-bold">Vista:</label>
                <select
                  value={viewData}
                  onChange={(e) => setViewData(e.target.value)}
                  className="border p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="chart">Gráfica</option>
                  <option value="circular">Circular</option>
                </select>
              </div>
            </div>

            {viewData === "circular" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="w-full flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-xl md:text-2xl font-bold mb-4">USO CPU</h3>
                  <CircularProgress 
                    title="CPU" 
                    value={resources.cpu.cpu_percentage} 
                    color="#FF6384"
                    size={window.innerWidth < 768 ? 200 : 300}
                  />
                </div>

                <div className="w-full flex flex-col items-center justify-center bg-white rounded-lg shadow-sm p-4">
                  <h3 className="text-xl md:text-2xl font-bold mb-4">USO MEMORIA</h3>
                  <CircularProgress 
                    title="Memoria" 
                    value={resources.memory.percentage} 
                    color="#36A2EB"
                    size={window.innerWidth < 768 ? 200 : 300}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="w-full">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">USO CPU</h3>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <ResourceChart title="CPU %" data={{
                      labels: historicalData.cpu.labels,
                      values: historicalData.cpu.values.map(val => (val.cpu_percentage))
                    }} color="#4CAF50" />
                  </div>
                </div>

                <div className="w-full">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">USO MEMORIA</h3>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <ResourceChart 
                      title="Memory (%)" 
                      data={{
                        labels: historicalData.memory.labels,
                        values: historicalData.memory.values.map(val => (val.percentage))
                      }} 
                      color="#36A2EB" 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
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

        {renderContent()}
      </div>
    </div>
  );
};

export default SystemResources;
