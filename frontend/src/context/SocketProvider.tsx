import React, { useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { io, type Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_Socket_URL;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"], // force websocket transport
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {

      setConnected(true);
    });

    newSocket.on("disconnect", () => {

      setConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
