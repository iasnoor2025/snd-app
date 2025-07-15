# Geofencing System Documentation

## Overview

The Geofencing System is a comprehensive location-based attendance tracking solution integrated into the TimesheetManagement module. It provides real-time location validation, violation detection, and compliance monitoring for mobile timesheet entries.

## Features

### Core Functionality

- **Location Validation**: Real-time validation of employee locations against defined geofence zones
- **Multiple Zone Types**: Support for circular and polygon geofence zones
- **Violation Detection**: Automatic detection and reporting of geofence violations
- **Mobile Integration**: Seamless integration with mobile timesheet applications
- **Offline Support**: Processing of offline timesheet entries with geofence validation

### Zone Management

- **Circular Zones**: Define zones with center coordinates and radius
- **Polygon Zones**: Define complex zones with multiple coordinate points
- **Project Association**: Link zones to specific projects or sites
- **Time Restrictions**: Configure active hours and days for zones
- **Enforcement Settings**: Control entry/exit enforcement and overtime allowances

### Monitoring & Analytics

- **Real-time Dashboard**: Live monitoring of geofence compliance
- **Violation Management**: Track, resolve, and manage violations
- **Statistics & Reports**: Comprehensive analytics and reporting
- **Work Area Coverage**: Analysis of geofence coverage for projects
- **Export Capabilities**: Export data in multiple formats (CSV, Excel, PDF)

## Architecture

### Backend Components

#### Models

- `GeofenceZone`: Core model for geofence zone definitions
- `Timesheet`: Extended with geofencing fields and relationships

#### Services

- `GeofencingService`: Core business logic for geofence operations
    - Location validation
    - Distance calculations
    - Polygon point-in-polygon checks
    - Statistics generation

#### Controllers

- `GeofenceController`: API endpoints for zone management and validation
- `TimesheetController`: Enhanced with geofencing integration

#### Events & Listeners

- `GeofenceViolationDetected`: Event fired when violations occur
- `HandleGeofenceViolation`: Listener for processing violations

#### Middleware

- `GeofenceCheck`: Validates geofence compliance for requests
- `GeofenceVerify`: Security checks and anti-spoofing measures
- `MobileAuth`: Mobile-specific authentication

#### Console Commands

- `geofence:cleanup`: Clean up old geofencing data
- `geofence:process-offline`: Process offline timesheets

### Frontend Components

#### React Components

- `GeofenceZoneManager`: Zone creation and management interface
- `GeofenceMapView`: Interactive map for visualizing zones and locations
- `GeofenceStatsDashboard`: Analytics and monitoring dashboard
- `GeofenceViolationManager`: Violation tracking and resolution
- `MobileTimesheetLogger`: Mobile timesheet entry with GPS
- `MobileTimesheetEntry`: Offline-capable mobile interface

#### Services

- `geofencingApi`: Centralized API service for frontend-backend communication

#### Types

- `geofencing.ts`: TypeScript interfaces and types for type safety

## Installation & Setup

### Prerequisites

- Laravel 10+
- PHP 8.1+
- MySQL/PostgreSQL database
- Node.js 18+ (for frontend)
- React 18+

### Backend Setup

1. **Run Migrations**

    ```bash
    php artisan migrate
    ```

2. **Publish Configuration**

    ```bash
    php artisan vendor:publish --tag=geofencing-config
    ```

3. **Configure Environment**

    ```env
    # Geofencing Settings
    GEOFENCE_ENABLED=true
    GEOFENCE_DEFAULT_RADIUS=100
    GEOFENCE_MAX_DISTANCE=1000
    GEOFENCE_VIOLATIONS_ENABLED=true

    # GPS Settings
    GPS_ACCURACY_THRESHOLD=10
    GPS_TIMEOUT=30000
    GPS_MAX_AGE=60000
    ```

4. **Register Service Provider**
   The `GeofencingServiceProvider` is automatically registered through the main `TimesheetManagementServiceProvider`.

### Frontend Setup

1. **Install Dependencies**

    ```bash
    npm install
    ```

2. **Build Assets**
    ```bash
    npm run build
    ```

## Configuration

### Geofencing Configuration

The system uses the `config/mobile_geofencing.php` configuration file:

```php
return [
    'gps' => [
        'accuracy_threshold' => 10, // meters
        'timeout' => 30000, // milliseconds
        'max_age' => 60000, // milliseconds
    ],

    'geofence_zones' => [
        'default_radius' => 100, // meters
        'max_radius' => 5000, // meters
        'min_polygon_points' => 3,
        'max_polygon_points' => 20,
    ],

    'violation_detection' => [
        'enabled' => true,
        'severity_levels' => ['low', 'medium', 'high', 'critical'],
        'auto_resolve_timeout' => 24, // hours
    ],
];
```

## API Endpoints

### Zone Management

- `GET /api/geofences` - List all zones
- `POST /api/geofences` - Create new zone
- `GET /api/geofences/{id}` - Get specific zone
- `PUT /api/geofences/{id}` - Update zone
- `DELETE /api/geofences/{id}` - Delete zone
- `POST /api/geofences/{id}/toggle-active` - Toggle zone status

### Location Validation

- `POST /api/geofences/validate-location` - Validate location
- `GET /api/mobile/timesheets/geofences/nearby` - Get nearby zones
- `POST /api/mobile/timesheets/location/validate` - Mobile validation

### Analytics & Reporting

- `GET /api/geofences/statistics` - Get statistics
- `GET /api/geofences/violations` - List violations
- `GET /api/geofences/work-area-coverage` - Coverage analysis

## Usage Examples

### Creating a Circular Zone

```javascript
import { geofencingApi } from './services/geofencingApi';

const createCircularZone = async () => {
    const zoneData = {
        name: 'Main Office',
        description: 'Primary office location',
        type: 'circular',
        latitude: 40.7128,
        longitude: -74.006,
        radius: 100,
        project_id: 1,
        is_active: true,
        enforce_entry: true,
        enforce_exit: true,
        monitoring_enabled: true,
        alert_on_violation: true,
    };

    try {
        const zone = await geofencingApi.zones.create(zoneData);
        console.log('Zone created:', zone);
    } catch (error) {
        console.error('Error creating zone:', error);
    }
};
```

### Validating Location

```javascript
const validateLocation = async (lat, lng, employeeId, projectId) => {
    try {
        const result = await geofencingApi.validation.validateLocation(lat, lng, employeeId, projectId);

        if (result.compliant) {
            console.log('Location is compliant');
        } else {
            console.log('Violations detected:', result.violations);
        }
    } catch (error) {
        console.error('Validation error:', error);
    }
};
```

### Processing Offline Timesheets

```bash
# Process all offline timesheets
php artisan geofence:process-offline

# Process with specific parameters
php artisan geofence:process-offline --batch-size=50 --max-age=48 --user-id=123

# Dry run to see what would be processed
php artisan geofence:process-offline --dry-run
```

## Mobile Integration

### GPS Requirements

- Location permissions must be granted
- GPS accuracy should be within configured threshold
- Network connectivity for real-time validation

### Offline Support

- Timesheets can be created offline
- Location data is stored locally
- Sync occurs when connectivity is restored
- Geofence validation happens during sync

### Security Features

- Device fingerprinting
- Anti-spoofing measures
- Location accuracy validation
- Suspicious activity detection

## Monitoring & Maintenance

### Regular Tasks

1. **Data Cleanup**

    ```bash
    # Clean up old data (keep last 30 days)
    php artisan geofence:cleanup --days=30

    # Clean specific data types
    php artisan geofence:cleanup --type=violations --days=90
    ```

2. **Process Offline Entries**

    ```bash
    # Schedule this to run regularly
    php artisan geofence:process-offline
    ```

3. **Monitor Performance**
    - Check database query performance
    - Monitor API response times
    - Review violation patterns

### Troubleshooting

#### Common Issues

1. **GPS Accuracy Problems**
    - Check device GPS settings
    - Verify accuracy threshold configuration
    - Consider environmental factors

2. **Violation False Positives**
    - Review zone boundaries
    - Adjust accuracy thresholds
    - Check time restrictions

3. **Performance Issues**
    - Optimize database queries
    - Consider caching strategies
    - Review batch processing sizes

#### Debugging

```bash
# Enable debug logging
LOG_LEVEL=debug

# Check logs
tail -f storage/logs/laravel.log | grep -i geofence
```

## Testing

### Running Tests

```bash
# Run all geofencing tests
php artisan test --filter=Geofenc

# Run specific test classes
php artisan test Tests/Unit/GeofencingServiceTest.php
php artisan test Tests/Feature/GeofenceControllerTest.php
```

### Test Coverage

- Unit tests for GeofencingService
- Feature tests for API endpoints
- Integration tests for mobile workflows
- Performance tests for large datasets

## Security Considerations

### Data Protection

- Location data is encrypted at rest
- API endpoints require authentication
- Role-based access control
- Audit logging for sensitive operations

### Privacy Compliance

- Configurable data retention periods
- User consent management
- Data anonymization options
- GDPR compliance features

## Performance Optimization

### Database Optimization

- Spatial indexes for location queries
- Proper indexing on frequently queried fields
- Query optimization for large datasets
- Regular maintenance and cleanup

### Caching Strategies

- Zone data caching
- Statistics caching
- API response caching
- Mobile data synchronization

## Future Enhancements

### Planned Features

- Machine learning for anomaly detection
- Advanced analytics and reporting
- Integration with external mapping services
- Enhanced mobile offline capabilities
- Real-time notifications and alerts

### Extensibility

- Plugin architecture for custom validators
- Webhook support for external integrations
- Custom violation severity algorithms
- Third-party mapping service integration

## Support

For technical support or questions:

- Check the troubleshooting section
- Review the API documentation
- Examine the test files for usage examples
- Consult the configuration files for available options

## License

This geofencing system is part of the TimesheetManagement module and follows the same licensing terms as the main application.
