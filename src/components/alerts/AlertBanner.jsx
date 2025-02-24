import React from 'react';

export const AlertBanner = ({ message, type = 'warning' }) => {
  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-yellow-100';
  const textColor = type === 'error' ? 'text-red-700' : 'text-yellow-700';
  const borderColor = type === 'error' ? 'border-red-400' : 'border-yellow-400';

  return (
    <div className={`${bgColor} ${textColor} ${borderColor} border px-4 py-3 rounded relative mb-4`} role="alert">
      <strong className="font-bold mr-2">¡Alerta!</strong>
      <span className="block sm:inline">{message}</span>
    </div>
  );
};
