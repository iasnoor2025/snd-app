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

        // Create positions table if it doesn't exist
        if (!Schema::hasTable('positions')) {
            Schema::create('positions', function ($table) {
                $table->id();
                $table->string('name');
                $table->text('description')->nullable();
                $table->unsignedBigInteger('department_id');
                $table->boolean('active')->default(true);
                $table->timestamps();
                $table->softDeletes();
                $table->foreign('department_id')->references('id')->on('departments');
            });

            // Seed positions
            DB::table('positions')->insert([
                ['name' => 'Manager', 'department_id' => 1, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Engineer', 'department_id' => 2, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Technician', 'department_id' => 3, 'created_at' => now(), 'updated_at' => now()],
                ['name' => 'Sales Representative', 'department_id' => 4, 'created_at' => now(), 'updated_at' => now()],
            ]);
        }

        // Seed roles using Spatie Permission
        $roles = [
            ['name' => 'Administrator', 'guard_name' => 'web'],
            ['name' => 'Manager', 'guard_name' => 'web'],
            ['name' => 'Employee', 'guard_name' => 'web'],
            ['name' => 'Guest', 'guard_name' => 'web'],
        ];

        foreach ($roles as $role) {
            Role::firstOrCreate(['name' => $role['name']], $role);
        }

        // Create basic permissions
        $permissions = [
            'view-dashboard',
            'manage-users',
            'view-reports',
            'edit-profile',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        // Assign permissions to Administrator role
        $adminRole = Role::where('name', 'Administrator')->first();
        if ($adminRole) {
            $adminRole->givePermissionTo(Permission::all());
        }
    }
}
