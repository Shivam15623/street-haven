import React, { useEffect, useState } from "react";
import { SocketContext } from "./SocketContext";
import { io, type Socket } from "socket.io-client";
import { useSelector } from "react-redux";
import { selectAuth } from "../redux/AuthSlice";

const SOCKET_URL = import.meta.env.VITE_Socket_URL;

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { accessToken } = useSelector(selectAuth);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"], // polling as fallback
      withCredentials: true,
      auth: {
        token:accessToken,
      },
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      setConnected(false);
      console.log("socket disconnected:", reason);
    });

    // #1 — visibility into connection failures
    newSocket.on("connect_error", (err) => {
      console.log("socket connect_error:", err.message);
    });

    // fires on every successful reconnect (not the first connect)
    newSocket.io.on("reconnect", (attempt) => {
      console.log("socket reconnected after", attempt, "attempts");
    });

    newSocket.io.on("reconnect_attempt", (attempt) => {
      console.log("socket reconnect_attempt:", attempt);
    });

    newSocket.io.on("reconnect_failed", () => {
      console.log("socket reconnect_failed — giving up");
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("disconnect");
      newSocket.off("connect_error");
      newSocket.io.off("reconnect");
      newSocket.io.off("reconnect_attempt");
      newSocket.io.off("reconnect_failed");
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
};
