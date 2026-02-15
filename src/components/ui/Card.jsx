import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '' }) {
  return (
    <div className={`p-6 pb-4 ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '' }) {
  return (
    <h3 className={`text-xl font-semibold text-white ${className}`}>
      {children}
    </h3>
  );
}

export function CardContent({ children, className = '' }) {
  return (
    <div className={`p-6 pt-0 ${className}`}>
      {children}
    </div>
  );
}