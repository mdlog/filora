import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: "sm" | "md" | "lg" | "xl" | "full";
    closeOnOverlayClick?: boolean;
    showCloseButton?: boolean;
}

const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
};

export function Modal({
    isOpen,
    onClose,
    children,
    size = "md",
    closeOnOverlayClick = true,
    showCloseButton = true,
}: ModalProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeOnOverlayClick ? onClose : undefined}
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className={cn(
                                "relative w-full bg-white rounded-2xl shadow-2xl",
                                sizeClasses[size]
                            )}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            )}
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

export function ModalHeader({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("px-6 py-4 border-b border-gray-100", className)}>
            {children}
        </div>
    );
}

export function ModalTitle({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <h2 className={cn("text-2xl font-bold text-gray-800", className)}>
            {children}
        </h2>
    );
}

export function ModalBody({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={cn("px-6 py-4", className)}>{children}</div>;
}

export function ModalFooter({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div
            className={cn(
                "px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3",
                className
            )}
        >
            {children}
        </div>
    );
}
