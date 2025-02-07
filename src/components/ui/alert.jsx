import * as React from "react";
import { X } from "lucide-react";

export function Alert({ children, variant = "info", onClose }) {
  const variants = {
    info: "bg-blue-100 text-blue-800 border-blue-500",
    success: "bg-green-100 text-green-800 border-green-500",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-500",
    error: "bg-red-100 text-red-800 border-red-500",
  };

  return (
    <div
      className={`relative flex items-center p-4 border-l-4 rounded-lg ${variants[variant]}`}
      role="alert"
    >
      <span className="flex-1">{children}</span>
      {onClose && (
        <button onClick={onClose} className="ml-4 text-current">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
