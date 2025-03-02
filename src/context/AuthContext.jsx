import React, { createContext, useState, useContext } from 'react';
import { disconnectSocket } from '../services/socketService';
import { authService } from '../api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    // Primero desconectar el socket
    disconnectSocket();
    // Luego limpiar datos de autenticación
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Llamar al logout del servicio
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
