import React from 'react';
import Layout from './components/layout/Layout';  // Usar importación nombrada
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import LoginRegister from './components/auth/LoginRegister';

const ProtectedApp = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginRegister />;
  }

  return <Layout />;
};

const App = () => {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
};

export default App;
