import * as React from "react";
import { cn } from "../lib/utils";

export interface TabsProps {
  tabs: string[];
  active: number;
  onTabChange: (idx: number) => void;
}

export function Tabs({ tabs, active, onTabChange }: TabsProps) {
  return (
    <div className="flex gap-2 border-b border-gray-700 mb-4">
      {tabs.map((tab, idx) => (
        <button
          key={tab}
          className={cn(
            "px-4 py-2 text-sm font-semibold rounded-t transition-colors",
            active === idx ? "bg-gradient-to-r from-blue-600 to-red-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          )}
          onClick={() => onTabChange(idx)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
