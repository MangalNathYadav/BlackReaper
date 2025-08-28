import * as React from "react";
import { cn } from "../lib/utils";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({ checked, onChange, label }: SwitchProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <span className="text-sm text-gray-300">{label}</span>
      <button
        type="button"
        className={cn(
          "w-10 h-6 rounded-full bg-gray-700 relative transition-colors",
          checked ? "bg-blue-600" : "bg-gray-700"
        )}
        onClick={() => onChange(!checked)}
      >
        <span
          className={cn(
            "absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-4" : "translate-x-0"
          )}
        />
      </button>
    </label>
  );
}
