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
                'name' => 'annual',
                'description' => 'Paid annual leave for vacation and personal time',
                'days_allowed' => 30,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'color_code' => '#4caf50',
                'applies_to_gender' => null,
            ],
            [
                'name' => 'sick',
                'description' => 'Paid sick leave for medical reasons',
                'days_allowed' => 15,
                'requires_approval' => false,
                'is_paid' => true,
                'is_active' => true,
                'color_code' => '#f44336',
                'applies_to_gender' => null,
            ],
            [
                'name' => 'maternity',
                'description' => 'Paid maternity leave for new mothers',
                'days_allowed' => 120,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'color_code' => '#e91e63',
                'applies_to_gender' => 'female',
            ],
            [
                'name' => 'paternity',
                'description' => 'Paid paternity leave for new fathers',
                'days_allowed' => 14,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'color_code' => '#2196f3',
                'applies_to_gender' => 'male',
            ],
            [
                'name' => 'unpaid',
                'description' => 'Unpaid leave for emergencies or other reasons',
                'days_allowed' => null,
                'requires_approval' => true,
                'is_paid' => false,
                'is_active' => true,
                'color_code' => '#ff9800',
                'applies_to_gender' => null,
            ],
            [
                'name' => 'personal',
                'description' => 'Personal leave for non-medical, non-vacation reasons',
                'days_allowed' => 30,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'color_code' => '#9c27b0',
                'applies_to_gender' => null,
            ],
            [
                'name' => 'hajj',
                'description' => 'Leave for Hajj pilgrimage',
                'days_allowed' => 15,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'color_code' => '#795548',
                'applies_to_gender' => null,
            ],
            [
                'name' => 'umrah',
                'description' => 'Leave for Umrah pilgrimage',
                'days_allowed' => 10,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'color_code' => '#607d8b',
                'applies_to_gender' => null,
            ],
            [
                'name' => 'other',
                'description' => 'Other types of leave',
                'days_allowed' => 3,
                'requires_approval' => true,
                'is_paid' => false,
                'is_active' => true,
                'color_code' => '#cddc39',
                'applies_to_gender' => null,
            ],
            [
                'name' => 'vacation',
                'description' => 'Vacation leave',
                'days_allowed' => 100,
                'requires_approval' => true,
                'is_paid' => true,
                'is_active' => true,
                'color_code' => '#cddc39',
                'applies_to_gender' => null,
            ],
        ];

        foreach ($types as $data) {
            LeaveType::updateOrCreate([
                'name' => $data['name'],
            ], $data);
        }
    }
}
