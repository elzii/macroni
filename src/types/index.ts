export interface CronJobData {
  id: string;
  name: string;
  command: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekday: string;
  raw?: string;
  isValid?: boolean;
}

export interface CronSavePayload {
  id?: string | null;
  name: string;
  command: string;
  minute: string;
  hour: string;
  day: string;
  month: string;
  weekday: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
