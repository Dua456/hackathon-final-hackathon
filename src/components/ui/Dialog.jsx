import React from 'react';

export function Dialog({ children, open, onOpenChange }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative bg-gray-800 rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { onClose: () => onOpenChange(false) })
        )}
      </div>
    </div>
  );
}

export function DialogTrigger({ children, onClick }) {
  return React.cloneElement(children, { onClick });
}

export function DialogContent({ children, onClose }) {
  return (
    <div className="p-6">
      <div className="flex justify-end mb-4">
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  );
}

export function DialogHeader({ children }) {
  return <div className="mb-4">{children}</div>;
}

export function DialogTitle({ children }) {
  return <h3 className="text-lg font-semibold text-white">{children}</h3>;
}