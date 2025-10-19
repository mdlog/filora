import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsContextValue {
    activeTab: string;
    setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

function useTabs() {
    const context = React.useContext(TabsContext);
    if (!context) {
        throw new Error("Tabs components must be used within Tabs");
    }
    return context;
}

interface TabsProps {
    defaultValue: string;
    value?: string;
    onValueChange?: (value: string) => void;
    children: React.ReactNode;
    className?: string;
}

export function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
    const [activeTab, setActiveTab] = React.useState(value || defaultValue);

    React.useEffect(() => {
        if (value !== undefined) {
            setActiveTab(value);
        }
    }, [value]);

    const handleTabChange = (newValue: string) => {
        if (value === undefined) {
            setActiveTab(newValue);
        }
        onValueChange?.(newValue);
    };

    return (
        <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
            <div className={cn("w-full", className)}>{children}</div>
        </TabsContext.Provider>
    );
}

interface TabsListProps {
    children: React.ReactNode;
    className?: string;
}

export function TabsList({ children, className }: TabsListProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center gap-2 rounded-xl bg-gray-100 p-1",
                className
            )}
        >
            {children}
        </div>
    );
}

interface TabsTriggerProps {
    value: string;
    children: React.ReactNode;
    className?: string;
    icon?: React.ReactNode;
}

export function TabsTrigger({ value, children, className, icon }: TabsTriggerProps) {
    const { activeTab, setActiveTab } = useTabs();
    const isActive = activeTab === value;

    return (
        <button
            onClick={() => setActiveTab(value)}
            className={cn(
                "relative inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all",
                isActive
                    ? "text-white"
                    : "text-gray-700 hover:text-gray-900",
                className
            )}
        >
            {isActive && (
                <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg"
                    transition={{ type: "spring", duration: 0.5 }}
                />
            )}
            <span className="relative z-10 flex items-center gap-2">
                {icon && icon}
                {children}
            </span>
        </button>
    );
}

interface TabsContentProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export function TabsContent({ value, children, className }: TabsContentProps) {
    const { activeTab } = useTabs();

    if (activeTab !== value) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={cn("mt-4", className)}
        >
            {children}
        </motion.div>
    );
}
