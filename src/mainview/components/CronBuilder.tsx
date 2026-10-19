import React, { useState, useEffect } from "react";
import type { CronJobData, CronSavePayload } from "../../types";
import { Copy, Check, Trash2, Save, X, Calendar, Clock, Terminal, Tag } from "lucide-react";

interface CronBuilderProps {
  job: CronJobData;
  onSave: (payload: CronSavePayload) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

type FrequencyPreset = "minutely" | "hourly" | "nightly" | "weekly" | "monthly" | "yearly" | "custom";

export function CronBuilder({ job, onSave, onCancel, onDelete }: CronBuilderProps) {
  const [name, setName] = useState(job.name || "");
  const [command, setCommand] = useState(job.command || "");
  const [minute, setMinute] = useState(job.minute || "*");
  const [hour, setHour] = useState(job.hour || "*");
  const [day, setDay] = useState(job.day || "*");
  const [month, setMonth] = useState(job.month || "*");
  const [weekday, setWeekday] = useState(job.weekday || "*");
  const [frequency, setFrequency] = useState<FrequencyPreset>("custom");
  const [copied, setCopied] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    setName(job.name || "");
    setCommand(job.command || "");
    setMinute(job.minute || "*");
    setHour(job.hour || "*");
    setDay(job.day || "*");
    setMonth(job.month || "*");
    setWeekday(job.weekday || "*");

    // Detect preset
    const exp = `${job.minute} ${job.hour} ${job.day} ${job.month} ${job.weekday}`;
    if (exp === "* * * * *") setFrequency("minutely");
    else if (exp === "0 * * * *") setFrequency("hourly");
    else if (exp === "0 0 * * *") setFrequency("nightly");
    else if (exp === "0 0 * * 0") setFrequency("weekly");
    else if (exp === "0 0 1 * *") setFrequency("monthly");
    else if (exp === "0 0 1 1 *") setFrequency("yearly");
    else setFrequency("custom");

    setShowConfirmDelete(false);
  }, [job]);

  const handlePreset = (preset: FrequencyPreset) => {
    setFrequency(preset);
    switch (preset) {
      case "minutely":
        setMinute("*");
        setHour("*");
        setDay("*");
        setMonth("*");
        setWeekday("*");
        break;
      case "hourly":
        setMinute("0");
        setHour("*");
        setDay("*");
        setMonth("*");
        setWeekday("*");
        break;
      case "nightly":
        setMinute("0");
        setHour("0");
        setDay("*");
        setMonth("*");
        setWeekday("*");
        break;
      case "weekly":
        setMinute("0");
        setHour("0");
        setDay("*");
        setMonth("*");
        setWeekday("0");
        break;
      case "monthly":
        setMinute("0");
        setHour("0");
        setDay("1");
        setMonth("*");
        setWeekday("*");
        break;
      case "yearly":
        setMinute("0");
        setHour("0");
        setDay("1");
        setMonth("1");
        setWeekday("*");
        break;
      case "custom":
        break;
    }
  };

  const cronExpression = `${minute} ${hour} ${day} ${month} ${weekday}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cronExpression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: job.id,
      name,
      command,
      minute,
      hour,
      day,
      month,
      weekday,
    });
  };

  return (
    <div className="h-full flex flex-col overflow-y-auto p-6 max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-6 flex-1">
        {/* Job Title and Action Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div>
            <h1 className="text-xl font-bold text-neutral-100">
              {job.id ? "Edit Cron Job" : "New Cron Job"}
            </h1>
            <p className="text-xs text-neutral-400 mt-0.5">
              Configure command execution schedule on macOS
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save Job
            </button>
          </div>
        </div>

        {/* Basic Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-neutral-400" />
              Job Name / Comment
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Daily Database Backup"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-neutral-400" />
              Command
            </label>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder='e.g. /usr/local/bin/backup.sh or echo "hello"'
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-sm font-mono text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition"
              required
            />
          </div>
        </div>

        {/* Schedule & Presets */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            Frequency Presets
          </label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {[
              { id: "minutely", label: "Minutely" },
              { id: "hourly", label: "Hourly" },
              { id: "nightly", label: "Nightly" },
              { id: "weekly", label: "Weekly" },
              { id: "monthly", label: "Monthly" },
              { id: "yearly", label: "Yearly" },
              { id: "custom", label: "Custom" },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePreset(p.id as FrequencyPreset)}
                className={`py-1.5 px-2 text-xs rounded-md border text-center transition cursor-pointer font-medium ${
                  frequency === p.id
                    ? "bg-blue-600/20 border-blue-500 text-blue-400"
                    : "bg-neutral-950/60 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Cron Parts Grid */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-neutral-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            Schedule Expressions
          </label>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <span className="block text-[11px] text-neutral-400 mb-1">Minute (0-59)</span>
              <input
                type="text"
                value={minute}
                onChange={(e) => {
                  setMinute(e.target.value);
                  setFrequency("custom");
                }}
                className="w-full text-center font-mono bg-neutral-950 border border-neutral-800 rounded-md py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <span className="block text-[11px] text-neutral-400 mb-1">Hour (0-23)</span>
              <input
                type="text"
                value={hour}
                onChange={(e) => {
                  setHour(e.target.value);
                  setFrequency("custom");
                }}
                className="w-full text-center font-mono bg-neutral-950 border border-neutral-800 rounded-md py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <span className="block text-[11px] text-neutral-400 mb-1">Day (1-31)</span>
              <input
                type="text"
                value={day}
                onChange={(e) => {
                  setDay(e.target.value);
                  setFrequency("custom");
                }}
                className="w-full text-center font-mono bg-neutral-950 border border-neutral-800 rounded-md py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <span className="block text-[11px] text-neutral-400 mb-1">Month (1-12)</span>
              <input
                type="text"
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  setFrequency("custom");
                }}
                className="w-full text-center font-mono bg-neutral-950 border border-neutral-800 rounded-md py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
            <div>
              <span className="block text-[11px] text-neutral-400 mb-1">Weekday (0-6)</span>
              <input
                type="text"
                value={weekday}
                onChange={(e) => {
                  setWeekday(e.target.value);
                  setFrequency("custom");
                }}
                className="w-full text-center font-mono bg-neutral-950 border border-neutral-800 rounded-md py-1.5 text-xs text-neutral-100 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Live Cron Expression Bar */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400">Cron syntax:</span>
            <code className="text-sm font-mono text-blue-400 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
              {cronExpression}
            </code>
          </div>
          <button
            type="button"
            onClick={copyToClipboard}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-200 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Delete Area */}
        {job.id && (
          <div className="pt-4 border-t border-neutral-800/80">
            {showConfirmDelete ? (
              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg flex items-center justify-between">
                <span className="text-xs text-red-200">
                  Are you sure you want to delete &ldquo;{job.name}&rdquo;?
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirmDelete(false)}
                    className="px-2.5 py-1 text-xs rounded border border-neutral-700 text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                  >
                    Keep Job
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(job.id)}
                    className="px-2.5 py-1 text-xs rounded bg-red-600 hover:bg-red-500 text-white font-medium cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="text-xs text-red-400 hover:text-red-300 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete this job
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
