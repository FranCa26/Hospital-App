
"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

const Toast = ({ message, type = "info", onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Esperar a que termine la animación
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return (
          <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
        );
      case "error":
        return (
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
        );
      case "warning":
        return (
          <AlertTriangle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
        );
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800";
      case "error":
        return "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800";
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800";
      case "info":
      default:
        return "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800";
    }
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-in-out ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      } ${getBgColor()} border rounded-lg shadow-lg p-4 max-w-md w-full backdrop-blur-sm`}
      role="alert"
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 w-0 flex-1 pt-0.5">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none transition-colors"
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
          >
            <span className="sr-only">Cerrar</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;

