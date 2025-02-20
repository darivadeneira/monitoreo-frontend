import React from 'react';
import { Layout } from './components/layout/Layout';

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Layout />
      </main>
    </div>
  );
};

export default App;
