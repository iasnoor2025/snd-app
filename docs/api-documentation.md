# Laravel 12 Rental Management System - API Documentation

## Overview

This document provides comprehensive documentation for the Rental Management System API. The API follows RESTful principles and uses JSON for request/response payloads.

## Authentication

All API endpoints require authentication using Laravel Sanctum tokens.

### Authentication Headers
```
Authorization: Bearer {your-token}
```

### Obtaining Access Token
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your-password"
}
```

Response:
```json
{
    "token": "your-access-token",
    "token_type": "Bearer"
}
```

## Common Response Formats

### Success Response
```json
{
    "status": "success",
    "data": {
        // Response data
    },
    "message": "Operation completed successfully"
}
```

### Error Response
```json
{
    "status": "error",
    "message": "Error description",
    "errors": {
        // Validation errors if applicable
    }
}
```

## API Endpoints

### Rental Management

#### Create Rental Request
```http
POST /api/rentals
Content-Type: application/json
Authorization: Bearer {token}

{
    "customer_id": 1,
    "equipment_id": 1,
    "start_date": "2024-04-01",
    "end_date": "2024-04-07",
    "purpose": "Construction project",
    "delivery_location": "123 Site Street"
}
```

Response:
```json
{
    "status": "success",
    "data": {
        "id": 1,
        "status": "pending",
        "customer_id": 1,
        "equipment_id": 1,
        "start_date": "2024-04-01",
        "end_date": "2024-04-07",
        "created_at": "2024-03-25T12:00:00Z"
    }
}
```

#### Approve Rental
```http
POST /api/rentals/{id}/approve
Content-Type: application/json
Authorization: Bearer {token}

{
    "notes": "Equipment availability confirmed"
}
```

#### Process Rental Return
```http
POST /api/rentals/{id}/return
Content-Type: application/json
Authorization: Bearer {token}

{
    "condition_notes": "Minor wear and tear",
    "meter_reading": "1500",
    "fuel_level": "three_quarters",
    "damages": [],
    "additional_charges": []
}
```

### Employee Management

#### Create Employee
```http
POST /api/employees
Content-Type: application/json
Authorization: Bearer {token}

{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "department_id": 1,
    "position_id": 1,
    "joining_date": "2024-04-01",
    "employment_type": "full_time"
}
```

#### Upload Employee Documents
```http
POST /api/employees/{id}/documents
Content-Type: multipart/form-data
Authorization: Bearer {token}

documents[0][type]: "contract"
documents[0][file]: (binary)
documents[0][expiry_date]: "2025-04-01"
```

#### Process Employee Transfer
```http
POST /api/employees/{id}/transfer
Content-Type: application/json
Authorization: Bearer {token}

{
    "new_department_id": 2,
    "new_position_id": 3,
    "effective_date": "2024-05-01",
    "reason": "Career development"
}
```

### Project Management

#### Create Project
```http
POST /api/projects
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "Construction Site A",
    "description": "New construction project",
    "customer_id": 1,
    "start_date": "2024-04-01",
    "end_date": "2024-10-01",
    "budget": 1000000,
    "status": "planning"
}
```

#### Create Project Phase
```http
POST /api/projects/{id}/phases
Content-Type: application/json
Authorization: Bearer {token}

{
    "phases": [
        {
            "name": "Planning",
            "start_date": "2024-04-01",
            "end_date": "2024-04-30",
            "tasks": [
                {
                    "name": "Requirements gathering",
                    "assignee_id": 1,
                    "due_date": "2024-04-14"
                }
            ]
        }
    ]
}
```

#### Submit Change Request
```http
POST /api/projects/{id}/changes
Content-Type: application/json
Authorization: Bearer {token}

{
    "title": "Scope Extension",
    "description": "Additional requirements",
    "impact": {
        "schedule": 30,
        "budget": 100000
    },
    "justification": "Customer requested features"
}
```

### Equipment Management

#### Create Equipment
```http
POST /api/equipment
Content-Type: application/json
Authorization: Bearer {token}

{
    "name": "Excavator XL2000",
    "type": "heavy_machinery",
    "model": "XL2000",
    "manufacturer": "CAT",
    "purchase_date": "2023-01-01",
    "status": "available"
}
```

#### Update Equipment Status
```http
PUT /api/equipment/{id}/status
Content-Type: application/json
Authorization: Bearer {token}

{
    "status": "maintenance",
    "notes": "Scheduled maintenance"
}
```

#### Record Maintenance
```http
POST /api/equipment/{id}/maintenance
Content-Type: application/json
Authorization: Bearer {token}

{
    "type": "preventive",
    "description": "Regular service",
    "cost": 500,
    "date": "2024-03-25",
    "performed_by": "John Smith"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input parameters |
| 401  | Unauthorized - Invalid or missing token |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource not found |
| 422  | Unprocessable Entity - Validation failed |
| 500  | Internal Server Error |

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 60 requests per minute for authenticated users
- 30 requests per minute for unauthenticated requests

## Pagination

List endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 15, max: 100)

Example:
```http
GET /api/rentals?page=2&per_page=20
```

## Filtering and Sorting

List endpoints support filtering and sorting:
- `sort`: Field to sort by (prefix with `-` for descending)
- `filter[field]`: Filter by field value

Example:
```http
GET /api/rentals?sort=-created_at&filter[status]=active
```

## Includes and Relations

Some endpoints support including related data using the `include` parameter:

Example:
```http
GET /api/rentals/1?include=customer,equipment
```

## Webhooks

The system supports webhooks for real-time event notifications:

1. Configure webhook endpoint:
```http
POST /api/webhooks
Content-Type: application/json
Authorization: Bearer {token}

{
    "url": "https://your-domain.com/webhook",
    "events": ["rental.created", "rental.completed"],
    "is_active": true
}
```

2. Webhook payload format:
```json
{
    "event": "rental.created",
    "created_at": "2024-03-25T12:00:00Z",
    "data": {
        // Event specific data
    }
}
```

## API Versioning

The API is versioned through the URL:
- Current version: `/api/v1/`
- Legacy version: `/api/v1/` (maintained for backward compatibility)

## Best Practices

1. Always include the `Accept: application/json` header
2. Use appropriate HTTP methods (GET, POST, PUT, DELETE)
3. Handle rate limiting with exponential backoff
4. Implement proper error handling
5. Cache responses where appropriate
6. Use HTTPS for all requests

## Support

For API support and questions:
- Email: api-support@example.com
- Documentation: https://docs.example.com
- Status page: https://status.example.com 