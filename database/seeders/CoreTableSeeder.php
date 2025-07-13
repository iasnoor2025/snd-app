<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class CoreTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create departments table if it doesn't exist
        if (!Schema::hasTable('departments')) {
            Schema::create('departments', function ($table) {
                $table->id();
                $table->string('name');
                $table->string('code')->nullable();
                $table->text('description')->nullable();
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->softDeletes();
            });

            // Seed departments
            DB::table('departments')->insert([
                ['name' => 'Administration', 'code' => 'ADMIN', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Engineering', 'code' => 'ENG', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Operations', 'code' => 'OPS', 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Sales', 'code' => 'SALES', 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Create designations table if it doesn't exist
        if (!Schema::hasTable('designations')) {
            Schema::create('designations', function ($table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('department_id');
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->softDeletes();
                $table->foreign('department_id')->references('id')->on('departments');
            });

            // Seed designations
            DB::table('designations')->insert([
                ['name' => 'Manager', 'department_id' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Engineer', 'department_id' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Technician', 'department_id' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Sales Representative', 'department_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Seed roles using Spatie Permission
        $roles = [
            ['name' => 'admin', 'guard_name' => 'web'],
            ['name' => 'manager', 'guard_name' => 'web'],
            ['name' => 'employee', 'guard_name' => 'web'],
            ['name' => 'customer', 'guard_name' => 'web'],
            ['name' => 'technician', 'guard_name' => 'web'],
            ['name' => 'accountant', 'guard_name' => 'web'],
            ['name' => 'hr', 'guard_name' => 'web'],
            ['name' => 'supervisor', 'guard_name' => 'web'],
            ['name' => 'user', 'guard_name' => 'web'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }

        // Create basic permissions
        $permissions = [
            'dashboard.view',
            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'reports.view',
            'reports.build',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Assign permissions to admin role
        $adminRole = Role::where('name', 'admin')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo(Permission::all());
        }
    }
}
