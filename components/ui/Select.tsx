import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ChevronDown, AlertCircle } from "lucide-react";

const selectVariants = cva(
    "flex w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "border-gray-200 focus-visible:border-indigo-500 focus-visible:ring-indigo-500",
                error: "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> {
    label?: string;
    error?: string;
    helperText?: string;
    options: Array<{ value: string; label: string; disabled?: boolean }>;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, variant, label, error, helperText, options, ...props }, ref) => {
        return (
            <div className="w-full space-y-2">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <select
                        className={cn(
                            selectVariants({ variant: error ? "error" : variant }),
                            className
                        )}
                        ref={ref}
                        {...props}
                    >
                        {options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {error && (
                    <div className="flex items-center gap-1 text-sm text-red-600">
                        <AlertCircle className="h-4 w-4" />
                        <span>{error}</span>
                    </div>
                )}
                {helperText && !error && (
                    <p className="text-sm text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Select.displayName = "Select";

export { Select, selectVariants };
