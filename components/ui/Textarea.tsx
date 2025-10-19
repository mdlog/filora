import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

const textareaVariants = cva(
    "flex w-full rounded-xl border bg-white px-4 py-3 text-sm transition-all placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
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

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
    label?: string;
    error?: string;
    helperText?: string;
    maxLength?: number;
    showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant, label, error, helperText, maxLength, showCount, value, ...props }, ref) => {
        const currentLength = value?.toString().length || 0;

        return (
            <div className="w-full space-y-2">
                {label && (
                    <div className="flex items-center justify-between">
                        <label className="block text-sm font-semibold text-gray-700">
                            {label}
                        </label>
                        {showCount && maxLength && (
                            <span className={cn(
                                "text-xs",
                                currentLength > maxLength ? "text-red-600" : "text-gray-500"
                            )}>
                                {currentLength}/{maxLength}
                            </span>
                        )}
                    </div>
                )}
                <textarea
                    className={cn(
                        textareaVariants({ variant: error ? "error" : variant }),
                        className
                    )}
                    ref={ref}
                    maxLength={maxLength}
                    value={value}
                    {...props}
                />
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

Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
