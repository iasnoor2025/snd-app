<?php

namespace Modules\LeaveManagement\Database\Seeders;

use Illuminate\Database\Seeder;
use Modules\LeaveManagement\Domain\Models\LeaveType;

class LeaveTypeSeeder extends Seeder
{
    public function run()
    {
        $types = [
            [
                'name' => 'Annual Leave',
                'description' => 'Paid annual leave for vacation and personal time',
                'max_days' => 30,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'allow_carry_forward' => true,
                'carry_forward_max_days' => 10,
                'notice_days' => 7,
                'gender_specific' => 'both',
                'applicable_after_months' => 6,
                'color' => '#4caf50',
            ],
            [
                'name' => 'Sick Leave',
                'description' => 'Paid sick leave for medical reasons',
                'max_days' => 15,
                'requires_approval' => false,
                'is_paid' => true,
                'is_active' => true,
                'allow_carry_forward' => false,
                'carry_forward_max_days' => 0,
                'notice_days' => 0,
                'gender_specific' => 'both',
                'applicable_after_months' => 0,
                'color' => '#f44336',
            ],
            [
                'name' => 'Maternity Leave',
                'description' => 'Paid maternity leave for new mothers',
                'max_days' => 120,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'allow_carry_forward' => false,
                'carry_forward_max_days' => 0,
                'notice_days' => 30,
                'gender_specific' => 'female',
                'applicable_after_months' => 12,
                'color' => '#e91e63',
            ],
            [
                'name' => 'Paternity Leave',
                'description' => 'Paid paternity leave for new fathers',
                'max_days' => 14,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'allow_carry_forward' => false,
                'carry_forward_max_days' => 0,
                'notice_days' => 30,
                'gender_specific' => 'male',
                'applicable_after_months' => 12,
                'color' => '#2196f3',
            ],
            [
                'name' => 'Emergency Leave',
                'description' => 'Unpaid emergency leave for urgent situations',
                'max_days' => 5,
                'requires_approval' => true,
                'is_paid' => false,
                'is_active' => true,
                'allow_carry_forward' => false,
                'carry_forward_max_days' => 0,
                'notice_days' => 0,
                'gender_specific' => 'both',
                'applicable_after_months' => 0,
                'color' => '#ff9800',
            ],
        ];

        foreach ($types as $data) {
            LeaveType::updateOrCreate([
                'name' => $data['name'],
            ], $data);
        }
    }
}
