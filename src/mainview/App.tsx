import React, { useEffect, useState, useCallback } from "react";
import type { CronJobData, CronSavePayload } from "../types";
import { fetchJobs, saveJob, deleteJob } from "./api";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Placeholder } from "./components/Placeholder";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    __MacroniCreateJob?: () => void;
    __MacroniRefreshJobs?: () => void;
  }
}

export function App() {
  const [jobs, setJobs] = useState<CronJobData[]>([]);
  const [selectedJob, setSelectedJob] = useState<CronJobData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadJobs = useCallback(async (preserveSelectedId?: string | null) => {
    try {
      setLoading(true);
      const data = await fetchJobs();
      setJobs(data);

      if (preserveSelectedId) {
        const found = data.find((j) => j.id === preserveSelectedId);
        if (found) setSelectedJob(found);
      }
    } catch (err: any) {
      showToast(err?.message || "Failed to load jobs", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateNew = useCallback(() => {
    const blankJob: CronJobData = {
      id: "",
      name: "New Scheduled Job",
      command: 'echo "hello world"',
      minute: "*",
      hour: "*",
      day: "*",
      month: "*",
      weekday: "*",
      isValid: true,
    };
    setSelectedJob(blankJob);
  }, []);

  const handleSave = async (payload: CronSavePayload) => {
    try {
      await saveJob(payload);
      showToast(`Saved "${payload.name}" successfully`);
      await loadJobs(payload.id || null);
    } catch (err: any) {
      showToast(err?.message || "Failed to save job", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const jobToDelete = jobs.find((j) => j.id === id);
      await deleteJob(id);
      showToast(`Deleted "${jobToDelete?.name || id}"`);
      setSelectedJob(null);
      await loadJobs();
    } catch (err: any) {
      showToast(err?.message || "Failed to delete job", "error");
    }
  };

  useEffect(() => {
    loadJobs();

    // Register native menu shortcuts
    window.__MacroniCreateJob = handleCreateNew;
    window.__MacroniRefreshJobs = () => loadJobs(selectedJob?.id);

    return () => {
      delete window.__MacroniCreateJob;
      delete window.__MacroniRefreshJobs;
    };
  }, [loadJobs, handleCreateNew, selectedJob?.id]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-900 text-neutral-100">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-xs font-medium shadow-xl transition-all duration-200 border ${
            toast.type === "success"
              ? "bg-emerald-950/90 border-emerald-700/60 text-emerald-200"
              : "bg-red-950/90 border-red-700/60 text-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Sidebar */}
      <Sidebar
        jobs={jobs}
        selectedJob={selectedJob}
        onSelect={(job) => setSelectedJob(job)}
        onCreate={handleCreateNew}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-neutral-900">
        {loading && jobs.length === 0 ? (
          <div className="h-full flex items-center justify-center text-neutral-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
            <span className="text-xs">Loading crontab...</span>
          </div>
        ) : selectedJob ? (
          <Editor
            job={selectedJob}
            onSave={handleSave}
            onCancel={() => setSelectedJob(null)}
            onDelete={handleDelete}
          />
        ) : (
          <Placeholder onCreate={handleCreateNew} />
        )}
      </main>
    </div>
  );
}
