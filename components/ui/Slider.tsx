import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    showValue?: boolean;
    formatValue?: (value: number) => string;
    marks?: number[];
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
    ({ className, label, showValue = true, formatValue, marks, value, min = 0, max = 100, ...props }, ref) => {
        const currentValue = Number(value) || 0;
        const percentage = ((currentValue - Number(min)) / (Number(max) - Number(min))) * 100;

        return (
            <div className="w-full space-y-2">
                {(label || showValue) && (
                    <div className="flex items-center justify-between">
                        {label && (
                            <label className="block text-sm font-semibold text-gray-700">
                                {label}
                            </label>
                        )}
                        {showValue && (
                            <span className="text-sm font-bold text-indigo-600">
                                {formatValue ? formatValue(currentValue) : currentValue}
                            </span>
                        )}
                    </div>
                )}
                <div className="relative pt-2 pb-6">
                    <input
                        type="range"
                        className={cn(
                            "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer",
                            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110",
                            "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-indigo-600 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-lg [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110",
                            className
                        )}
                        ref={ref}
                        value={value}
                        min={min}
                        max={max}
                        {...props}
                    />
                    {/* Progress bar */}
                    <div
                        className="absolute top-2 left-0 h-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg pointer-events-none"
                        style={{ width: `${percentage}%` }}
                    />
                    {/* Marks */}
                    {marks && marks.length > 0 && (
                        <div className="absolute top-6 left-0 right-0 flex justify-between px-0.5">
                            {marks.map((mark) => {
                                const markPercentage = ((mark - Number(min)) / (Number(max) - Number(min))) * 100;
                                return (
                                    <div
                                        key={mark}
                                        className="flex flex-col items-center"
                                        style={{ position: 'absolute', left: `${markPercentage}%`, transform: 'translateX(-50%)' }}
                                    >
                                        <div className="w-0.5 h-2 bg-gray-300" />
                                        <span className="text-xs text-gray-500 mt-1">{mark}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }
);

Slider.displayName = "Slider";

export { Slider };
