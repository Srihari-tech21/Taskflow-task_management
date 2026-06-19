import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, token } = useAuth();

 useEffect(() => {
  if (user && token) {
    const socketUrl = (
      import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
    ).replace('/api', '');

    const newSocket = io(socketUrl, {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      newSocket.emit('join_user', user._id);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }
}, [user, token]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
