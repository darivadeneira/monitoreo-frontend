import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react'; // Íconos de menú y cerrar

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { path: '/overview', label: 'Vista General', icon: '📈' },
    { path: '/cpu', label: 'CPU', icon: '📊' },
    { path: '/memory', label: 'Memoria', icon: '💾' },
    { path: '/network', label: 'Red', icon: '🌐' },
  ];

  return (
    <>
      {/* Botón flotante para abrir/cerrar sidebar en móviles */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 bg-gray-800 text-white p-2 rounded-full z-50 shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar flotante con bordes, sombra y sticky */}
      <div
        className={`fixed lg:relative top-0 left-0 h-full w-64 bg-gray-800 p-4 
          transition-transform shadow-lg rounded-lg flex flex-col items-center
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex`}
      >
        {/* Encabezado fijo arriba */}
        <h2 className="text-white text-xl font-bold mb-6 sticky top-0 bg-gray-800 w-full text-center py-2 rounded-lg">
          Tipo de Recursos
        </h2>

        {/* Menú centrado */}
        <nav className="flex flex-col space-y-2 flex-grow justify-center">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)} // Cierra el menú al hacer clic
              className={({ isActive }) => `
                flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors
                ${isActive ? 'bg-gray-700' : ''}
              `}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
