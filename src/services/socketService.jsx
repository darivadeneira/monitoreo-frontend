import { io } from "socket.io-client";

const socket = io("http://localhost:8000", {
    transports: ['websocket'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    upgrade: false
});

const connectSocket = () => {
    return new Promise((resolve, reject) => {
        if (socket.connected) {
            console.log("Socket ya conectado");
            resolve(socket);
            return;
        }

        const timeout = setTimeout(() => {
            reject(new Error("Timeout en la conexión"));
        }, 5000);

        socket.connect();

        socket.on("connect", () => {
            clearTimeout(timeout);
            console.log("Socket conectado exitosamente con WebSocket - ID:", socket.id);
            // Solicitar datos inmediatamente después de la conexión
            socket.emit("get_resources");
            resolve(socket);
        });

        socket.on("disconnect", () => {
            console.log("Socket desconectado");
        });

        socket.on("connect_error", (error) => {
            clearTimeout(timeout);
            console.error("Error de conexión:", error);
            reject(error);
        });
    });
};

export { socket, connectSocket };
