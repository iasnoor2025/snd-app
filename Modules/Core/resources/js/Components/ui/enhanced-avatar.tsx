import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { useInitials } from "../../hooks/use-initials";

const avatarVariants = cva(
  "relative flex shrink-0 overflow-hidden rounded-full",
  {
    variants: {
      size: {
        xs: "size-6",
        sm: "size-8",
        md: "size-10",
        lg: "size-12",
        xl: "size-16",
        "2xl": "size-20", 
        "3xl": "size-24",
      },
    },
    defaultVariants: {
      size: "md",
    },
  }
);

const statusVariants = cva(
  "absolute rounded-full border-2 border-background",
  {
    variants: {
      size: {
        xs: "size-2 -bottom-0 -right-0",
        sm: "size-2.5 -bottom-0 -right-0",
        md: "size-3 -bottom-0.5 -right-0.5",
        lg: "size-3.5 -bottom-0.5 -right-0.5",
        xl: "size-4 -bottom-1 -right-1",
        "2xl": "size-5 -bottom-1 -right-1",
        "3xl": "size-6 -bottom-1.5 -right-1.5",
      },
      status: {
        online: "bg-green-500",
        offline: "bg-gray-400",
        away: "bg-yellow-500",
        busy: "bg-red-500",
      },
    },
    defaultVariants: {
      size: "md",
      status: "online",
    },
  }
);

interface EnhancedAvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  src?: string;
  alt?: string;
  fallback?: string;
  name?: string;
  showStatus?: boolean;
  status?: "online" | "offline" | "away" | "busy";
  badge?: React.ReactNode;
  onClick?: () => void;
}

function EnhancedAvatar({
  className,
  size,
  src,
  alt,
  fallback,
  name,
  showStatus = false,
  status = "online",
  badge,
  onClick,
  ...props
}: EnhancedAvatarProps) {
  const getInitials = useInitials();

  const displayFallback = fallback || (name ? getInitials(name) : "?");
  const displayAlt = alt || name || "Avatar";

  return (
    <div className="relative inline-block">
      <AvatarPrimitive.Root
        className={cn(avatarVariants({ size }), onClick && "cursor-pointer", className)}
        onClick={onClick}
        {...props}
      >
        <AvatarPrimitive.Image
          src={src}
          alt={displayAlt}
          className="aspect-square size-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn(
            "flex size-full items-center justify-center rounded-full bg-muted font-medium text-muted-foreground",
            size === "xs" && "text-xs",
            size === "sm" && "text-xs",
            size === "md" && "text-sm",
            size === "lg" && "text-base",
            size === "xl" && "text-lg",
            size === "2xl" && "text-xl",
            size === "3xl" && "text-2xl"
          )}
        >
          {displayFallback}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>

      {showStatus && (
        <div className={cn(statusVariants({ size, status }))} />
      )}

      {badge && (
        <div className="absolute -top-1 -right-1 flex items-center justify-center">
          {badge}
        </div>
      )}
    </div>
  );
}

// Avatar Group Component for displaying multiple avatars
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: VariantProps<typeof avatarVariants>["size"];
  className?: string;
  onMoreClick?: () => void;
}

function AvatarGroup({ avatars, max = 3, size = "md", className, onMoreClick }: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayAvatars.map((avatar, index) => (
        <EnhancedAvatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
          className="border-2 border-background"
        />
      ))}
      {remainingCount > 0 && (
        <EnhancedAvatar
          size={size}
          fallback={`+${remainingCount}`}
          className="border-2 border-background bg-muted cursor-pointer"
          onClick={onMoreClick}
        />
      )}
    </div>
  );
}

export { EnhancedAvatar, AvatarGroup, avatarVariants, statusVariants };
export type { EnhancedAvatarProps, AvatarGroupProps };






















