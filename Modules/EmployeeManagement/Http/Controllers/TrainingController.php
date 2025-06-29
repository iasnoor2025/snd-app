<?php

namespace Modules\EmployeeManagement\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\EmployeeManagement\Services\TrainingService;
use Modules\EmployeeManagement\Domain\Models\Training;
use Modules\EmployeeManagement\Domain\Models\Employee;

class TrainingController extends Controller
{
    public function __construct(private TrainingService $trainingService) {}

    public function index()
    {
        return response()->json([
            'data' => $this->trainingService->getAllTrainings(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string',
            'certificate_url' => 'nullable|string',
        ]);
        $training = $this->trainingService->createTraining($data);
        return response()->json(['message' => 'Training created', 'data' => $training]);
    }

    public function update(Request $request, Training $training)
    {
        $data = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'location' => 'nullable|string',
            'certificate_url' => 'nullable|string',
        ]);
        $updated = $this->trainingService->updateTraining($training, $data);
        return response()->json(['message' => 'Training updated', 'data' => $updated]);
    }

    public function destroy(Training $training)
    {
        $this->trainingService->deleteTraining($training);
        return response()->json(['message' => 'Training deleted']);
    }

    public function assign(Request $request, Training $training)
    {
        $data = $request->validate([
            'employee_id' => 'required|exists:employees,id',
            'status' => 'nullable|in:assigned,in_progress,completed',
        ]);
        $employee = Employee::findOrFail($data['employee_id']);
        $this->trainingService->assignEmployee($training, $employee, $data['status'] ?? 'assigned');
        return response()->json(['message' => 'Employee assigned']);
    }

    public function markCompleted(Request $request, Training $training, Employee $employee)
    {
        $data = $request->validate([
            'certificate_url' => 'nullable|string',
        ]);
        $this->trainingService->markCompleted($training, $employee, $data['certificate_url'] ?? null);
        return response()->json(['message' => 'Training marked as completed']);
    }

    public function employeeTrainings(Employee $employee)
    {
        return response()->json([
            'data' => $this->trainingService->getEmployeeTrainings($employee),
        ]);
    }
}
