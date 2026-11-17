import { Slot } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /** Achat / action principale — orange GC3D */
        accent: "bg-accent text-accent-foreground hover:bg-gc-orange-hover",
        primary: "bg-primary text-primary-foreground hover:bg-gc-anthracite",
        outline: "border border-foreground/15 bg-background hover:bg-muted",
        "outline-inverse": "border border-white/30 text-white hover:bg-white/10",
        ghost: "hover:bg-muted",
        link: "text-foreground underline-offset-4 hover:underline",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
