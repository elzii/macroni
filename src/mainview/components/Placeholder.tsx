import React from "react";
import { PlusCircle, Clock } from "lucide-react";

interface PlaceholderProps {
  onCreate: () => void;
}

export function Placeholder({ onCreate }: PlaceholderProps) {
  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center select-none">
      <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-neutral-700/60 flex items-center justify-center text-neutral-400 mb-5 shadow-lg">
        <Clock className="w-8 h-8 text-blue-400" />
      </div>
      <h2 className="text-xl font-semibold text-neutral-100 mb-2">No Job Selected</h2>
      <p className="text-neutral-400 max-w-sm text-sm mb-6">
        Select a cron job from the sidebar to inspect or edit, or create a brand new scheduled task.
      </p>
      <button
        onClick={onCreate}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition shadow-sm active:scale-98 cursor-pointer"
      >
        <PlusCircle className="w-4 h-4" />
        Create Job
      </button>
    </div>
  );
}
