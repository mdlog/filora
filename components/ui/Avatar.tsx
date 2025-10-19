import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { User } from "lucide-react";

const avatarVariants = cva(
    "relative inline-flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white font-semibold",
    {
        variants: {
            size: {
                sm: "h-8 w-8 text-xs",
                md: "h-10 w-10 text-sm",
                lg: "h-12 w-12 text-base",
                xl: "h-16 w-16 text-lg",
                "2xl": "h-24 w-24 text-2xl",
            },
        },
        defaultVariants: {
            size: "md",
        },
    }
);

export interface AvatarProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
    src?: string;
    alt?: string;
    fallback?: string;
}

function Avatar({ className, size, src, alt, fallback, ...props }: AvatarProps) {
    const [imageError, setImageError] = React.useState(false);

    return (
        <div className={cn(avatarVariants({ size }), className)} {...props}>
            {src && !imageError ? (
                <img
                    src={src}
                    alt={alt || "Avatar"}
                    className="h-full w-full object-cover"
                    onError={() => setImageError(true)}
                />
            ) : fallback ? (
                <span>{fallback}</span>
            ) : (
                <User className="h-1/2 w-1/2" />
            )}
        </div>
    );
}

export { Avatar, avatarVariants };
