import type { CronJobData, CronSavePayload } from "../types";

const BASE_URL = "http://127.0.0.1:38241/api";

export async function fetchJobs(): Promise<CronJobData[]> {
  const res = await fetch(`${BASE_URL}/jobs`);
  if (!res.ok) {
    throw new Error(`Failed to load jobs: ${res.statusText}`);
  }
  const data = (await res.json()) as { success: boolean; data: CronJobData[]; error?: string };
  if (!data.success) {
    throw new Error(data.error || "Failed to load jobs");
  }
  return data.data;
}

export async function saveJob(payload: CronSavePayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as { success: boolean; error?: string };
  if (!data.success) {
    throw new Error(data.error || "Failed to save job");
  }
}

export async function deleteJob(id: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/jobs/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const data = (await res.json()) as { success: boolean; error?: string };
  if (!data.success) {
    throw new Error(data.error || "Failed to delete job");
  }
}
