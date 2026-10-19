import React from "react";
import type { CronJobData, CronSavePayload } from "../../types";
import { CronBuilder } from "./CronBuilder";

interface EditorProps {
  job: CronJobData;
  onSave: (payload: CronSavePayload) => void;
  onCancel: () => void;
  onDelete: (id: string) => void;
}

export function Editor({ job, onSave, onCancel, onDelete }: EditorProps) {
  return (
    <main className="flex-1 h-screen overflow-hidden bg-neutral-900">
      <CronBuilder
        job={job}
        onSave={onSave}
        onCancel={onCancel}
        onDelete={onDelete}
      />
    </main>
  );
}
