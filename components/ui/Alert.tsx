import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react";

const alertVariants = cva(
    "relative w-full rounded-xl border p-4 transition-all",
    {
        variants: {
            variant: {
                default: "bg-gray-50 border-gray-200 text-gray-900",
                info: "bg-blue-50 border-blue-200 text-blue-900",
                success: "bg-green-50 border-green-200 text-green-900",
                warning: "bg-yellow-50 border-yellow-200 text-yellow-900",
                danger: "bg-red-50 border-red-200 text-red-900",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

const iconVariants = {
    default: { icon: Info, className: "text-gray-600" },
    info: { icon: Info, className: "text-blue-600" },
    success: { icon: CheckCircle, className: "text-green-600" },
    warning: { icon: AlertTriangle, className: "text-yellow-600" },
    danger: { icon: AlertCircle, className: "text-red-600" },
};

export interface AlertProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    closable?: boolean;
    onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
    ({ className, variant = "default", title, description, icon, closable, onClose, children, ...props }, ref) => {
        const [isVisible, setIsVisible] = React.useState(true);

        const handleClose = () => {
            setIsVisible(false);
            onClose?.();
        };

        if (!isVisible) return null;

        const IconComponent = iconVariants[variant || "default"].icon;

        return (
            <div
                ref={ref}
                role="alert"
                className={cn(alertVariants({ variant }), className)}
                {...props}
            >
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0">
                        {icon || <IconComponent className={cn("h-5 w-5", iconVariants[variant || "default"].className)} />}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-1">
                        {title && (
                            <h5 className="font-semibold leading-none tracking-tight">
                                {title}
                            </h5>
                        )}
                        {description && (
                            <p className="text-sm opacity-90">
                                {description}
                            </p>
                        )}
                        {children && (
                            <div className="text-sm opacity-90">
                                {children}
                            </div>
                        )}
                    </div>

                    {/* Close Button */}
                    {closable && (
                        <button
                            onClick={handleClose}
                            className="flex-shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>
        );
    }
);

Alert.displayName = "Alert";

export { Alert, alertVariants };
