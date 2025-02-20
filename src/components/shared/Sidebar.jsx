import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  const menuItems = [
    { path: '/overview', label: 'Vista General', icon: '📈' },
    { path: '/cpu', label: 'CPU', icon: '📊' },
    { path: '/memory', label: 'Memoria', icon: '💾' },
  ];

  return (
    <div className="w-64 bg-gray-800 min-h-screen fixed left-0">
      <div className="sticky top-0 p-4">
        <h2 className="text-white text-xl font-bold mb-6">Monitor System</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
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
    </div>
  );
};

export default Sidebar;
