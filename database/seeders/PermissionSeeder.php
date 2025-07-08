<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\File;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissionNames = collect();
        $directories = [base_path('app'), base_path('Modules'), base_path('routes')];

        foreach ($directories as $dir) {
            if (!is_dir($dir)) continue;
            $files = File::allFiles($dir);
            foreach ($files as $file) {
                if ($file->getExtension() !== 'php') continue;
                $contents = File::get($file->getPathname());
                preg_match_all('/permission:([\w.-]+)/', $contents, $matches1);
                preg_match_all('/Permission::create\(\[\'name\' => \'([\w.-]+)\'/', $contents, $matches2);
                $permissionNames = $permissionNames->merge($matches1[1])->merge($matches2[1]);
            }
        }

        // Master list of all required permissions (resource.action format only)
        $masterPermissions = [
            // Dashboard
            'dashboard.view',
            // Users
            'users.view', 'users.create', 'users.edit', 'users.delete',
            // Roles
            'roles.view', 'roles.create', 'roles.edit', 'roles.delete',
            // Permissions
            'permissions.view', 'permissions.create', 'permissions.edit', 'permissions.delete',
            // Employees
            'employees.view', 'employees.create', 'employees.edit', 'employees.delete',
            // Add the custom permission for policy
            'view-employee',
            // Maintenance
            'maintenance.view', 'maintenance.create', 'maintenance.edit', 'maintenance.delete',
            // Technicians
            'technicians.view', 'technicians.create', 'technicians.edit', 'technicians.delete',
            // Reports
            'reports.view', 'reports.build', 'reports.delete',
            // Rentals
            'rentals.view', 'rentals.create', 'rentals.edit', 'rentals.delete', 'rentals.approve',
            // Rental Items
            'rentals.items.view', 'rentals.items.create', 'rentals.items.edit', 'rentals.items.delete',
            // Payments
            'payments.view', 'payments.create', 'payments.edit', 'payments.delete',
            // Invoices
            'invoices.view', 'invoices.create', 'invoices.edit', 'invoices.delete',
            // Quotations
            'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.delete', 'quotations.approve',
            // Customers
            'customers.view', 'customers.create', 'customers.edit', 'customers.delete',
            // Suppliers
            'suppliers.view', 'suppliers.create', 'suppliers.edit', 'suppliers.delete',
            // Timesheets
            'timesheets.view', 'timesheets.create', 'timesheets.edit', 'timesheets.delete',
            // Timesheet Approvals
            'timesheets.approve', 'timesheets.approve.foreman', 'timesheets.approve.incharge', 'timesheets.approve.checking', 'timesheets.approve.manager',
            // Tasks
            'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
            // Manpower
            'manpower.view', 'manpower.create', 'manpower.edit', 'manpower.delete',
            // Material
            'material.view', 'material.create', 'material.edit', 'material.delete',
            // Fuel
            'fuel.view', 'fuel.create', 'fuel.edit', 'fuel.delete',
            // Expense
            'expense.view', 'expense.create', 'expense.edit', 'expense.delete',
            // Payroll
            'payroll.view', 'payroll.create', 'payroll.edit', 'payroll.delete',
            // Tax Documentation
            'tax-documentation.view', 'tax-documentation.create', 'tax-documentation.edit', 'tax-documentation.delete',
            // Salary Advances
            'salary-advances.view', 'salary-advances.create', 'salary-advances.edit', 'salary-advances.delete',
            // Salary Increments
            'salary-increments.view', 'salary-increments.create', 'salary-increments.edit', 'salary-increments.delete', 'salary-increments.approve', 'salary-increments.apply',
            // Final Settlements
            'final-settlements.view', 'final-settlements.create', 'final-settlements.edit', 'final-settlements.delete', 'final-settlements.approve',
            // Advances
            'advances.view', 'advances.create', 'advances.edit', 'advances.delete', 'advances.approve',
            // Rental Timesheets
            'rental-timesheets.view', 'rental-timesheets.create', 'rental-timesheets.edit', 'rental-timesheets.delete',
            // Leave Management
            'leave-requests.view', 'leave-requests.create', 'leave-requests.edit', 'leave-requests.delete', 'leave-requests.approve',
            'leave-approvals.view', 'leave-approvals.edit',
            'leave-balances.view',
            'leave-types.view', 'leave-types.create', 'leave-types.edit', 'leave-types.delete',
            'leave-reports.view', 'leave-reports.export',
            'leave-settings.view', 'leave-settings.edit',
            'approve-leave-requests'
        ];

        // Remove any permissions not in resource.action format
        $permissionNames = $permissionNames->merge($masterPermissions)
            ->unique()
            ->filter(function ($name) {
                return preg_match('/^[a-z0-9-]+(\.[a-z0-9-]+)+$/', $name);
            });

        foreach ($permissionNames as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }
    }
}
