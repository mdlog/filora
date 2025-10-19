import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    description?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, label, description, ...props }, ref) => {
        return (
            <div className="flex items-center justify-between gap-4">
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
                <div className="relative inline-flex items-center">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        ref={ref}
                        {...props}
                    />
                    <div className="h-6 w-11 cursor-pointer rounded-full bg-gray-200 transition-colors peer-checked:bg-indigo-600 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-focus:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
                    <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-transform peer-checked:translate-x-5" />
                </div>
            </div>
        );
    }
);

Switch.displayName = "Switch";

export { Switch };
