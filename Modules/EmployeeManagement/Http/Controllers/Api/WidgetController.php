<?php

namespace Modules\EmployeeManagement\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Modules\EmployeeManagement\Services\EmployeeService;
use Modules\EmployeeManagement\Services\EmployeeAnalyticsService;

class WidgetController extends Controller
{
    protected $employeeService;
    protected $analyticsService;

    public function __construct(EmployeeService $employeeService, EmployeeAnalyticsService $analyticsService)
    {
        $this->employeeService = $employeeService;
        $this->analyticsService = $analyticsService;
    }

    /**
     * Get employee overview statistics widget.
     */
    public function employeeOverview(Request $request): JsonResponse
    {
        $overview = $this->employeeService->getEmployeeOverview($request->all());

        return response()->json([
            'success' => true,
            'data' => $overview,
            'message' => 'Employee overview retrieved successfully'
        ]);
    }

    /**
     * Get employee attendance widget.
     */
    public function attendanceWidget(Request $request): JsonResponse
    {
        $attendance = $this->analyticsService->getAttendanceWidget($request->all());

        return response()->json([
            'success' => true,
            'data' => $attendance,
            'message' => 'Attendance widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee performance widget.
     */
    public function performanceWidget(Request $request): JsonResponse
    {
        $performance = $this->analyticsService->getPerformanceWidget($request->all());

        return response()->json([
            'success' => true,
            'data' => $performance,
            'message' => 'Performance widget data retrieved successfully'
        ]);
    }

    /**
     * Get recent employee activities widget.
     */
    public function recentActivities(Request $request): JsonResponse
    {
        $activities = $this->employeeService->getRecentActivities($request->all());

        return response()->json([
            'success' => true,
            'data' => $activities,
            'message' => 'Recent activities retrieved successfully'
        ]);
    }

    /**
     * Get employee birthday widget.
     */
    public function birthdayWidget(Request $request): JsonResponse
    {
        $birthdays = $this->employeeService->getUpcomingBirthdays($request->all());

        return response()->json([
            'success' => true,
            'data' => $birthdays,
            'message' => 'Birthday widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee leave balance widget.
     */
    public function leaveBalanceWidget(Request $request): JsonResponse
    {
        $leaveBalance = $this->analyticsService->getLeaveBalanceWidget($request->all());

        return response()->json([
            'success' => true,
            'data' => $leaveBalance,
            'message' => 'Leave balance widget data retrieved successfully'
        ]);
    }

    /**
     * Get department distribution widget.
     */
    public function departmentWidget(Request $request): JsonResponse
    {
        $departments = $this->analyticsService->getDepartmentDistribution($request->all());

        return response()->json([
            'success' => true,
            'data' => $departments,
            'message' => 'Department widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee onboarding widget.
     */
    public function onboardingWidget(Request $request): JsonResponse
    {
        $onboarding = $this->employeeService->getOnboardingStatus($request->all());

        return response()->json([
            'success' => true,
            'data' => $onboarding,
            'message' => 'Onboarding widget data retrieved successfully'
        ]);
    }

    /**
     * Get payroll summary widget.
     */
    public function payrollWidget(Request $request): JsonResponse
    {
        $payroll = $this->analyticsService->getPayrollSummary($request->all());

        return response()->json([
            'success' => true,
            'data' => $payroll,
            'message' => 'Payroll widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee timesheet widget.
     */
    public function timesheetWidget(Request $request): JsonResponse
    {
        $timesheet = $this->analyticsService->getTimesheetWidget($request->all());

        return response()->json([
            'success' => true,
            'data' => $timesheet,
            'message' => 'Timesheet widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee training widget.
     */
    public function trainingWidget(Request $request): JsonResponse
    {
        $training = $this->analyticsService->getTrainingWidget($request->all());

        return response()->json([
            'success' => true,
            'data' => $training,
            'message' => 'Training widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee announcement widget.
     */
    public function announcementWidget(Request $request): JsonResponse
    {
        $announcements = $this->employeeService->getRecentAnnouncements($request->all());

        return response()->json([
            'success' => true,
            'data' => $announcements,
            'message' => 'Announcement widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee headcount trends widget.
     */
    public function headcountTrends(Request $request): JsonResponse
    {
        $trends = $this->analyticsService->getHeadcountTrends($request->all());

        return response()->json([
            'success' => true,
            'data' => $trends,
            'message' => 'Headcount trends retrieved successfully'
        ]);
    }

    /**
     * Get employee satisfaction widget.
     */
    public function satisfactionWidget(Request $request): JsonResponse
    {
        $satisfaction = $this->analyticsService->getEmployeeSatisfaction($request->all());

        return response()->json([
            'success' => true,
            'data' => $satisfaction,
            'message' => 'Employee satisfaction data retrieved successfully'
        ]);
    }

    /**
     * Get employee skills matrix widget.
     */
    public function skillsWidget(Request $request): JsonResponse
    {
        $skills = $this->analyticsService->getSkillsMatrix($request->all());

        return response()->json([
            'success' => true,
            'data' => $skills,
            'message' => 'Skills widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee task completion widget.
     */
    public function taskCompletionWidget(Request $request): JsonResponse
    {
        $tasks = $this->analyticsService->getTaskCompletionWidget($request->all());

        return response()->json([
            'success' => true,
            'data' => $tasks,
            'message' => 'Task completion widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee cost analytics widget.
     */
    public function costAnalyticsWidget(Request $request): JsonResponse
    {
        $costs = $this->analyticsService->getCostAnalytics($request->all());

        return response()->json([
            'success' => true,
            'data' => $costs,
            'message' => 'Cost analytics widget data retrieved successfully'
        ]);
    }

    /**
     * Get employee retention widget.
     */
    public function retentionWidget(Request $request): JsonResponse
    {
        $retention = $this->analyticsService->getRetentionMetrics($request->all());

        return response()->json([
            'success' => true,
            'data' => $retention,
            'message' => 'Retention widget data retrieved successfully'
        ]);
    }

    /**
     * Get custom widget data.
     */
    public function customWidget(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'widget_type' => 'required|string',
            'parameters' => 'nullable|array',
            'date_range' => 'nullable|array',
            'filters' => 'nullable|array'
        ]);

        $data = $this->analyticsService->getCustomWidgetData($validated);

        return response()->json([
            'success' => true,
            'data' => $data,
            'message' => 'Custom widget data retrieved successfully'
        ]);
    }

    /**
     * Get all available widgets for dashboard.
     */
    public function availableWidgets(): JsonResponse
    {
        $widgets = [
            'employee_overview' => 'Employee Overview',
            'attendance' => 'Attendance Summary',
            'performance' => 'Performance Metrics',
            'recent_activities' => 'Recent Activities',
            'birthdays' => 'Upcoming Birthdays',
            'leave_balance' => 'Leave Balance',
            'departments' => 'Department Distribution',
            'onboarding' => 'Onboarding Status',
            'payroll' => 'Payroll Summary',
            'timesheet' => 'Timesheet Summary',
            'training' => 'Training Progress',
            'announcements' => 'Recent Announcements',
            'headcount_trends' => 'Headcount Trends',
            'satisfaction' => 'Employee Satisfaction',
            'skills' => 'Skills Matrix',
            'task_completion' => 'Task Completion',
            'cost_analytics' => 'Cost Analytics',
            'retention' => 'Retention Metrics'
        ];

        return response()->json([
            'success' => true,
            'data' => $widgets,
            'message' => 'Available widgets retrieved successfully'
        ]);
    }

    /**
     * Return all employees (for /employees/all endpoint)
     */
    public function all(Request $request): \Illuminate\Http\JsonResponse
    {
        $employees = $this->employeeService->getAllEmployees();
        return response()->json($employees);
    }
}
