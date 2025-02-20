import React from "react";

export const CircularProgress = ({ value, maxValue = 100, size = 128, color = "#3B82F6" }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle 
          strokeWidth="10" 
          stroke="#E5E7EB" // Color gris claro para el fondo
          fill="transparent" 
          r="40" 
          cx="50" 
          cy="50" 
        />
        <circle
          strokeWidth="10"
          strokeLinecap="round"
          stroke={color} // Usar el color directamente aquí
          fill="transparent"
          r="40"
          cx="50"
          cy="50"
          strokeDasharray="251.2"
          strokeDashoffset={(1 - percentage / 100) * 251.2}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <span className="absolute text-2xl font-bold">{Math.round(percentage)}%</span>
    </div>
  );
};