# Avatar Components Documentation

This document provides comprehensive documentation for the avatar component system implemented in the SND Rental React App.

## Overview

The avatar system consists of several components and services that work together to provide a flexible and feature-rich avatar experience:

- **Basic Avatar Components**: Simple avatar components from ShadCN UI
- **Enhanced Avatar Components**: Extended avatars with sizes, status indicators, and groups
- **Smart Avatar Components**: Intelligent avatars that integrate with the avatar service
- **Avatar Upload Component**: Component for uploading and managing avatars
- **Avatar Service**: Service for generating and managing avatar URLs
- **Avatar Hooks**: React hooks for avatar management

## Components

### 1. Basic Avatar (`@/components/ui/avatar`)

The foundation avatar components from ShadCN UI using Radix UI primitives.

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

<Avatar>
    <AvatarImage src="/avatar.jpg" alt="User" />
    <AvatarFallback>JD</AvatarFallback>
</Avatar>;
```

**Props:**

- `className`: Additional CSS classes
- Standard Radix UI Avatar props

### 2. Enhanced Avatar (`@/components/ui/enhanced-avatar`)

Extended avatar component with additional features.

```tsx
import { EnhancedAvatar } from '@/components/ui/enhanced-avatar';

<EnhancedAvatar size="lg" src="/avatar.jpg" fallback="JD" showStatus status="online" onClick={() => console.log('Avatar clicked')} />;
```

**Props:**

- `size`: `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'`
- `src`: Image source URL
- `alt`: Alt text for the image
- `fallback`: Fallback text when image fails to load
- `name`: User name (used to generate initials if no fallback)
- `showStatus`: Whether to show status indicator
- `status`: `'online' | 'offline' | 'away' | 'busy'`
- `badge`: React node to display as badge
- `onClick`: Click handler

### 3. Avatar Group (`@/components/ui/enhanced-avatar`)

Component for displaying multiple avatars in a group.

```tsx
import { AvatarGroup } from '@/components/ui/enhanced-avatar';

<AvatarGroup
    avatars={[
        { src: '/avatar1.jpg', name: 'John Doe' },
        { src: '/avatar2.jpg', name: 'Jane Smith' },
        { src: '/avatar3.jpg', name: 'Bob Johnson' },
    ]}
    max={3}
    size="md"
    onMoreClick={() => console.log('Show more')}
/>;
```

**Props:**

- `avatars`: Array of avatar data objects
- `max`: Maximum number of avatars to display
- `size`: Avatar size
- `onMoreClick`: Handler for "more" button click

### 4. Smart Avatar (`@/components/ui/smart-avatar`)

Intelligent avatar component that integrates with the avatar service.

```tsx
import { SmartAvatar } from '@/components/ui/smart-avatar';

<SmartAvatar
    user={{
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatar.jpg',
    }}
    size="lg"
    showTooltip
    showBadge
    badgeContent="5"
/>;
```

**Props:**

- `user`: User data object
- `avatarOptions`: Options for avatar service
- `showTooltip`: Whether to show tooltip
- `tooltipContent`: Custom tooltip content
- `loadingComponent`: Custom loading component
- `errorComponent`: Custom error component
- `showBadge`: Whether to show badge
- `badgeContent`: Badge content
- `badgeVariant`: Badge variant

### 5. User Avatar (`@/components/ui/smart-avatar`)

Specialized component for user avatars with additional user information.

```tsx
import { UserAvatar } from '@/components/ui/smart-avatar';

<UserAvatar
    user={{
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatar.jpg',
        role: 'Admin',
        status: 'online',
    }}
    showName
    showEmail
    showRole
    showStatus
    layout="horizontal"
/>;
```

**Props:**

- `user`: Extended user data object
- `showName`: Whether to show user name
- `showEmail`: Whether to show user email
- `showRole`: Whether to show user role
- `showStatus`: Whether to show status indicator
- `layout`: `'horizontal' | 'vertical'`

### 6. Team Avatar (`@/components/ui/smart-avatar`)

Component for displaying team members.

```tsx
import { TeamAvatar } from '@/components/ui/smart-avatar';

<TeamAvatar
    members={teamMembers}
    max={4}
    size="lg"
    onMemberClick={(member) => console.log('Member clicked:', member)}
    onMoreClick={() => console.log('Show all members')}
    showTooltips
/>;
```

**Props:**

- `members`: Array of team member objects
- `max`: Maximum number of members to display
- `size`: Avatar size
- `onMemberClick`: Handler for member click
- `onMoreClick`: Handler for "more" button click
- `showTooltips`: Whether to show tooltips

### 7. Avatar Upload (`@/components/ui/avatar-upload`)

Component for uploading and managing user avatars.

```tsx
import { AvatarUpload } from '@/components/ui/avatar-upload';

<AvatarUpload
    user={currentUser}
    onUpload={async (file) => {
        // Upload file to server
        const formData = new FormData();
        formData.append('avatar', file);
        const response = await fetch('/api/upload-avatar', {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();
        return data.avatarUrl;
    }}
    onRemove={async () => {
        // Remove avatar from server
        await fetch('/api/remove-avatar', { method: 'DELETE' });
    }}
    onUpdate={(avatarUrl) => {
        // Update local state
        setUser((prev) => ({ ...prev, avatar: avatarUrl }));
    }}
    maxSize={5}
    allowedTypes={['image/jpeg', 'image/png', 'image/gif']}
/>;
```

**Props:**

- `user`: User data object
- `onUpload`: Upload handler function
- `onRemove`: Remove handler function
- `onUpdate`: Update handler function
- `maxSize`: Maximum file size in MB
- `allowedTypes`: Array of allowed MIME types
- `showRemoveButton`: Whether to show remove button
- `showUrlInput`: Whether to show URL input
- `disabled`: Whether the component is disabled

## Services

### Avatar Service (`@/services/avatar-service`)

Service for generating and managing avatar URLs.

```tsx
import { avatarService } from '@/services/avatar-service';

// Get Gravatar URL
const gravatarUrl = avatarService.getGravatarUrl('user@example.com', {
    size: 80,
    defaultType: 'identicon',
});

// Get DiceBear avatar URL
const diceBearUrl = avatarService.getDiceBearUrl('John Doe', 'avataaars', {
    size: 80,
    backgroundColor: '#FF6B6B',
});

// Get best avatar URL for user
const avatarUrl = avatarService.getUserAvatarUrl({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/custom-avatar.jpg',
});

// Generate initials
const initials = avatarService.getInitials('John Doe'); // 'JD'

// Generate color
const color = avatarService.generateAvatarColor('John Doe');
```

**Methods:**

- `getGravatarUrl(email, options)`: Get Gravatar URL
- `getDiceBearUrl(seed, style, options)`: Get DiceBear avatar URL
- `getUserAvatarUrl(user, options)`: Get best avatar URL for user
- `getInitials(name)`: Generate initials from name
- `generateAvatarColor(seed)`: Generate color based on seed
- `preloadAvatar(url)`: Preload avatar image
- `clearCache()`: Clear avatar cache
- `getAvatarWithFallback(user, options)`: Get avatar with fallback handling

## Hooks

### useAvatar (`@/hooks/use-avatar`)

Hook for managing individual avatars.

```tsx
import { useAvatar } from '@/hooks/use-avatar';

function MyComponent() {
    const { avatarUrl, fallback, color, isLoading, error, refresh } = useAvatar({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return <div style={{ backgroundColor: color }}>{avatarUrl ? <img src={avatarUrl} alt="Avatar" /> : <span>{fallback}</span>}</div>;
}
```

### useAvatars (`@/hooks/use-avatar`)

Hook for managing multiple avatars.

```tsx
import { useAvatars } from '@/hooks/use-avatar';

function TeamComponent() {
    const { avatars, isLoading, error, refresh } = useAvatars(teamMembers);

    if (isLoading) return <div>Loading team...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div>
            {avatars.map(({ user, avatarUrl, fallback, color }) => (
                <div key={user.id}>
                    {avatarUrl ? <img src={avatarUrl} alt={user.name} /> : <div style={{ backgroundColor: color }}>{fallback}</div>}
                </div>
            ))}
        </div>
    );
}
```

### useInitials (`@/hooks/use-avatar`)

Hook for generating initials.

```tsx
import { useInitials } from '@/hooks/use-avatar';

function MyComponent() {
    const getInitials = useInitials();

    return <span>{getInitials('John Doe')}</span>; // 'JD'
}
```

### useAvatarColor (`@/hooks/use-avatar`)

Hook for generating avatar colors.

```tsx
import { useAvatarColor } from '@/hooks/use-avatar';

function MyComponent() {
    const getAvatarColor = useAvatarColor();

    return <div style={{ backgroundColor: getAvatarColor('John Doe') }}>Avatar background</div>;
}
```

## Integration Examples

### Basic Usage

```tsx
// Simple avatar with fallback
<EnhancedAvatar
  src="/avatar.jpg"
  name="John Doe"
  size="md"
/>

// Avatar with status
<EnhancedAvatar
  src="/avatar.jpg"
  name="John Doe"
  size="lg"
  showStatus
  status="online"
/>
```

### Smart Avatar with Service Integration

```tsx
// Automatically handles Gravatar, DiceBear, and custom avatars
<SmartAvatar
    user={{
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
    }}
    size="lg"
/>
```

### User Profile with Avatar Upload

```tsx
function UserProfile({ user }) {
    const [currentUser, setCurrentUser] = useState(user);

    const handleAvatarUpload = async (file) => {
        const formData = new FormData();
        formData.append('avatar', file);

        const response = await fetch('/api/users/avatar', {
            method: 'POST',
            body: formData,
        });

        const data = await response.json();
        return data.avatarUrl;
    };

    const handleAvatarUpdate = (avatarUrl) => {
        setCurrentUser((prev) => ({ ...prev, avatar: avatarUrl }));
    };

    return (
        <div className="profile">
            <AvatarUpload user={currentUser} onUpload={handleAvatarUpload} onUpdate={handleAvatarUpdate} />
            <UserAvatar user={currentUser} showName showEmail size="xl" />
        </div>
    );
}
```

### Team Display

```tsx
function TeamSection({ team }) {
    return (
        <div>
            <h3>Team Members</h3>
            <TeamAvatar
                members={team.members}
                max={5}
                size="lg"
                onMemberClick={(member) => {
                    // Navigate to member profile
                    router.push(`/users/${member.id}`);
                }}
                onMoreClick={() => {
                    // Show all team members
                    setShowAllMembers(true);
                }}
            />
        </div>
    );
}
```

## Best Practices

1. **Use Smart Avatars for dynamic content**: When displaying user avatars that might change or need fallbacks, use `SmartAvatar` components.

2. **Implement proper error handling**: Always provide fallback content and error states for avatar components.

3. **Optimize image loading**: Use the avatar service's preloading capabilities for better performance.

4. **Consistent sizing**: Use the predefined size variants for consistent avatar sizing across your application.

5. **Accessibility**: Always provide meaningful alt text and ensure proper contrast for fallback text.

6. **Performance**: Use avatar groups for displaying multiple avatars efficiently.

7. **Caching**: The avatar service includes caching - clear it when needed but don't clear it unnecessarily.

## Styling

All avatar components use Tailwind CSS classes and can be customized using the `className` prop. The components follow the design system established by ShadCN UI.

```tsx
// Custom styling example
<SmartAvatar user={user} className="border-4 border-blue-500 shadow-lg" size="xl" />
```

## TypeScript Support

All components are fully typed with TypeScript. Import the types when needed:

```tsx
import type { EnhancedAvatarProps, SmartAvatarProps, UserAvatarProps, TeamAvatarProps, AvatarUploadProps } from '@/components/ui/avatar-components';

import type { UserAvatarData, AvatarOptions } from '@/services/avatar-service';
```
