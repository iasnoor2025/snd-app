<?php
namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Modules\EmployeeManagement\Domain\Models\Employee;
use Illuminate\Support\Facades\Log;

class EmployeeNumberController extends Controller
{
    /**
     * Check if an employee file number already exists
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse;
     */
    public function checkFileNumber(Request $request)
    {
        try {
            $fileNumber = $request->input('file_number');

            Log::info('Checking employee file number', [
                'file_number' => $fileNumber
            ]);

            if (empty($fileNumber)) {
                return response()->json([
                    'exists' => false,
                    'message' => 'No file number provided'
                ]);
            }

            $exists = Employee::where('employee_file_number', $fileNumber)->exists();

            return response()->json([
                'exists' => $exists,
                'message' => $exists ? 'Employee file number already exists' : 'Employee file number is available'
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking employee file number', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'error' => 'An error occurred while checking the employee file number',
                'message' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Generate a guaranteed unique employee file number
     *
     * @return \Illuminate\Http\JsonResponse;
     */
    public function generateUniqueFileNumber()
    {
        try {
            // Simple approach without transaction to avoid potential issues
            $lastEmployee = Employee::orderBy('employee_file_number', 'desc')->first();

            // Log what we found
            Log::info('Found last employee', [
                'employee_id' => $lastEmployee ? $lastEmployee->id : 'none',
                'file_number' => $lastEmployee ? $lastEmployee->employee_file_number : 'none'
            ]);

            $lastNumber = 0;
            if ($lastEmployee && $lastEmployee->employee_file_number) {
                if (preg_match('/^EMP-(\d{4})$/', $lastEmployee->employee_file_number, $matches)) {
                    $lastNumber = (int) $matches[1];
                    Log::info('Extracted last number', ['number' => $lastNumber]);
                } else {
                    Log::warning('Employee file number does not match expected format', [
                        'file_number' => $lastEmployee->employee_file_number
                    ]);
                }
            }

            $nextNumber = $lastNumber + 1;
            $newFileNumber = 'EMP-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);

            // Ensure it's truly unique
            $attempt = 1;
            $maxAttempts = 10; // Prevent infinite loop

            while (Employee::where('employee_file_number', $newFileNumber)->exists() && $attempt <= $maxAttempts) {
                Log::info('File number already exists, incrementing', [
                    'attempt' => $attempt,
                    'current_number' => $nextNumber,
                    'file_number' => $newFileNumber
                ]);

                $nextNumber++;
                $newFileNumber = 'EMP-' . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
                $attempt++;
            }

            if ($attempt > $maxAttempts) {
                Log::error('Failed to generate unique file number after max attempts');
                return response()->json([
                    'error' => 'Failed to generate a unique file number after multiple attempts',
                ], 500);
            }

            Log::info('Generated unique employee file number', [
                'file_number' => $newFileNumber,
                'number' => $nextNumber
            ]);

            return response()->json([
                'file_number' => $newFileNumber,
                'lastFileNumber' => $nextNumber - 1 // Return last number for compatibility
            ]);
        } catch (\Exception $e) {
            Log::error('Error generating unique employee file number', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return response()->json([
                'error' => 'An error occurred while generating the employee file number',
                'message' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }
}


