import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const progressVariants = cva(
    "relative h-2 w-full overflow-hidden rounded-full",
    {
        variants: {
            variant: {
                default: "bg-gray-200",
                success: "bg-green-100",
                warning: "bg-yellow-100",
                danger: "bg-red-100",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const progressBarVariants = cva(
    "h-full transition-all duration-500 ease-out",
    {
        variants: {
            variant: {
                default: "bg-gradient-to-r from-indigo-600 to-purple-600",
                success: "bg-gradient-to-r from-green-500 to-emerald-500",
                warning: "bg-gradient-to-r from-yellow-500 to-orange-500",
                danger: "bg-gradient-to-r from-red-500 to-pink-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface ProgressProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof progressVariants> {
    value: number;
    max?: number;
    showValue?: boolean;
    label?: string;
    size?: "sm" | "md" | "lg";
}

const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
    ({ className, variant, value, max = 100, showValue, label, size = "md", ...props }, ref) => {
        const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

        return (
            <div className="w-full space-y-2">
                {(label || showValue) && (
                    <div className="flex items-center justify-between">
                        {label && (
                            <span className="text-sm font-semibold text-gray-700">{label}</span>
                        )}
                        {showValue && (
                            <span className="text-sm font-bold text-gray-600">
                                {Math.round(percentage)}%
                            </span>
                        )}
                    </div>
                )}
                <div
                    ref={ref}
                    className={cn(progressVariants({ variant }), sizeClasses[size], className)}
                    {...props}
                >
                    <div
                        className={cn(progressBarVariants({ variant }))}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        );
    }
);

Progress.displayName = "Progress";

export { Progress };

// Circular Progress Component
export interface CircularProgressProps {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    showValue?: boolean;
    variant?: "default" | "success" | "warning" | "danger";
}

export function CircularProgress({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    showValue = true,
    variant = "default",
}: CircularProgressProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    const colors = {
        default: "text-indigo-600",
        success: "text-green-500",
        warning: "text-yellow-500",
        danger: "text-red-500",
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-gray-200"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={cn("transition-all duration-500", colors[variant])}
                />
            </svg>
            {showValue && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-700">
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
}
