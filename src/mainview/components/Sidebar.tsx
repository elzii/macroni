import React, { useState } from "react";
import type { CronJobData } from "../../types";
import { Plus, Search, Terminal, AlertCircle } from "lucide-react";

interface SidebarProps {
  jobs: CronJobData[];
  selectedJob: CronJobData | null;
  onSelect: (job: CronJobData) => void;
  onCreate: () => void;
}

export function Sidebar({ jobs, selectedJob, onSelect, onCreate }: SidebarProps) {
  const [search, setSearch] = useState("");

  const filteredJobs = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      j.name.toLowerCase().includes(q) ||
      j.command.toLowerCase().includes(q) ||
      (j.raw && j.raw.toLowerCase().includes(q))
    );
  });

  return (
    <aside className="w-72 bg-neutral-950/80 border-r border-neutral-800 flex flex-col h-screen select-none">
      {/* Top action header */}
      <div className="p-3 border-b border-neutral-800/80 space-y-2">
        <button
          onClick={onCreate}
          className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer active:scale-98"
        >
          <Plus className="w-4 h-4" />
          Create Job
        </button>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-md pl-8 pr-2.5 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition"
          />
        </div>
      </div>

      {/* Jobs list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs px-4">
            No cron jobs found. Click &ldquo;Create Job&rdquo; to add your first one.
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 text-xs px-4">
            No jobs match &ldquo;{search}&rdquo;.
          </div>
        ) : (
          filteredJobs.map((job) => {
            const isSelected = selectedJob?.id === job.id;
            return (
              <button
                key={job.id}
                onClick={() => onSelect(job)}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition text-xs flex flex-col gap-1 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-sm"
                    : "hover:bg-neutral-800/60 text-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium truncate max-w-[190px]">{job.name}</span>
                  {!job.isValid && (
                    <AlertCircle className={`w-3.5 h-3.5 ${isSelected ? "text-yellow-200" : "text-yellow-500"}`} />
                  )}
                </div>
                <div className={`flex items-center gap-1 text-[11px] truncate font-mono ${isSelected ? "text-blue-100" : "text-neutral-500"}`}>
                  <Terminal className="w-3 h-3 shrink-0 opacity-70" />
                  <span className="truncate">{job.command || "No command"}</span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Footer info */}
      <div className="p-3 border-t border-neutral-800/80 text-[11px] text-neutral-500 flex items-center justify-between">
        <span>Macroni</span>
        <span>{jobs.length} {jobs.length === 1 ? "job" : "jobs"}</span>
      </div>
    </aside>
  );
}
