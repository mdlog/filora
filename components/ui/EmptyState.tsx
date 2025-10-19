import { motion } from "framer-motion";
import { Button } from "./Button";

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 px-4"
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mb-6 text-gray-400"
            >
                {icon}
            </motion.div>

            <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600 text-center max-w-md mb-8">{description}</p>

            {action && (
                <Button onClick={action.onClick} size="lg">
                    {action.label}
                </Button>
            )}
        </motion.div>
    );
}
