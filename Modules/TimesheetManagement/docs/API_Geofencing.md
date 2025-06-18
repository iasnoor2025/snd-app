# Geofencing API Documentation

## Overview

This document provides comprehensive API documentation for the Geofencing system endpoints. All endpoints require authentication unless otherwise specified.

## Base URL

```
/api/geofences
```

## Authentication

All API endpoints require Bearer token authentication:

```http
Authorization: Bearer {your-token}
```

## Error Responses

All endpoints follow standard HTTP status codes and return errors in the following format:

```json
{
  "message": "Error description",
  "errors": {
    "field": ["Validation error message"]
  },
  "code": "ERROR_CODE"
}
```

## Endpoints

### Zone Management

#### List Geofence Zones

```http
GET /api/geofences
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | No | Filter by project ID |
| `is_active` | boolean | No | Filter by active status |
| `type` | string | No | Filter by zone type (`circular`, `polygon`) |
| `page` | integer | No | Page number for pagination |
| `per_page` | integer | No | Items per page (max 100) |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Main Office",
      "description": "Primary office location",
      "type": "circular",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "radius": 100,
      "coordinates": null,
      "project_id": 1,
      "is_active": true,
      "enforce_entry": true,
      "enforce_exit": true,
      "monitoring_enabled": true,
      "alert_on_violation": true,
      "active_hours_start": "09:00:00",
      "active_hours_end": "17:00:00",
      "active_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
      "overtime_allowed": false,
      "created_at": "2025-01-28T10:00:00Z",
      "updated_at": "2025-01-28T10:00:00Z",
      "project": {
        "id": 1,
        "name": "Project Alpha"
      }
    }
  ],
  "links": {
    "first": "/api/geofences?page=1",
    "last": "/api/geofences?page=5",
    "prev": null,
    "next": "/api/geofences?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 15,
    "to": 15,
    "total": 75
  }
}
```

#### Create Geofence Zone

```http
POST /api/geofences
```

**Request Body (Circular Zone):**

```json
{
  "name": "Main Office",
  "description": "Primary office location",
  "type": "circular",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radius": 100,
  "project_id": 1,
  "is_active": true,
  "enforce_entry": true,
  "enforce_exit": true,
  "monitoring_enabled": true,
  "alert_on_violation": true,
  "active_hours_start": "09:00:00",
  "active_hours_end": "17:00:00",
  "active_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "overtime_allowed": false
}
```

**Request Body (Polygon Zone):**

```json
{
  "name": "Construction Site",
  "description": "Main construction area",
  "type": "polygon",
  "coordinates": [
    [40.7128, -74.0060],
    [40.7130, -74.0058],
    [40.7132, -74.0062],
    [40.7129, -74.0064]
  ],
  "project_id": 2,
  "is_active": true,
  "enforce_entry": true,
  "enforce_exit": false,
  "monitoring_enabled": true,
  "alert_on_violation": true
}
```

**Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | string | Yes | max:255, unique per project |
| `description` | string | No | max:1000 |
| `type` | string | Yes | in:circular,polygon |
| `latitude` | numeric | Yes (circular) | between:-90,90 |
| `longitude` | numeric | Yes (circular) | between:-180,180 |
| `radius` | numeric | Yes (circular) | min:1, max:5000 |
| `coordinates` | array | Yes (polygon) | min:3, max:20 points |
| `project_id` | integer | Yes | exists:projects,id |
| `is_active` | boolean | No | default:true |
| `enforce_entry` | boolean | No | default:true |
| `enforce_exit` | boolean | No | default:true |
| `monitoring_enabled` | boolean | No | default:true |
| `alert_on_violation` | boolean | No | default:true |
| `active_hours_start` | time | No | format:H:i:s |
| `active_hours_end` | time | No | format:H:i:s |
| `active_days` | array | No | values in:monday,tuesday,wednesday,thursday,friday,saturday,sunday |
| `overtime_allowed` | boolean | No | default:false |

**Response:**

```json
{
  "data": {
    "id": 1,
    "name": "Main Office",
    "description": "Primary office location",
    "type": "circular",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 100,
    "coordinates": null,
    "project_id": 1,
    "is_active": true,
    "enforce_entry": true,
    "enforce_exit": true,
    "monitoring_enabled": true,
    "alert_on_violation": true,
    "active_hours_start": "09:00:00",
    "active_hours_end": "17:00:00",
    "active_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "overtime_allowed": false,
    "created_at": "2025-01-28T10:00:00Z",
    "updated_at": "2025-01-28T10:00:00Z"
  },
  "message": "Geofence zone created successfully"
}
```

#### Get Geofence Zone

```http
GET /api/geofences/{id}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "name": "Main Office",
    "description": "Primary office location",
    "type": "circular",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 100,
    "coordinates": null,
    "project_id": 1,
    "is_active": true,
    "enforce_entry": true,
    "enforce_exit": true,
    "monitoring_enabled": true,
    "alert_on_violation": true,
    "active_hours_start": "09:00:00",
    "active_hours_end": "17:00:00",
    "active_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
    "overtime_allowed": false,
    "created_at": "2025-01-28T10:00:00Z",
    "updated_at": "2025-01-28T10:00:00Z",
    "project": {
      "id": 1,
      "name": "Project Alpha",
      "description": "Main project"
    },
    "statistics": {
      "total_entries": 150,
      "total_violations": 5,
      "compliance_rate": 96.67
    }
  }
}
```

#### Update Geofence Zone

```http
PUT /api/geofences/{id}
```

**Request Body:** Same as create endpoint

**Response:** Same as create endpoint

#### Delete Geofence Zone

```http
DELETE /api/geofences/{id}
```

**Response:**

```json
{
  "message": "Geofence zone deleted successfully"
}
```

#### Toggle Zone Active Status

```http
POST /api/geofences/{id}/toggle-active
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "is_active": false
  },
  "message": "Geofence zone status updated successfully"
}
```

### Location Validation

#### Validate Location

```http
POST /api/geofences/validate-location
```

**Request Body:**

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "employee_id": 123,
  "project_id": 1,
  "accuracy": 5.2,
  "timestamp": "2025-01-28T10:00:00Z"
}
```

**Validation Rules:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `latitude` | numeric | Yes | between:-90,90 |
| `longitude` | numeric | Yes | between:-180,180 |
| `employee_id` | integer | Yes | exists:users,id |
| `project_id` | integer | No | exists:projects,id |
| `accuracy` | numeric | No | min:0 |
| `timestamp` | datetime | No | ISO 8601 format |

**Response:**

```json
{
  "data": {
    "compliant": false,
    "violations": [
      {
        "zone_id": 1,
        "zone_name": "Main Office",
        "violation_type": "outside_zone",
        "distance_from_zone": 150.5,
        "severity": "medium",
        "message": "Employee is 150.5 meters outside the Main Office zone"
      }
    ],
    "nearest_zone": {
      "id": 1,
      "name": "Main Office",
      "distance": 150.5,
      "type": "circular"
    },
    "location_accuracy": 5.2,
    "validation_timestamp": "2025-01-28T10:00:00Z"
  }
}
```

#### Detect Location Violations

```http
POST /api/geofences/detect-violations
```

**Request Body:**

```json
{
  "timesheet_id": 456,
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2025-01-28T10:00:00Z"
}
```

**Response:**

```json
{
  "data": {
    "violations_detected": true,
    "violations": [
      {
        "id": 789,
        "timesheet_id": 456,
        "zone_id": 1,
        "violation_type": "outside_zone",
        "severity": "medium",
        "distance_from_zone": 150.5,
        "detected_at": "2025-01-28T10:00:00Z",
        "status": "pending",
        "auto_resolved": false
      }
    ],
    "total_violations": 1
  }
}
```

### Mobile Endpoints

#### Get Nearby Zones (Mobile)

```http
GET /api/mobile/timesheets/geofences/nearby
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `latitude` | numeric | Yes | Current latitude |
| `longitude` | numeric | Yes | Current longitude |
| `radius` | numeric | No | Search radius in meters (default: 1000) |
| `project_id` | integer | No | Filter by project |

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Main Office",
      "type": "circular",
      "distance": 50.2,
      "is_within": true,
      "project_id": 1,
      "project_name": "Project Alpha"
    },
    {
      "id": 2,
      "name": "Secondary Site",
      "type": "polygon",
      "distance": 250.8,
      "is_within": false,
      "project_id": 1,
      "project_name": "Project Alpha"
    }
  ],
  "current_location": {
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "search_radius": 1000
}
```

#### Validate Mobile Location

```http
POST /api/mobile/timesheets/location/validate
```

**Request Body:**

```json
{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "accuracy": 5.2,
  "project_id": 1,
  "device_info": {
    "device_id": "abc123",
    "platform": "android",
    "app_version": "1.0.0"
  }
}
```

**Response:**

```json
{
  "data": {
    "is_valid": true,
    "is_within_geofence": true,
    "zones": [
      {
        "id": 1,
        "name": "Main Office",
        "is_within": true,
        "distance": 0
      }
    ],
    "warnings": [],
    "location_quality": "good"
  }
}
```

### Analytics & Statistics

#### Get Geofence Statistics

```http
GET /api/geofences/statistics
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | No | Filter by project |
| `zone_id` | integer | No | Filter by specific zone |
| `start_date` | date | No | Start date (YYYY-MM-DD) |
| `end_date` | date | No | End date (YYYY-MM-DD) |
| `period` | string | No | Predefined period (today, week, month, year) |

**Response:**

```json
{
  "data": {
    "overview": {
      "total_zones": 15,
      "active_zones": 12,
      "total_entries": 1250,
      "total_violations": 45,
      "compliance_rate": 96.4,
      "average_accuracy": 8.2
    },
    "by_zone": [
      {
        "zone_id": 1,
        "zone_name": "Main Office",
        "entries": 450,
        "violations": 12,
        "compliance_rate": 97.3,
        "average_distance": 25.5
      }
    ],
    "by_day": [
      {
        "date": "2025-01-28",
        "entries": 125,
        "violations": 3,
        "compliance_rate": 97.6
      }
    ],
    "violation_types": {
      "outside_zone": 30,
      "accuracy_low": 10,
      "time_restriction": 5
    }
  },
  "period": {
    "start_date": "2025-01-01",
    "end_date": "2025-01-28",
    "days": 28
  }
}
```

#### Get Violations

```http
GET /api/geofences/violations
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (pending, resolved, dismissed) |
| `severity` | string | No | Filter by severity (low, medium, high, critical) |
| `zone_id` | integer | No | Filter by zone |
| `employee_id` | integer | No | Filter by employee |
| `start_date` | date | No | Start date |
| `end_date` | date | No | End date |
| `page` | integer | No | Page number |
| `per_page` | integer | No | Items per page |

**Response:**

```json
{
  "data": [
    {
      "id": 789,
      "timesheet_id": 456,
      "employee_id": 123,
      "employee_name": "John Doe",
      "zone_id": 1,
      "zone_name": "Main Office",
      "violation_type": "outside_zone",
      "severity": "medium",
      "distance_from_zone": 150.5,
      "latitude": 40.7128,
      "longitude": -74.0060,
      "detected_at": "2025-01-28T10:00:00Z",
      "status": "pending",
      "resolved_at": null,
      "resolved_by": null,
      "notes": null,
      "auto_resolved": false
    }
  ],
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 3,
    "per_page": 15,
    "to": 15,
    "total": 45
  }
}
```

#### Get Work Area Coverage

```http
GET /api/geofences/work-area-coverage
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project_id` | integer | No | Filter by project |
| `start_date` | date | No | Start date |
| `end_date` | date | No | End date |

**Response:**

```json
{
  "data": {
    "total_work_area": 50000,
    "covered_area": 45000,
    "coverage_percentage": 90.0,
    "uncovered_areas": [
      {
        "description": "North parking lot",
        "estimated_area": 2500,
        "priority": "medium"
      }
    ],
    "zone_coverage": [
      {
        "zone_id": 1,
        "zone_name": "Main Office",
        "area": 31416,
        "utilization": 85.5,
        "peak_hours": ["09:00", "13:00", "17:00"]
      }
    ]
  }
}
```

### Violation Management

#### Update Violation Status

```http
PUT /api/geofences/violations/{id}/status
```

**Request Body:**

```json
{
  "status": "resolved",
  "notes": "Employee was attending emergency meeting",
  "resolution_type": "justified"
}
```

**Response:**

```json
{
  "data": {
    "id": 789,
    "status": "resolved",
    "resolved_at": "2025-01-28T15:30:00Z",
    "resolved_by": 456,
    "notes": "Employee was attending emergency meeting",
    "resolution_type": "justified"
  },
  "message": "Violation status updated successfully"
}
```

#### Add Violation Note

```http
POST /api/geofences/violations/{id}/notes
```

**Request Body:**

```json
{
  "note": "Follow-up required with employee",
  "is_internal": true
}
```

**Response:**

```json
{
  "data": {
    "id": 123,
    "violation_id": 789,
    "note": "Follow-up required with employee",
    "is_internal": true,
    "created_by": 456,
    "created_at": "2025-01-28T15:30:00Z"
  },
  "message": "Note added successfully"
}
```

#### Send Violation Notification

```http
POST /api/geofences/violations/{id}/notify
```

**Request Body:**

```json
{
  "notification_type": "email",
  "recipients": ["manager@company.com"],
  "message": "Custom notification message",
  "include_location": true
}
```

**Response:**

```json
{
  "data": {
    "notification_id": "notif_123",
    "sent_at": "2025-01-28T15:30:00Z",
    "recipients": ["manager@company.com"],
    "status": "sent"
  },
  "message": "Notification sent successfully"
}
```

### Export Endpoints

#### Export Violations

```http
GET /api/geofences/violations/export
```

**Query Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | No | Export format (csv, excel, pdf) |
| `start_date` | date | No | Start date |
| `end_date` | date | No | End date |
| `zone_id` | integer | No | Filter by zone |
| `status` | string | No | Filter by status |

**Response:**

```json
{
  "data": {
    "download_url": "/storage/exports/violations_2025-01-28.csv",
    "filename": "violations_2025-01-28.csv",
    "size": 15420,
    "expires_at": "2025-01-29T15:30:00Z"
  },
  "message": "Export generated successfully"
}
```

#### Export Statistics

```http
GET /api/geofences/statistics/export
```

**Query Parameters:** Same as export violations

**Response:** Same format as export violations

#### Export Coverage Data

```http
GET /api/geofences/work-area-coverage/export
```

**Query Parameters:** Same as export violations

**Response:** Same format as export violations

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **General endpoints**: 60 requests per minute
- **Location validation**: 120 requests per minute
- **Mobile endpoints**: 180 requests per minute
- **Export endpoints**: 10 requests per minute

## Webhooks

### Violation Detected

Triggered when a geofence violation is detected:

```json
{
  "event": "geofence.violation.detected",
  "data": {
    "violation_id": 789,
    "timesheet_id": 456,
    "employee_id": 123,
    "zone_id": 1,
    "violation_type": "outside_zone",
    "severity": "medium",
    "detected_at": "2025-01-28T10:00:00Z"
  },
  "timestamp": "2025-01-28T10:00:00Z"
}
```

### Zone Status Changed

Triggered when a zone's active status changes:

```json
{
  "event": "geofence.zone.status_changed",
  "data": {
    "zone_id": 1,
    "previous_status": true,
    "new_status": false,
    "changed_by": 456,
    "changed_at": "2025-01-28T10:00:00Z"
  },
  "timestamp": "2025-01-28T10:00:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { geofencingApi } from './services/geofencingApi';

// Create a zone
const zone = await geofencingApi.zones.create({
  name: 'Office Building',
  type: 'circular',
  latitude: 40.7128,
  longitude: -74.0060,
  radius: 100,
  project_id: 1
});

// Validate location
const validation = await geofencingApi.validation.validateLocation(
  40.7128, -74.0060, 123, 1
);

// Get statistics
const stats = await geofencingApi.statistics.getStatistics({
  project_id: 1,
  period: 'month'
});
```

### PHP

```php
use App\Services\GeofencingService;

$geofencingService = app(GeofencingService::class);

// Validate location
$result = $geofencingService->validateLocation(
    40.7128,
    -74.0060,
    $employeeId,
    $projectId
);

// Process timesheet location
$violations = $geofencingService->processTimesheetLocation(
    $timesheet,
    40.7128,
    -74.0060
);
```

## Testing

### Postman Collection

A Postman collection is available for testing all endpoints. Import the collection and set the following environment variables:

- `base_url`: Your application base URL
- `auth_token`: Your authentication token
- `project_id`: A valid project ID
- `employee_id`: A valid employee ID

### cURL Examples

```bash
# Create a circular zone
curl -X POST \
  http://localhost:8000/api/geofences \
  -H 'Authorization: Bearer your-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Test Zone",
    "type": "circular",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "radius": 100,
    "project_id": 1
  }'

# Validate location
curl -X POST \
  http://localhost:8000/api/geofences/validate-location \
  -H 'Authorization: Bearer your-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "latitude": 40.7128,
    "longitude": -74.0060,
    "employee_id": 123,
    "project_id": 1
  }'
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized**: Check authentication token
2. **422 Validation Error**: Review request body format
3. **404 Not Found**: Verify endpoint URL and resource ID
4. **429 Too Many Requests**: Respect rate limits
5. **500 Internal Server Error**: Check server logs

### Debug Mode

Enable debug mode to get detailed error information:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

### Support

For API support:
- Check the main documentation
- Review the test files for usage examples
- Examine the controller source code
- Contact the development team
