import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn("bg-background rounded-xl border shadow-[var(--shadow-card)]", className)}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-1.5 p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return <h3 className={cn("text-base leading-tight font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-muted-foreground text-sm", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("px-5 pb-5 sm:px-6 sm:pb-6", className)} {...props} />;
}

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
  {
    variants: {
      variant: {
        neutral: "bg-muted text-foreground",
        dark: "bg-foreground text-background",
        accent: "bg-gc-orange-soft text-[#9a3a06]",
        success: "bg-green-50 text-success",
        warning: "bg-amber-50 text-warning",
        danger: "bg-red-50 text-destructive",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function Alert({
  className,
  tone = "info",
  ...props
}: React.ComponentProps<"div"> & { tone?: "info" | "warning" | "error" | "success" }) {
  const tones = {
    info: "border-border bg-muted",
    warning: "border-amber-200 bg-amber-50 text-amber-900",
    error: "border-red-200 bg-red-50 text-red-900",
    success: "border-green-200 bg-green-50 text-green-900",
  } as const;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn("rounded-lg border px-4 py-3 text-sm", tones[tone], className)}
      {...props}
    />
  );
}
