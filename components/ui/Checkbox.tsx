import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    description?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, description, ...props }, ref) => {
        return (
            <div className="flex items-start gap-3">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 bg-white transition-all checked:border-indigo-600 checked:bg-indigo-600 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        ref={ref}
                        {...props}
                    />
                    <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
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

Checkbox.displayName = "Checkbox";

export { Checkbox };
