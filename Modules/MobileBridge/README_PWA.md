# Progressive Web App (PWA) Implementation

This document provides a comprehensive overview of the PWA implementation in the MobileBridge module.

## Overview

The PWA implementation transforms the Laravel application into a Progressive Web App with the following key features:

- **App Installation**: Users can install the app on their devices
- **Offline Support**: Full offline functionality with automatic data synchronization
- **Push Notifications**: Real-time notifications with customizable categories
- **Service Worker**: Background sync, caching, and update management
- **Responsive Design**: Optimized for mobile and desktop devices

## Architecture

### Backend Components

#### Controllers
- `PWAController.php` - Main PWA functionality and management page
- `PushNotificationController.php` - Push notification API endpoints

#### Models
- `PushSubscription.php` - Manages push notification subscriptions
- `NotificationLog.php` - Tracks notification delivery and interactions

#### Services
- `NotificationService.php` - Business logic for push notifications
- `SendPushNotificationJob.php` - Asynchronous notification delivery

#### Commands
- `NotificationMaintenanceCommand.php` - Cleanup and maintenance tasks

### Frontend Components

#### React Components
- `PWAWrapper.tsx` - Main PWA integration wrapper
- `PWADashboard.tsx` - Central PWA management dashboard
- `PWAInstallPrompt.tsx` - App installation prompts
- `NotificationSettings.tsx` - Notification preferences management
- `OfflineSync.tsx` - Offline data synchronization status

#### Hooks
- `usePWA.ts` - PWA state management and functionality

#### Services
- `pushNotificationService.ts` - Client-side push notification handling
- `offlineStorage.ts` - IndexedDB data persistence and sync

#### Static Files
- `sw.js` - Service worker for caching and background sync
- `manifest.json` - PWA manifest configuration
- `offline.blade.php` - Offline fallback page

## Features

### 1. App Installation

**Automatic Detection**: The app automatically detects when it can be installed and shows prompts to users.

**Manual Installation**: Users can manually trigger installation from the PWA Dashboard.

**Installation Tracking**: Tracks installation rates and user engagement.

### 2. Offline Support

**Data Persistence**: Uses IndexedDB to store data locally when offline.

**Action Queuing**: Queues user actions when offline and syncs when connection is restored.

**Cache Management**: Intelligent caching of assets and API responses.

**Sync Status**: Real-time sync status indicators and manual sync triggers.

### 3. Push Notifications

**Categories**: Configurable notification categories with priority levels:
- System Notifications (High priority)
- Transaction Alerts (High priority)
- Reminders (Normal priority)
- Promotional Offers (Low priority)
- Emergency Alerts (Urgent priority)

**Customization**: Users can enable/disable categories and configure sound/vibration.

**Quiet Hours**: Schedule quiet periods for non-urgent notifications.

**Statistics**: Track delivery rates, click rates, and engagement metrics.

### 4. Service Worker

**Caching Strategies**: 
- Cache First: For static assets
- Network First: For API calls
- Stale While Revalidate: For dynamic content

**Background Sync**: Automatic data synchronization when connection is restored.

**Update Management**: Automatic detection and installation of app updates.

## Installation & Setup

### 1. Database Migration

```bash
php artisan migrate
```

This will create the necessary tables:
- `push_subscriptions` - Store push notification subscriptions
- `notification_logs` - Track notification delivery and interactions

### 2. Configuration

Update your `.env` file with VAPID keys for push notifications:

```env
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
VAPID_SUBJECT=mailto:your-email@example.com
```

Generate VAPID keys using:
```bash
npx web-push generate-vapid-keys
```

### 3. Service Worker Registration

The service worker is automatically registered when users visit the application. It's served from `/sw.js`.

### 4. PWA Manifest

The PWA manifest is automatically generated and served from `/manifest.json`. It includes:
- App name and description
- Icons for different sizes
- Theme colors
- Display mode and orientation
- Start URL and scope

## Usage

### Accessing PWA Management

Visit `/pwa` to access the PWA management dashboard where you can:
- View installation and usage statistics
- Configure notification settings
- Manage offline sync
- Monitor PWA features

### Installing the App

1. **Automatic Prompt**: The app will show an install prompt after 3 seconds if installation is available
2. **Manual Installation**: Use the "Install App" button in the PWA Dashboard
3. **Browser Menu**: Use the browser's "Install App" or "Add to Home Screen" option

### Managing Notifications

1. **Enable Notifications**: Grant permission when prompted or from the Notification Settings
2. **Configure Categories**: Enable/disable specific notification types
3. **Set Preferences**: Configure sound, vibration, and quiet hours
4. **Test Notifications**: Send test notifications to verify setup

### Offline Usage

1. **Automatic Detection**: The app automatically detects when you go offline
2. **Offline Indicator**: A banner shows when you're offline
3. **Data Sync**: Actions are queued and synced when connection is restored
4. **Manual Sync**: Force sync from the Offline Sync panel

## API Endpoints

### PWA Management
- `GET /pwa` - PWA management dashboard
- `GET /manifest.json` - PWA manifest
- `GET /sw.js` - Service worker
- `GET /offline` - Offline fallback page

### Push Notifications
- `GET /api/push-notifications/vapid-key` - Get VAPID public key
- `POST /api/push-notifications/subscribe` - Subscribe to notifications
- `DELETE /api/push-notifications/unsubscribe` - Unsubscribe from notifications
- `POST /api/push-notifications/sync` - Sync subscription with server
- `GET /api/push-notifications/stats` - Get notification statistics
- `POST /api/push-notifications/track` - Track notification interactions
- `POST /api/push-notifications/test` - Send test notification

### PWA Features
- `POST /api/pwa/install` - Track app installation
- `GET /api/pwa/stats` - Get PWA statistics
- `POST /api/pwa/update-check` - Check for app updates
- `POST /api/pwa/clear-cache` - Clear app cache

## Maintenance

### Notification Cleanup

Run the maintenance command to clean up old notifications and inactive subscriptions:

```bash
php artisan mobile-bridge:notification-maintenance --cleanup
```

### Retry Failed Notifications

```bash
php artisan mobile-bridge:notification-maintenance --retry
```

### View Statistics

```bash
php artisan mobile-bridge:notification-maintenance --stats
```

### Send Test Notifications

```bash
php artisan mobile-bridge:notification-maintenance --test-user=1
```

## Security Considerations

1. **VAPID Keys**: Keep VAPID private keys secure and never expose them in client-side code
2. **Authentication**: All notification endpoints require authentication
3. **Rate Limiting**: Implement rate limiting for notification endpoints
4. **Data Validation**: All user inputs are validated and sanitized
5. **HTTPS Required**: PWA features require HTTPS in production

## Browser Support

- **Chrome/Edge**: Full support for all PWA features
- **Firefox**: Full support for all PWA features
- **Safari**: Limited support (no push notifications on iOS < 16.4)
- **Mobile Browsers**: Full support on Android, limited on iOS

## Troubleshooting

### Service Worker Issues

1. **Clear Cache**: Use browser dev tools to clear service worker cache
2. **Force Update**: Use "Update on reload" in dev tools
3. **Check Console**: Look for service worker errors in browser console

### Push Notification Issues

1. **Check Permissions**: Ensure notification permissions are granted
2. **Verify VAPID Keys**: Ensure VAPID keys are correctly configured
3. **Check Subscription**: Verify push subscription is active
4. **Test Endpoint**: Use the test notification endpoint to debug

### Offline Sync Issues

1. **Check IndexedDB**: Verify data is being stored in IndexedDB
2. **Network Status**: Check if online/offline detection is working
3. **Sync Queue**: Verify actions are being queued when offline
4. **Manual Sync**: Try manual sync to test connectivity

## Performance Optimization

1. **Cache Strategy**: Optimize caching strategies based on content type
2. **Background Sync**: Use background sync for non-critical operations
3. **Lazy Loading**: Implement lazy loading for PWA components
4. **Bundle Splitting**: Split PWA code into separate bundles
5. **Service Worker Updates**: Implement efficient service worker update strategies

## Future Enhancements

1. **Web Share API**: Add native sharing capabilities
2. **Background Fetch**: Implement background downloads
3. **Periodic Background Sync**: Add periodic data sync
4. **App Shortcuts**: Add app shortcut menu items
5. **File System Access**: Implement file system integration
6. **Advanced Caching**: Implement more sophisticated caching strategies
7. **Analytics Integration**: Add PWA-specific analytics tracking

## Contributing

When contributing to the PWA implementation:

1. **Test Offline**: Always test functionality in offline mode
2. **Browser Testing**: Test across different browsers and devices
3. **Performance**: Monitor performance impact of changes
4. **Documentation**: Update this README for any new features
5. **Security**: Follow security best practices for PWA features

## Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
