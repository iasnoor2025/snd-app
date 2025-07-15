# Employee Module

This module handles all employee-related functionality for SND Rental, including:

- Employee management (CRUD operations)
- Salary management
- Timesheet tracking
- Leave management
- Performance reviews
- Document management
- Advance payment handling

## Features

### Employee Management

- Create, read, update, and delete employee records
- Track employee personal and professional information
- Manage employee status (active, inactive, on leave, terminated)
- Handle employee documents and certifications

### Salary Management

- Track employee salary history
- Manage salary components (basic salary, allowances)
- Handle salary adjustments and approvals
- Calculate total compensation

### Timesheet Management

- Record employee attendance
- Track work hours and overtime
- Manage break times
- Approve timesheets
- Calculate regular and overtime pay

### Leave Management

- Submit and track leave requests
- Different types of leave (annual, sick, emergency)
- Leave approval workflow
- Leave balance tracking

### Performance Reviews

- Conduct periodic performance reviews
- Rate different aspects of performance
- Set goals and track progress
- Document strengths and areas for improvement

### Document Management

- Store and manage employee documents
- Track document expiry dates
- Support for various document types
- Document version control

### Advance Payment

- Request and approve advance payments
- Track payment deductions
- Manage payment schedules
- Monitor outstanding advances

## Installation

1. The module is automatically installed with the main application.
2. Run the migrations:
    ```bash
    php artisan migrate
    ```

## Usage

### API Endpoints

#### Employees

- `GET /api/employees` - List all employees
- `POST /api/employees` - Create a new employee
- `GET /api/employees/{id}` - Get employee details
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

#### Salaries

- `GET /api/employees/{id}/salary-history` - Get salary history
- `POST /api/employees/{id}/salary` - Create new salary record

#### Timesheets

- `GET /api/employees/{id}/timesheet-history` - Get timesheet history
- `POST /api/employees/{id}/timesheet` - Create new timesheet

#### Leaves

- `GET /api/employees/{id}/leave-history` - Get leave history
- `POST /api/employees/{id}/leave` - Request leave

#### Performance Reviews

- `GET /api/employees/{id}/performance-reviews` - Get performance reviews
- `POST /api/employees/{id}/performance-review` - Create performance review

#### Documents

- `GET /api/employees/{id}/documents` - Get employee documents
- `POST /api/employees/{id}/documents` - Upload document
- `DELETE /api/employees/{id}/documents/{mediaId}` - Delete document

#### Advances

- `GET /api/employees/{id}/advance-history` - Get advance history
- `POST /api/employees/{id}/advance` - Request advance

## Configuration

The module's configuration can be found in `config/employee.php`. Key settings include:

- File number generation
- Salary calculation parameters
- Overtime rates
- Leave policies
- Document management settings

## Dependencies

- Laravel Framework
- Spatie Media Library
- Laravel Sanctum (for API authentication)

## Contributing

Please follow the project's coding standards and submit pull requests for any improvements.

## License

This module is part of the SND Rental application and is subject to its license terms.
