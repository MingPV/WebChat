"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // เชื่อมต่อกับเซิร์ฟเวอร์ socket
    const newSocket = io(
      `${process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080"}`,
      { autoConnect: false },
    ); // เปลี่ยน URL ตาม backend
    newSocket.connect();
    socketRef.current = newSocket;
    setSocket(newSocket);

    // cleanup เมื่อ component ถูก unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
