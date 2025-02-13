import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground",
        pending: "border-yellow-200 bg-yellow-100 text-yellow-800",
        approved: "border-green-200 bg-green-100 text-green-800",
        rejected: "border-red-200 bg-red-100 text-red-800",
        completed: "border-blue-200 bg-blue-100 text-blue-800",
        in_progress: "border-purple-200 bg-purple-100 text-purple-800",
        canceled: "border-red-200 bg-red-100 text-red-800",
        on_hold: "border-cyan-200 bg-cyan-100 text-cyan-800",
        reporting: "border-indigo-200 bg-indigo-100 text-indigo-800",
        in_transit: "border-orange-200 bg-orange-100 text-orange-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
