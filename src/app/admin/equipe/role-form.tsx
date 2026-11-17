"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/form-controls";
import { setUserRole } from "@/features/admin/actions";

export function RoleForm({ roles }: { roles: { value: string; label: string }[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  return (
    <form
      className="grid gap-5 sm:grid-cols-[1fr_14rem_auto] sm:items-end"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const res = await setUserRole({ email: fd.get("email"), role: fd.get("role") });
          setStatus(res.ok ? { tone: "success", text: "Rôle mis à jour." } : { tone: "error", text: res.message });
          if (res.ok) {
            form.reset();
            router.refresh();
          }
        });
      }}
    >
      {status ? (
        <Alert tone={status.tone} className="sm:col-span-3">
          {status.text}
        </Alert>
      ) : null}
      <Field id="role-email" label="E-mail du compte">
        <Input id="role-email" name="email" type="email" required />
      </Field>
      <Field id="role-role" label="Rôle">
        <select
          id="role-role"
          name="role"
          className="bg-background h-11 rounded-lg border px-3 text-sm"
          defaultValue="SUPPORT"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Appliquer
      </Button>
    </form>
  );
}
