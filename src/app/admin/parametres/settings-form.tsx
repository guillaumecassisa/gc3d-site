"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import { Field, Input, Textarea } from "@/components/ui/form-controls";
import { saveSettings } from "@/features/admin/actions";
import type { SettingKey } from "@/features/settings/schema";

export type SettingField = {
  name: string;
  label: string;
  type?: "text" | "email" | "url" | "textarea" | "checkbox";
  hint?: string;
  required?: boolean;
};

/** Formulaire générique de paramètres ; la validation fait foi côté serveur (Zod). */
export function SettingsForm({
  settingKey,
  fields,
  values,
}: {
  settingKey: SettingKey;
  fields: SettingField[];
  values: Record<string, unknown>;
}) {
  const [pending, start] = useTransition();
  const [status, setStatus] = useState<{ tone: "success" | "error"; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  return (
    <form
      className="grid gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload: Record<string, unknown> = { ...values };
        for (const f of fields) {
          payload[f.name] = f.type === "checkbox" ? fd.get(f.name) === "on" : String(fd.get(f.name) ?? "");
        }
        start(async () => {
          const res = await saveSettings(settingKey, payload);
          setFieldErrors(res.ok ? {} : (res.fieldErrors ?? {}));
          setStatus(
            res.ok ? { tone: "success", text: "Paramètres enregistrés." } : { tone: "error", text: res.message },
          );
        });
      }}
    >
      {status ? <Alert tone={status.tone}>{status.text}</Alert> : null}
      <div className="grid gap-5 md:grid-cols-2">
        {fields.map((f) => {
          const id = `${settingKey}-${f.name}`;
          const error = fieldErrors[f.name]?.[0];
          const raw = values[f.name];
          if (f.type === "checkbox") {
            return (
              <label key={f.name} className="flex items-start gap-3 text-sm md:col-span-2">
                <input
                  type="checkbox"
                  name={f.name}
                  defaultChecked={Boolean(raw)}
                  className="mt-0.5 size-5 accent-[var(--gc-orange)]"
                />
                <span>
                  {f.label}
                  {f.hint ? <span className="text-muted-foreground block text-xs">{f.hint}</span> : null}
                </span>
              </label>
            );
          }
          return (
            <Field
              key={f.name}
              id={id}
              label={f.label}
              hint={f.hint}
              error={error}
              required={f.required}
              className={f.type === "textarea" ? "md:col-span-2" : undefined}
            >
              {f.type === "textarea" ? (
                <Textarea
                  id={id}
                  name={f.name}
                  defaultValue={(raw as string | null) ?? ""}
                  rows={3}
                  aria-invalid={!!error}
                />
              ) : (
                <Input
                  id={id}
                  name={f.name}
                  type={f.type ?? "text"}
                  defaultValue={(raw as string | null) ?? ""}
                  aria-invalid={!!error}
                />
              )}
            </Field>
          );
        })}
      </div>
      <Button type="submit" variant="primary" disabled={pending} className="w-fit">
        {pending ? <Loader2 className="animate-spin" aria-hidden /> : null}
        Enregistrer
      </Button>
    </form>
  );
}
