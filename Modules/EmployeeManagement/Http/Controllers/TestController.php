<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Schema;

class TestController extends Controller
{
    public function testPositionCreate(Request $request)
    {
        try {
            Log::info('Test position create called', [
                'request_data' => $request->all()
            ]);

            // Try direct DB insertion with error handling
            try {
                // Check if the designations table exists
                if (!Schema::hasTable('designations')) {
                    Log::error('Designations table does not exist');
                    return response()->json(['message' => 'Designations table does not exist'], 500);
                }

                // Get table structure
                $columns = Schema::getColumnListing('designations');
                Log::info('Designations table columns:', $columns);

                // Prepare data based on available columns
                $data = [
                    'name' => $request->input('name', 'Test Designation'),
                    'created_at' => now(),
                    'updated_at' => now()
                ];

                if (in_array('description', $columns)) {
                    $data['description'] = $request->input('description');
                }

                if (in_array('is_active', $columns)) {
                    $data['is_active'] = true;
                } elseif (in_array('active', $columns)) {
                    $data['active'] = true;
                }

                $id = DB::table('designations')->insertGetId($data);

                Log::info('Designation created with ID: ' . $id);
            } catch (\Exception $dbException) {
                Log::error('Database error in position creation', [
                    'error' => $dbException->getMessage(),
                    'trace' => $dbException->getTraceAsString()
                ]);

                return response()->json([
                    'success' => false,
                    'message' => 'Database error in position creation',
                    'error' => $dbException->getMessage()
                ], 500);
            }

            return response()->json([
                'success' => true,
                'message' => 'Position created successfully',
                'id' => $id
            ]);
        } catch (\Exception $e) {
            Log::error('Error in test position create', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create position',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
