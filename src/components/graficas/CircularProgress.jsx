import React from "react";

export const CircularProgress = ({ value, maxValue = 100, size = 128, color = "blue" }) => {
  const percentage = (value / maxValue) * 100;

  return (
    <div className={`relative flex items-center justify-center`} style={{ width: size, height: size }}>
      <svg className="w-full h-full" viewBox="0 0 100 100">
        <circle 
          className="text-gray-200" 
          strokeWidth="10" 
          stroke="currentColor" 
          fill="transparent" 
          r="40" 
          cx="50" 
          cy="50" 
        />
        <circle
          className={`text-${color}-500`}
          strokeWidth="10"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r="40"
          cx="50"
          cy="50"
          strokeDasharray="251.2"
          strokeDashoffset={(1 - percentage / 100) * 251.2}
        />
      </svg>
      <span className="absolute text-2xl font-bold">{Math.round(percentage)}%</span>
    </div>
  );
};