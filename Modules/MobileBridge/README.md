# MobileBridge Module

The MobileBridge module provides comprehensive mobile API endpoints for Laravel applications, enabling seamless integration between web applications and mobile clients. This module includes features for push notifications, PWA support, offline synchronization, user management, feedback systems, and support ticketing.

## Features

### 🔔 Push Notifications

- VAPID key management for web push notifications
- Subscription management (subscribe/unsubscribe)
- Push notification analytics and tracking
- Device-specific notification preferences

### 📱 Progressive Web App (PWA) Support

- PWA manifest generation
- Service worker management
- Installation statistics tracking
- Offline capability detection

### 🔄 Mobile Synchronization

- Offline action queuing
- Pending action management
- Sync status tracking
- Completed action cleanup

### 📲 Device Management

- Device registration and tracking
- Version checking and updates
- Device statistics and analytics
- Multi-device user management

### ⚙️ Mobile Configuration

- Dynamic app configuration
- Feature flags management
- User-specific settings
- Version-based configuration

### 👤 Mobile Authentication & User Management

- Enhanced user profile management
- Mobile-specific settings
- Session management across devices
- Activity logging and statistics

### 💬 Feedback System

- User feedback collection
- Rating and review management
- Feedback analytics
- Admin notification system

### 🎫 Support System

- FAQ management with search
- Support ticket creation and tracking
- File attachment support
- Ticket messaging system

### 🔔 Notification Management

- Comprehensive notification system
- Read/unread status tracking
- Notification preferences
- Push notification settings

## API Endpoints

### Authentication

All endpoints require Laravel Sanctum authentication unless specified otherwise.

```
Authorization: Bearer {your-token}
```

### Push Notifications

#### Get VAPID Public Key (Public)

```http
GET /api/mobile-bridge/vapid-key
```

#### Subscribe to Push Notifications

```http
POST /api/mobile-bridge/push/subscribe
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/...",
  "keys": {
    "p256dh": "...",
    "auth": "..."
  }
}
```

#### Unsubscribe from Push Notifications

```http
DELETE /api/mobile-bridge/push/unsubscribe
Content-Type: application/json

{
  "endpoint": "https://fcm.googleapis.com/fcm/send/..."
}
```

#### Get Push Analytics

```http
GET /api/mobile-bridge/push/analytics
```

### PWA Management

#### Get PWA Manifest (Public)

```http
GET /api/mobile-bridge/pwa/manifest
```

#### Get Service Worker (Public)

```http
GET /api/mobile-bridge/pwa/sw.js
```

#### Get PWA Statistics

```http
GET /api/mobile-bridge/pwa/stats
```

### Mobile Synchronization

#### Queue Action for Offline Sync

```http
POST /api/v1/mobile/sync/queue-action
Content-Type: application/json

{
  "action_type": "create_record",
  "data": {...},
  "priority": "high"
}
```

#### Get Pending Actions

```http
GET /api/v1/mobile/sync/pending-actions?limit=50
```

#### Complete Action

```http
POST /api/v1/mobile/sync/complete-action
Content-Type: application/json

{
  "action_id": "action_123",
  "status": "completed",
  "result": {...}
}
```

#### Get Sync Statistics

```http
GET /api/v1/mobile/sync/stats
```

#### Clear Completed Actions

```http
DELETE /api/v1/mobile/sync/clear-completed
```

### Device Management

#### Register Device

```http
POST /api/v1/mobile/device/register
Content-Type: application/json

{
  "device_id": "unique-device-id",
  "device_type": "android",
  "device_name": "Samsung Galaxy S21",
  "app_version": "1.2.0",
  "os_version": "Android 12",
  "push_token": "fcm-token"
}
```

#### Check Version Updates

```http
GET /api/v1/mobile/device/check-version?current_version=1.2.0
```

#### Get User Devices

```http
GET /api/v1/mobile/device/user-devices
```

#### Get Device Statistics

```http
GET /api/v1/mobile/device/stats
```

### Mobile Configuration

#### Get App Configuration

```http
GET /api/v1/mobile/config
```

#### Update User Configuration

```http
POST /api/v1/mobile/config/update
Content-Type: application/json

{
  "theme": "dark",
  "language": "en",
  "notifications_enabled": true
}
```

#### Get Feature Flags

```http
GET /api/v1/mobile/config/feature-flags
```

### User Management

#### Get User Profile

```http
GET /api/v1/mobile/user
```

#### Update Profile

```http
POST /api/v1/mobile/user/profile
Content-Type: application/json

{
  "name": "John Doe",
  "phone": "+1234567890",
  "timezone": "America/New_York"
}
```

#### Update Settings

```http
POST /api/v1/mobile/user/settings
Content-Type: application/json

{
  "notifications": {
    "push_enabled": true,
    "email_enabled": false
  },
  "theme": "dark",
  "language": "en"
}
```

#### Get User Sessions

```http
GET /api/v1/mobile/user/sessions
```

#### Logout All Devices

```http
POST /api/v1/mobile/user/logout-all
```

### Feedback System

#### Submit Feedback

```http
POST /api/v1/mobile/feedback
Content-Type: application/json

{
  "type": "bug_report",
  "title": "App crashes on startup",
  "description": "The app crashes when I try to open it...",
  "rating": 2,
  "category": "technical",
  "priority": "high"
}
```

#### Get User Feedback

```http
GET /api/v1/mobile/feedback?page=1&limit=20
```

#### Get Feedback Statistics

```http
GET /api/v1/mobile/feedback/stats
```

### Support System

#### Get FAQs

```http
GET /api/v1/mobile/support/faqs?category=technical&search=password
```

#### Get Specific FAQ

```http
GET /api/v1/mobile/support/faqs/1
```

#### Rate FAQ

```http
POST /api/v1/mobile/support/faqs/1/rate
Content-Type: application/json

{
  "helpful": true,
  "comment": "This solved my problem!"
}
```

#### Create Support Ticket

```http
POST /api/v1/mobile/support/tickets
Content-Type: multipart/form-data

subject=Login Issues
description=I cannot log into my account
category=technical
priority=high
attachments[]=@screenshot.png
```

#### Get User Tickets

```http
GET /api/v1/mobile/support/tickets?status=open&page=1
```

#### Add Message to Ticket

```http
POST /api/v1/mobile/support/tickets/TKT-ABC123/messages
Content-Type: application/json

{
  "message": "I tried the suggested solution but it didn't work."
}
```

### Notification Management

#### Get Notifications

```http
GET /api/v1/mobile/notifications?page=1&limit=20&read=false
```

#### Mark Notification as Read

```http
POST /api/v1/mobile/notifications/notif_123/read
```

#### Mark All as Read

```http
POST /api/v1/mobile/notifications/mark-all-read
```

#### Get Notification Settings

```http
GET /api/v1/mobile/notifications/settings
```

#### Update Notification Settings

```http
POST /api/v1/mobile/notifications/settings
Content-Type: application/json

{
  "push_enabled": true,
  "email_enabled": false,
  "categories": {
    "system": true,
    "user": true,
    "marketing": false
  },
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00"
  }
}
```

#### Send Test Notification

```http
POST /api/v1/mobile/notifications/test
```

## Installation

1. The MobileBridge module should already be installed in your Laravel application.

2. Ensure Laravel Sanctum is configured:

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

3. Add Sanctum middleware to your API routes in `app/Http/Kernel.php`:

```php
'api' => [
    \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
    'throttle:api',
    \Illuminate\Routing\Middleware\SubstituteBindings::class,
],
```

4. Configure VAPID keys for push notifications:

```bash
php artisan webpush:vapid
```

5. Add VAPID keys to your `.env` file:

```env
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_SUBJECT=mailto:your-email@example.com
```

## Configuration

### Cache Configuration

The module uses Laravel's cache system extensively. Ensure you have a proper cache driver configured:

```env
CACHE_DRIVER=redis
# or
CACHE_DRIVER=database
```

### Queue Configuration

For optimal performance, configure queues for background processing:

```env
QUEUE_CONNECTION=redis
# or
QUEUE_CONNECTION=database
```

### File Storage

Configure file storage for attachments:

```env
FILESYSTEM_DISK=public
```

## Security Considerations

1. **Authentication**: All endpoints use Laravel Sanctum for authentication
2. **Rate Limiting**: Consider implementing rate limiting for API endpoints
3. **File Uploads**: Validate file types and sizes for security
4. **Input Validation**: All inputs are validated using Laravel's validation system
5. **CORS**: Configure CORS settings for mobile app domains

## Error Handling

All endpoints return consistent JSON responses:

### Success Response

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response

```json
{
    "success": false,
    "error": "Error message",
    "errors": {
        "field": ["Validation error message"]
    }
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Testing

You can test the API endpoints using tools like:

- Postman
- Insomnia
- cURL
- Laravel's built-in testing features

### Example cURL Request

```bash
curl -X GET \
  http://your-app.com/api/v1/mobile/user \
  -H 'Authorization: Bearer your-sanctum-token' \
  -H 'Accept: application/json'
```

## Performance Optimization

1. **Caching**: The module uses extensive caching to improve performance
2. **Pagination**: Large datasets are paginated to reduce response times
3. **Lazy Loading**: Related data is loaded only when needed
4. **Database Indexing**: Ensure proper database indexes for frequently queried fields
5. **Queue Processing**: Use queues for time-consuming operations

## Monitoring and Logging

The module includes comprehensive logging for:

- API requests and responses
- Error tracking
- User activity
- Performance metrics

Logs are written to Laravel's default logging system and can be monitored using tools like:

- Laravel Telescope
- Laravel Horizon (for queues)
- External monitoring services

## Contributing

When contributing to the MobileBridge module:

1. Follow Laravel coding standards
2. Add appropriate validation for all inputs
3. Include comprehensive error handling
4. Write tests for new functionality
5. Update documentation for new endpoints
6. Use consistent response formats

## Support

For support and questions:

1. Check the FAQ section in the support system
2. Create a support ticket through the API
3. Review the Laravel documentation
4. Check the module's error logs

## License

This module is part of your Laravel application and follows the same licensing terms.
