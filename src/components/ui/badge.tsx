import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  // Traço de 2px e caixa alta: o mesmo selo usado em "NOVO"/"PDF" no catálogo.
  "inline-flex items-center rounded-pill border-2 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.053em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary bg-primary text-primary-foreground",
        secondary: "border-border bg-secondary text-secondary-foreground",
        // Vermelho é erro: reservado, não é só "um badge vermelho".
        destructive: "border-danger bg-danger text-danger-foreground",
        success: "border-success bg-success text-success-foreground",
        outline: "border-border bg-card text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
