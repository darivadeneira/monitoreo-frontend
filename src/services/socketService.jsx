import { io } from "socket.io-client";
import { authService } from '../api/authService';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
let socket = null;

const createSocket = () => {
    const user = authService.getCurrentUser();
    if (!user || !user.id) {
        throw new Error("No hay usuario autenticado o falta ID de usuario");
    }

    if (socket) {
        socket.removeAllListeners();
        socket.close();
        socket = null;
    }

    const newSocket = io(SOCKET_URL, {
        transports: ['websocket'],
        autoConnect: false,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        upgrade: false,
        query: { 
            user_id: user.id,
            token: localStorage.getItem('token') 
        }
    });

    socket = newSocket;
    return newSocket;
};

const connectSocket = async () => {
    return new Promise((resolve, reject) => {
        try {
            const newSocket = createSocket();
            
            const onConnect = () => {
                console.log("Socket conectado - ID:", newSocket.id);
                newSocket.emit("get_resources");
                resolve(newSocket);
            };

            const onConnectError = (error) => {
                console.error("Error de conexión socket:", error);
                newSocket.off("connect", onConnect);
                newSocket.off("connect_error", onConnectError);
                reject(new Error("Error de conexión al servidor"));
            };

            newSocket.on("connect", onConnect);
            newSocket.on("connect_error", onConnectError);

            newSocket.connect();

            // Timeout de conexión
            setTimeout(() => {
                if (!newSocket.connected) {
                    newSocket.off("connect", onConnect);
                    newSocket.off("connect_error", onConnectError);
                    reject(new Error("Tiempo de conexión agotado"));
                }
            }, 5000);

        } catch (error) {
            console.error("Error al crear socket:", error);
            reject(error);
        }
    });
};

const disconnectSocket = () => {
    if (socket) {
        socket.removeAllListeners();
        socket.close();
        socket = null;
    }
};

const getSocket = () => socket;

export { socket, connectSocket, disconnectSocket, getSocket };
