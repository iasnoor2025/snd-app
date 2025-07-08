<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // Create roles
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web']);
        $manager = Role::firstOrCreate(['name' => 'manager', 'guard_name' => 'web']);
        $employee = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'web']);
        $customer = Role::firstOrCreate(['name' => 'customer', 'guard_name' => 'web']);
        $technician = Role::firstOrCreate(['name' => 'technician', 'guard_name' => 'web']);
        $accountant = Role::firstOrCreate(['name' => 'accountant', 'guard_name' => 'web']);
        $hr = Role::firstOrCreate(['name' => 'hr', 'guard_name' => 'web']);
        $supervisor = Role::firstOrCreate(['name' => 'supervisor', 'guard_name' => 'web']);
        $user = Role::firstOrCreate(['name' => 'user', 'guard_name' => 'web']);

        // Admin gets all permissions
        $admin->syncPermissions(Permission::all());

        // Manager permissions
        $managerPermissions = [
            'dashboard.view',
            'users.view', 'users.create', 'users.edit',
            'employees.view', 'employees.create', 'employees.edit',
            'customers.view', 'customers.create', 'customers.edit',
            'rentals.view', 'rentals.create', 'rentals.edit', 'rentals.approve',
            'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.approve',
            'reports.view', 'reports.build',
            'timesheets.view', 'timesheets.edit',
            'leave-requests.view', 'leave-requests.approve',
            'payroll.view',
        ];
        $manager->syncPermissions($managerPermissions);

        // Employee permissions
        $employeePermissions = [
            'dashboard.view',
            'timesheets.view', 'timesheets.create', 'timesheets.edit',
            'leave-requests.view', 'leave-requests.create',
            'rentals.view',
        ];
        $employee->syncPermissions($employeePermissions);

        // Customer permissions
        $customerPermissions = [
            'dashboard.view',
            'rentals.view',
            'quotations.view',
            'invoices.view',
        ];
        $customer->syncPermissions($customerPermissions);

        // Technician permissions
        $technicianPermissions = [
            'dashboard.view',
            'maintenance.view', 'maintenance.create', 'maintenance.edit',
            'timesheets.view', 'timesheets.create', 'timesheets.edit',
            'rentals.view',
        ];
        $technician->syncPermissions($technicianPermissions);

        // Accountant permissions
        $accountantPermissions = [
            'dashboard.view',
            'payments.view', 'payments.create', 'payments.edit',
            'invoices.view', 'invoices.create', 'invoices.edit',
            'quotations.view', 'quotations.create', 'quotations.edit', 'quotations.approve',
            'payroll.view', 'payroll.create', 'payroll.edit',
            'reports.view', 'reports.build',
        ];
        $accountant->syncPermissions($accountantPermissions);

        // HR permissions
        $hrPermissions = [
            'dashboard.view',
            'employees.view', 'employees.create', 'employees.edit',
            'leave-requests.view', 'leave-requests.approve',
            'leave-types.view', 'leave-types.create', 'leave-types.edit',
            'payroll.view',
            'timesheets.view',
        ];
        $hr->syncPermissions($hrPermissions);

        // Supervisor permissions
        $supervisorPermissions = [
            'dashboard.view',
            'employees.view',
            'timesheets.view', 'timesheets.edit',
            'leave-requests.view', 'leave-requests.approve',
            'rentals.view', 'rentals.edit',
            'tasks.view', 'tasks.create', 'tasks.edit',
        ];
        $supervisor->syncPermissions($supervisorPermissions);

        // User permissions (default role for new registrations)
        $userPermissions = [
            'dashboard.view',
        ];
        $user->syncPermissions($userPermissions);
    }
}
