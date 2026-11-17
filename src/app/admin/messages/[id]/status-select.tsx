"use client";

import { useState, useTransition } from "react";
import type { ContactStatus } from "@/generated/prisma/enums";
import { Alert } from "@/components/ui/card";
import { updateMessageStatus } from "@/features/admin/actions";
import { MESSAGE_STATUS } from "../status";

export function StatusSelect({ id, status }: { id: string; status: ContactStatus }) {
  const [value, setValue] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="grid gap-2">
      <label htmlFor="status" className="text-sm font-medium">
        Statut du message
      </label>
      <select
        id="status"
        value={value}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value as ContactStatus;
          const previous = value;
          setValue(next);
          start(async () => {
            const res = await updateMessageStatus({ id, status: next });
            if (!res.ok) {
              setValue(previous);
              setError(res.message);
            } else setError(null);
          });
        }}
        className="bg-background h-11 w-full max-w-xs rounded-lg border px-3 text-sm"
      >
        {Object.entries(MESSAGE_STATUS).map(([k, v]) => (
          <option key={k} value={k}>
            {v.label}
          </option>
        ))}
      </select>
      {error ? <Alert tone="error">{error}</Alert> : null}
    </div>
  );
}
