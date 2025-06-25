# API Request/Response Examples

This document provides detailed examples of requests and responses for common API operations in the Rental Management System.

## Authentication Examples

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "your-password"
}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "token": "1|abcdef1234567890...",
        "token_type": "Bearer",
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "user@example.com",
            "roles": ["rental_manager"],
            "permissions": ["rental.view", "rental.create"]
        }
    }
}
```

Error Response (Invalid Credentials):
```json
{
    "status": "error",
    "message": "Invalid credentials",
    "errors": {
        "email": ["These credentials do not match our records."]
    }
}
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

Success Response:
```json
{
    "status": "success",
    "message": "Successfully logged out"
}
```

## Rental Management Examples

### List Rentals
```http
GET /api/rentals?include=customer,equipment&filter[status]=active&sort=-created_at
Authorization: Bearer {token}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "current_page": 1,
        "data": [
            {
                "id": 1,
                "status": "active",
                "start_date": "2024-04-01",
                "end_date": "2024-04-07",
                "customer": {
                    "id": 1,
                    "name": "Acme Corp",
                    "email": "contact@acme.com"
                },
                "equipment": {
                    "id": 1,
                    "name": "Excavator XL2000",
                    "status": "rented"
                }
            }
        ],
        "per_page": 15,
        "total": 50
    }
}
```

### Create Rental with Validation Error
```http
POST /api/rentals
Content-Type: application/json
Authorization: Bearer {token}

{
    "customer_id": 1,
    "equipment_id": 1,
    "start_date": "2024-03-01",
    "end_date": "2024-02-01"
}
```

Error Response:
```json
{
    "status": "error",
    "message": "Validation failed",
    "errors": {
        "end_date": ["End date must be after start date"],
        "purpose": ["The purpose field is required"]
    }
}
```

### Process Rental Return with Damages
```http
POST /api/rentals/1/return
Content-Type: application/json
Authorization: Bearer {token}

{
    "condition_notes": "Equipment returned with damages",
    "meter_reading": "1500",
    "fuel_level": "half",
    "damages": [
        {
            "type": "physical",
            "description": "Dented exterior panel",
            "severity": "medium",
            "estimated_cost": 500
        }
    ],
    "additional_charges": [
        {
            "type": "damage_repair",
            "amount": 500,
            "description": "Repair dented panel"
        },
        {
            "type": "fuel_refill",
            "amount": 100,
            "description": "Refill to full tank"
        }
    ]
}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "rental_id": 1,
        "return_date": "2024-04-07T15:30:00Z",
        "total_charges": 600,
        "invoice_number": "INV-2024-0123",
        "status": "completed"
    }
}
```

## Employee Management Examples

### Create Employee with Documents
```http
POST /api/employees
Content-Type: multipart/form-data
Authorization: Bearer {token}

{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "department_id": 1,
    "position_id": 1,
    "joining_date": "2024-04-01",
    "employment_type": "full_time",
    "documents": [
        {
            "type": "contract",
            "file": "(binary)",
            "expiry_date": "2025-04-01"
        },
        {
            "type": "passport",
            "file": "(binary)",
            "expiry_date": "2029-03-25"
        }
    ]
}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "employee": {
            "id": 1,
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@example.com",
            "status": "active",
            "documents": [
                {
                    "id": 1,
                    "type": "contract",
                    "file_path": "documents/contract-123.pdf",
                    "expiry_date": "2025-04-01"
                },
                {
                    "id": 2,
                    "type": "passport",
                    "file_path": "documents/passport-123.pdf",
                    "expiry_date": "2029-03-25"
                }
            ]
        }
    }
}
```

### Process Employee Transfer with Salary Adjustment
```http
POST /api/employees/1/transfer
Content-Type: application/json
Authorization: Bearer {token}

{
    "new_department_id": 2,
    "new_position_id": 3,
    "effective_date": "2024-05-01",
    "reason": "Career development",
    "salary_adjustment": {
        "type": "increment",
        "amount": 5000,
        "percentage": 10,
        "effective_date": "2024-05-01"
    }
}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "transfer": {
            "id": 1,
            "employee_id": 1,
            "from_department_id": 1,
            "to_department_id": 2,
            "effective_date": "2024-05-01",
            "status": "approved"
        },
        "salary_adjustment": {
            "id": 1,
            "previous_salary": 50000,
            "new_salary": 55000,
            "effective_date": "2024-05-01"
        }
    }
}
```

## Project Management Examples

### Create Project with Phases
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
    "status": "planning",
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
        },
        {
            "name": "Execution",
            "start_date": "2024-05-01",
            "end_date": "2024-09-30",
            "tasks": [
                {
                    "name": "Site preparation",
                    "assignee_id": 2,
                    "due_date": "2024-05-15"
                }
            ]
        }
    ]
}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "project": {
            "id": 1,
            "name": "Construction Site A",
            "status": "planning",
            "phases": [
                {
                    "id": 1,
                    "name": "Planning",
                    "tasks": [
                        {
                            "id": 1,
                            "name": "Requirements gathering",
                            "status": "pending"
                        }
                    ]
                },
                {
                    "id": 2,
                    "name": "Execution",
                    "tasks": [
                        {
                            "id": 2,
                            "name": "Site preparation",
                            "status": "pending"
                        }
                    ]
                }
            ]
        }
    }
}
```

### Submit and Process Change Request
```http
POST /api/projects/1/changes
Content-Type: application/json
Authorization: Bearer {token}

{
    "title": "Scope Extension",
    "description": "Additional requirements",
    "impact": {
        "schedule": 30,
        "budget": 100000
    },
    "justification": "Customer requested features",
    "documents": [
        {
            "type": "requirements",
            "file": "(binary)",
            "description": "Updated requirements document"
        }
    ]
}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "change_request": {
            "id": 1,
            "status": "pending_approval",
            "impact": {
                "schedule": 30,
                "budget": 100000
            },
            "documents": [
                {
                    "id": 1,
                    "type": "requirements",
                    "file_path": "documents/requirements-123.pdf"
                }
            ]
        }
    }
}
```

## Equipment Management Examples

### Create Equipment with Specifications
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
    "status": "available",
    "specifications": {
        "weight": 20000,
        "dimensions": {
            "length": 600,
            "width": 250,
            "height": 300
        },
        "fuel_type": "diesel",
        "capacity": 2.5
    },
    "maintenance_schedule": {
        "interval_hours": 100,
        "tasks": [
            {
                "name": "Oil change",
                "interval_hours": 100
            },
            {
                "name": "Filter replacement",
                "interval_hours": 200
            }
        ]
    }
}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "equipment": {
            "id": 1,
            "name": "Excavator XL2000",
            "status": "available",
            "specifications": {
                "weight": 20000,
                "dimensions": {
                    "length": 600,
                    "width": 250,
                    "height": 300
                }
            },
            "next_maintenance": {
                "due_date": "2024-04-25",
                "hours_remaining": 95
            }
        }
    }
}
```

### Record Equipment Maintenance
```http
POST /api/equipment/1/maintenance
Content-Type: application/json
Authorization: Bearer {token}

{
    "type": "preventive",
    "description": "Regular service",
    "tasks_completed": [
        {
            "name": "Oil change",
            "parts_used": [
                {
                    "name": "Engine oil",
                    "quantity": 20,
                    "unit": "liters"
                }
            ],
            "labor_hours": 2
        }
    ],
    "cost": {
        "parts": 300,
        "labor": 200,
        "total": 500
    },
    "meter_reading": 1000,
    "performed_by": "John Smith",
    "date": "2024-03-25"
}
```

Success Response:
```json
{
    "status": "success",
    "data": {
        "maintenance": {
            "id": 1,
            "equipment_id": 1,
            "type": "preventive",
            "status": "completed",
            "cost": {
                "parts": 300,
                "labor": 200,
                "total": 500
            },
            "next_maintenance_due": "2024-04-25"
        }
    }
}
```

## Error Response Examples

### Resource Not Found
```json
{
    "status": "error",
    "message": "Resource not found",
    "error_code": "E404",
    "details": {
        "resource_type": "Equipment",
        "resource_id": 999
    }
}
```

### Permission Denied
```json
{
    "status": "error",
    "message": "Permission denied",
    "error_code": "E403",
    "details": {
        "required_permission": "equipment.update",
        "user_permissions": ["equipment.view"]
    }
}
```

### Validation Error
```json
{
    "status": "error",
    "message": "Validation failed",
    "error_code": "E422",
    "errors": {
        "start_date": [
            "The start date must be a future date",
            "The start date must be before end date"
        ],
        "budget": [
            "The budget must be at least 1000"
        ]
    }
}
```

### Rate Limit Exceeded
```json
{
    "status": "error",
    "message": "Too many requests",
    "error_code": "E429",
    "details": {
        "retry_after": 30,
        "limit": 60,
        "remaining": 0
    }
}
``` 