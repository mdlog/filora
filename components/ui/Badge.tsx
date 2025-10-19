import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold transition-all",
    {
        variants: {
            variant: {
                default: "bg-gray-100 text-gray-800",
                primary: "bg-indigo-100 text-indigo-700",
                success: "bg-green-100 text-green-700",
                warning: "bg-yellow-100 text-yellow-700",
                danger: "bg-red-100 text-red-700",
                info: "bg-blue-100 text-blue-700",
                live: "bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-500/50",
                sold: "bg-gray-400 text-white",
                inactive: "bg-gray-200 text-gray-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
    icon?: React.ReactNode;
}

function Badge({ className, variant, icon, children, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant }), className)} {...props}>
            {icon && icon}
            {children}
        </div>
    );
}

export { Badge, badgeVariants };
