import React, { useEffect, useState } from 'react';

export const CircularProgress = ({ 
  title, 
  value, 
  color, 
  size = 200, 
  suffix = '%',
  warningThreshold,
  onThresholdExceeded 
}) => {
  const [currentColor, setCurrentColor] = useState(color);
  
  useEffect(() => {
    if (warningThreshold && value >= warningThreshold) {
      setCurrentColor('#DC2626');
      onThresholdExceeded?.(true); // Indicamos que se excedió el umbral
    } else {
      setCurrentColor(color);
      onThresholdExceeded?.(false); // Indicamos que estamos por debajo del umbral
    }
  }, [value, warningThreshold, color, onThresholdExceeded]);

  const radius = size * 0.35;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-gray-200"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="transition-all duration-300 ease-in-out"
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={currentColor}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: currentColor }}>
          {Number(value).toFixed(2)}{suffix}
        </span>
        <span className="text-sm text-gray-500">{title}</span>
      </div>
    </div>
  );
};