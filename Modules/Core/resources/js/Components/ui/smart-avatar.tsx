import * as React from "react";
import { cn } from "../../lib/utils";
import { EnhancedAvatar, type EnhancedAvatarProps } from "./enhanced-avatar";
import { useAvatar } from "../../hooks/use-avatar";
import { type UserAvatarData, type AvatarOptions } from "@/services/avatar-service";
import { Skeleton } from "./skeleton";
import { Badge } from "./badge";

interface SmartAvatarProps extends Omit<EnhancedAvatarProps, 'src' | 'fallback'> {
  user: UserAvatarData;
  avatarOptions?: AvatarOptions;
  showTooltip?: boolean;
  tooltipContent?: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  showBadge?: boolean;
  badgeContent?: React.ReactNode;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

/**
 * Smart Avatar component that automatically handles avatar loading,
 * fallbacks, and integrates with the avatar service
 */
export function SmartAvatar({
  user,
  avatarOptions = {},
  showTooltip = false,
  tooltipContent,
  loadingComponent,
  errorComponent,
  showBadge = false,
  badgeContent,
  badgeVariant = 'default',
  size = 'md',
  className,
  ...props
}: SmartAvatarProps) {
  const { avatarUrl, fallback, color, isLoading, error } = useAvatar(user, avatarOptions);

  // Loading state
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <Skeleton
        className={cn(
          "rounded-full",
          size === 'xs' && "size-6",
          size === 'sm' && "size-8",
          size === 'md' && "size-10",
          size === 'lg' && "size-12",
          size === 'xl' && "size-16",
          size === '2xl' && "size-20",
          size === '3xl' && "size-24",
          className
        )}
      />
    );
  }

  // Error state
  if (error && errorComponent) {
    return <>{errorComponent}</>;
  }

  const avatarElement = (
    <div className="relative inline-block">
      <EnhancedAvatar
        src={avatarUrl}
        fallback={fallback}
        size={size}
        className={className}
        style={{
          backgroundColor: !avatarUrl ? color : undefined,
        }}
        {...props}
      />
      {showBadge && badgeContent && (
        <Badge
          variant={badgeVariant}
          className="absolute -top-1 -right-1 h-5 min-w-5 px-1 text-xs"
        >
          {badgeContent}
        </Badge>
      )}
    </div>
  );

  // Wrap with tooltip if needed
  if (showTooltip && tooltipContent) {
    return (
      <div title={typeof tooltipContent === 'string' ? tooltipContent : undefined}>
        {avatarElement}
      </div>
    );
  }

  return avatarElement;
}

// User Avatar - Specialized component for user avatars
interface UserAvatarProps extends Omit<SmartAvatarProps, 'user'> {
  user: {
    id: string | number;
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
    status?: 'online' | 'offline' | 'away' | 'busy';
  };
  showName?: boolean;
  showEmail?: boolean;
  showRole?: boolean;
  layout?: 'horizontal' | 'vertical';
}

export function UserAvatar({
  user,
  showName = false,
  showEmail = false,
  showRole = false,
  showStatus = false,
  layout = 'horizontal',
  size = 'md',
  className,
  ...props
}: UserAvatarProps) {
  const avatarElement = (
    <SmartAvatar
      user={user}
      size={size}
      showStatus={showStatus}
      status={user.status}
      showTooltip={!showName && !showEmail}
      tooltipContent={user.name}
      {...props}
    />
  );

  if (!showName && !showEmail && !showRole) {
    return avatarElement;
  }

  return (
    <div className={cn(
      "flex items-center gap-3",
      layout === 'vertical' && "flex-col gap-2",
      className
    )}>
      {avatarElement}
      <div className={cn(
        "flex flex-col",
        layout === 'vertical' && "items-center text-center"
      )}>
        {showName && (
          <span className="font-medium text-sm leading-tight">
            {user.name}
          </span>
        )}
        {showEmail && user.email && (
          <span className="text-muted-foreground text-xs leading-tight">
            {user.email}
          </span>
        )}
        {showRole && user.role && (
          <Badge variant="secondary" className="text-xs mt-1">
            {user.role}
          </Badge>
        )}
      </div>
    </div>
  );
}

// Team Avatar - For displaying team members
interface TeamAvatarProps {
  members: Array<{
    id: string | number;
    name: string;
    email?: string;
    avatar?: string;
    role?: string;
  }>;
  max?: number;
  size?: EnhancedAvatarProps['size'];
  className?: string;
  onMemberClick?: (member: any) => void;
  onMoreClick?: () => void;
  showTooltips?: boolean;
}

export function TeamAvatar({
  members,
  max = 3,
  size = 'md',
  className,
  onMemberClick,
  onMoreClick,
  showTooltips = true
}: TeamAvatarProps) {
  const displayMembers = members.slice(0, max);
  const remainingCount = members.length - max;

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayMembers.map((member) => (
        <SmartAvatar
          key={member.id}
          user={member}
          size={size}
          className="border-2 border-background cursor-pointer hover:z-10 transition-transform hover:scale-110"
          onClick={() => onMemberClick?.(member)}
          showTooltip={showTooltips}
          tooltipContent={`${member.name}${member.role ? ` (${member.role})` : ''}`}
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            "flex items-center justify-center rounded-full border-2 border-background bg-muted cursor-pointer hover:z-10 transition-transform hover:scale-110",
            size === 'xs' && "size-6 text-xs",
            size === 'sm' && "size-8 text-xs",
            size === 'md' && "size-10 text-sm",
            size === 'lg' && "size-12 text-base",
            size === 'xl' && "size-16 text-lg",
            size === '2xl' && "size-20 text-xl",
            size === '3xl' && "size-24 text-2xl"
          )}
          onClick={onMoreClick}
          title={`${remainingCount} more members`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export type { SmartAvatarProps, UserAvatarProps, TeamAvatarProps };






















