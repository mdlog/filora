import * as React from "react";
import { cn } from "@/lib/utils";

export interface RadioProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    description?: string;
}

const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
    ({ className, label, description, ...props }, ref) => {
        return (
            <div className="flex items-start gap-3">
                <div className="relative flex items-center">
                    <input
                        type="radio"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border-2 border-gray-300 bg-white transition-all checked:border-indigo-600 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        ref={ref}
                        {...props}
                    />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600 opacity-0 transition-opacity peer-checked:opacity-100" />
                </div>
                {(label || description) && (
                    <div className="flex-1">
                        {label && (
                            <label
                                htmlFor={props.id}
                                className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                                {label}
                            </label>
                        )}
                        {description && (
                            <p className="text-sm text-gray-500 mt-0.5">{description}</p>
                        )}
                    </div>
                )}
            </div>
        );
    }
);

Radio.displayName = "Radio";

export { Radio };

// RadioGroup component for managing multiple radios
export interface RadioGroupProps {
    children: React.ReactNode;
    className?: string;
    label?: string;
}

export function RadioGroup({ children, className, label }: RadioGroupProps) {
    return (
        <div className={cn("space-y-3", className)}>
            {label && (
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                    {label}
                </label>
            )}
            {children}
        </div>
    );
}
