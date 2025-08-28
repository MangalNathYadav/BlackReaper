import * as React from "react";
import { cn } from "../lib/utils";

export interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
}

export function Toast({ message, type = "info" }: ToastProps) {
  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-semibold transition-all",
        type === "success" && "bg-green-600",
        type === "error" && "bg-red-600",
        type === "info" && "bg-blue-600"
      )}
    >
      {message}
    </div>
  );
}
