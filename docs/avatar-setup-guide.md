# Avatar Management System - Setup Guide

This guide provides step-by-step instructions for setting up the complete avatar management system in your Laravel 12 + React + Inertia.js application.

## Overview

The avatar management system includes:
- **Backend**: Laravel controllers, models, and API endpoints
- **Frontend**: React components with ShadCN UI integration
- **File Management**: Spatie Media Library integration
- **Image Processing**: Intervention Image for optimization
- **Fallback Options**: Gravatar and initials generation

## Prerequisites

- Laravel 12 application
- React with Inertia.js setup
- ShadCN UI components installed
- PHP 8.2+
- Node.js 18+

## Installation Steps

### 1. Install PHP Dependencies

```bash
# Install Spatie Media Library
composer require spatie/laravel-medialibrary

# Install Intervention Image for image processing
composer require intervention/image

# Install Spatie Activity Log (optional, for logging)
composer require spatie/laravel-activitylog
```

### 2. Publish and Run Migrations

```bash
# Publish Spatie Media Library migrations
php artisan vendor:publish --provider="Spatie\MediaLibrary\MediaLibraryServiceProvider" --tag="migrations"

# Run the avatar migration we created
php artisan migrate
```

### 3. Configure Storage

Ensure your `config/filesystems.php` has the public disk configured:

```php
'public' => [
    'driver' => 'local',
    'root' => storage_path('app/public'),
    'url' => env('APP_URL').'/storage',
    'visibility' => 'public',
],
```

Create the storage link:

```bash
php artisan storage:link
```

### 4. Configure Image Processing

Add to your `config/app.php` providers array:

```php
'providers' => [
    // Other providers...
    Intervention\Image\ImageServiceProvider::class,
],

'aliases' => [
    // Other aliases...
    'Image' => Intervention\Image\Facades\Image::class,
],
```

### 5. Install Frontend Dependencies

```bash
# Install required UI components (if not already installed)
npm install @radix-ui/react-avatar
npm install @radix-ui/react-dialog
npm install @radix-ui/react-tabs
npm install @radix-ui/react-toast
npm install lucide-react
npm install class-variance-authority
npm install clsx
npm install tailwind-merge
```

### 6. Configure Environment Variables

Add to your `.env` file:

```env
# File upload settings
FILESYSTEM_DISK=public
MAX_UPLOAD_SIZE=5120

# Image processing settings
IMAGE_DRIVER=gd

# Avatar settings
AVATAR_DEFAULT_SIZE=200
AVATAR_MAX_SIZE=2000
AVATAR_QUALITY=85
```

## File Structure

The avatar system includes these key files:

```
app/
├── Http/
│   ├── Controllers/
│   │   └── AvatarController.php
│   └── Requests/
│       └── AvatarUploadRequest.php
├── Models/
│   └── User.php (updated)
└── Traits/
    └── HasAvatar.php

resources/js/
├── Components/
│   ├── Avatar/
│   │   └── AvatarUploader.jsx
│   └── ui/
│       ├── avatar.jsx
│       ├── enhanced-avatar.tsx
│       ├── smart-avatar.tsx
│       └── avatar-upload.tsx
├── hooks/
│   ├── use-avatar.ts
│   └── use-initials.js
├── services/
│   └── avatar-service.ts
└── Pages/
    └── Profile/
        └── Avatar.jsx

routes/
├── avatar.php
├── profile.php
└── web.php (updated)

database/migrations/
└── 2024_01_01_000001_add_avatar_to_users_table.php
```

## Configuration

### 1. Update User Model

The User model has been updated to include:
- `HasAvatar` trait
- `HasMedia` interface implementation
- Avatar field in fillable array

### 2. Routes Configuration

Avatar routes are automatically loaded via:
- `routes/avatar.php` - Avatar management endpoints
- `routes/profile.php` - Profile pages including avatar management

### 3. Middleware

All avatar routes are protected by:
- `auth` middleware - Requires authentication
- `verified` middleware - Requires email verification

## API Endpoints

### Avatar Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/avatar` | Get current user avatar info |
| POST | `/avatar/upload` | Upload avatar file |
| POST | `/avatar/upload-media` | Upload using Media Library |
| POST | `/avatar/set-url` | Set avatar from URL |
| DELETE | `/avatar/remove` | Remove current avatar |

### API Routes (for AJAX)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/avatar` | Get avatar info (API) |
| POST | `/api/avatar/upload` | Upload avatar (API) |
| POST | `/api/avatar/set-url` | Set from URL (API) |
| DELETE | `/api/avatar/remove` | Remove avatar (API) |

## Frontend Components

### Basic Usage

```jsx
import { SmartAvatar } from '@/Components/ui/smart-avatar';
import AvatarUploader from '@/Components/Avatar/AvatarUploader';

// Display user avatar
<SmartAvatar 
    user={user} 
    size="md" 
    status="online" 
/>

// Avatar upload component
<AvatarUploader 
    user={user}
    onAvatarUpdate={(newUrl) => {
        // Handle avatar update
    }}
/>
```

### Available Components

1. **SmartAvatar** - Intelligent avatar with service integration
2. **UserAvatar** - User-specific avatar with name/email display
3. **TeamAvatar** - Group avatar display
4. **AvatarUploader** - Complete upload interface
5. **EnhancedAvatar** - Avatar with status and badges

## Features

### Image Processing
- Automatic resizing to 300x300 pixels
- Quality optimization (85% JPEG)
- Multiple size conversions (thumb, small, large)
- Format standardization

### Fallback System
1. Custom uploaded avatar
2. Gravatar (based on email)
3. Generated initials
4. Default placeholder

### Security Features
- File type validation
- File size limits (5MB max)
- Image dimension validation
- Secure file storage
- CSRF protection

### Performance
- Image optimization
- Lazy loading support
- Caching mechanisms
- Efficient fallback handling

## Usage Examples

### 1. Profile Page Integration

Visit `/profile/avatar` to access the complete avatar management interface.

### 2. Header Avatar

```jsx
import { SmartAvatar } from '@/Components/ui/smart-avatar';

<SmartAvatar 
    user={auth.user}
    size="sm"
    className="cursor-pointer"
    onClick={() => router.visit('/profile/avatar')}
/>
```

### 3. Team Member List

```jsx
import { UserAvatar } from '@/Components/ui/smart-avatar';

{teamMembers.map(member => (
    <div key={member.id} className="flex items-center space-x-3">
        <UserAvatar 
            user={member}
            size="md"
            showName
            showEmail
        />
    </div>
))}
```

### 4. Avatar Group

```jsx
import { TeamAvatar } from '@/Components/ui/smart-avatar';

<TeamAvatar 
    members={teamMembers}
    maxVisible={4}
    size="sm"
    onMemberClick={(member) => console.log('Clicked:', member.name)}
/>
```

## Customization

### 1. Avatar Sizes

Available sizes: `xs`, `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`

### 2. Status Indicators

Available statuses: `online`, `offline`, `away`, `busy`

### 3. Custom Colors

The system automatically generates unique colors based on user names, but you can override:

```jsx
<SmartAvatar 
    user={user}
    style={{ '--avatar-color': '#custom-color' }}
/>
```

### 4. Custom Badges

```jsx
import { Star } from 'lucide-react';

<SmartAvatar 
    user={user}
    badge={<Star className="h-3 w-3 text-yellow-500" />}
/>
```

## Troubleshooting

### Common Issues

1. **Upload fails**: Check file permissions and storage configuration
2. **Images not displaying**: Verify storage link and public disk setup
3. **Large file uploads**: Adjust PHP upload limits and Laravel file size validation
4. **Memory issues**: Configure PHP memory limit for image processing

### Debug Mode

Enable debug logging in your `.env`:

```env
LOG_LEVEL=debug
```

### File Permissions

Ensure proper permissions:

```bash
chmod -R 755 storage/
chmod -R 755 public/storage/
```

## Security Considerations

1. **File Validation**: All uploads are validated for type and size
2. **Storage Security**: Files stored outside web root with controlled access
3. **CSRF Protection**: All forms include CSRF tokens
4. **Authentication**: All endpoints require authentication
5. **Input Sanitization**: All inputs are validated and sanitized

## Performance Optimization

1. **Image Optimization**: Automatic compression and resizing
2. **Caching**: Implement browser caching for avatar URLs
3. **CDN Integration**: Consider CDN for avatar delivery
4. **Lazy Loading**: Use lazy loading for avatar lists

## Testing

Test the avatar system:

1. **Upload Tests**: Test various file types and sizes
2. **URL Tests**: Test setting avatars from external URLs
3. **Fallback Tests**: Test fallback mechanisms
4. **Permission Tests**: Test access controls

## Next Steps

1. **Integration**: Integrate avatar components throughout your application
2. **Customization**: Customize styling to match your design system
3. **Extensions**: Add additional features like avatar cropping or filters
4. **Monitoring**: Set up monitoring for upload success rates

The avatar management system is now ready for use! Visit `/profile/avatar` to start managing user avatars.
