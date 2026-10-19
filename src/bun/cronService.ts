import crontab from "crontab";
import type { CronJobData, CronSavePayload } from "../types";

export class CronService {
  private lastJobs: any[] = [];

  public async getJobs(): Promise<CronJobData[]> {
    return new Promise((resolve, reject) => {
      crontab.load((err: any, api: any) => {
        if (err) {
          // If no crontab exists yet for user, it's not a fatal error
          return resolve([]);
        }

        const rawJobs = api.jobs();
        this.lastJobs = rawJobs;

        const jobs: CronJobData[] = rawJobs.map((j: any, index: number) => {
          const minute = j.minute() ? j.minute().toString() : "*";
          const hour = j.hour() ? j.hour().toString() : "*";
          const day = j.dom() ? j.dom().toString() : "*";
          const month = j.month() ? j.month().toString() : "*";
          const weekday = j.dow() ? j.dow().toString() : "*";
          const comment = j.comment() || "";
          const command = j.command() || "";

          return {
            id: `job_${index}`,
            name: comment || command || `Job #${index + 1}`,
            command,
            minute,
            hour,
            day,
            month,
            weekday,
            raw: j.render(),
            isValid: j.isValid(),
          };
        });

        resolve(jobs);
      });
    });
  }

  public async saveJob(payload: CronSavePayload): Promise<{ success: boolean; id?: string }> {
    return new Promise((resolve, reject) => {
      crontab.load((err: any, api: any) => {
        if (err) {
          return reject(err);
        }

        const rawJobs = api.jobs();

        // If updating an existing job, find and remove it first
        if (payload.id) {
          const indexMatch = payload.id.match(/^job_(\d+)$/);
          if (indexMatch) {
            const idx = parseInt(indexMatch[1], 10);
            if (rawJobs[idx]) {
              api.remove(rawJobs[idx]);
            }
          }
        }

        const schedule = [
          payload.minute || "*",
          payload.hour || "*",
          payload.day || "*",
          payload.month || "*",
          payload.weekday || "*",
        ].join(" ");

        const newJob = api.create(
          payload.command || 'echo "hello world"',
          schedule,
          payload.name || ""
        );

        if (!newJob || !newJob.isValid()) {
          return reject(new Error("Invalid cron syntax or command"));
        }

        api.save((saveErr: any) => {
          if (saveErr) {
            return reject(saveErr);
          }
          resolve({ success: true });
        });
      });
    });
  }

  public async deleteJob(id: string): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      crontab.load((err: any, api: any) => {
        if (err) {
          return reject(err);
        }

        const rawJobs = api.jobs();
        const indexMatch = id.match(/^job_(\d+)$/);
        if (!indexMatch) {
          return reject(new Error("Job not found"));
        }

        const idx = parseInt(indexMatch[1], 10);
        const target = rawJobs[idx];
        if (!target) {
          return reject(new Error("Job not found in current crontab"));
        }

        api.remove(target);
        api.save((saveErr: any) => {
          if (saveErr) {
            return reject(saveErr);
          }
          resolve({ success: true });
        });
      });
    });
  }
}

export const cronService = new CronService();
