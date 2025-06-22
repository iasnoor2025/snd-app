<?php

require_once 'vendor/autoload.php';

$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Checking Timesheet System...\n";
echo "============================\n\n";

try {
    // Check admin user and permissions
    $adminUser = \App\Models\User::where('email', 'admin@ias.com')->first();
    
    if (!$adminUser) {
        echo "❌ Admin user not found\n";
        exit(1);
    }
    
    echo "✅ Admin user found: {$adminUser->email}\n";
    
    // Check timesheet permissions
    $timesheetPermissions = $adminUser->getAllPermissions()
        ->filter(function($p) { return str_contains($p->name, 'timesheet'); })
        ->pluck('name')
        ->toArray();
    
    echo "📋 Timesheet permissions (" . count($timesheetPermissions) . "):\n";
    foreach ($timesheetPermissions as $perm) {
        echo "  - {$perm}\n";
    }
    
    // Check if user can access timesheet routes
    $canView = $adminUser->can('timesheets.view');
    $canEdit = $adminUser->can('timesheets.edit');
    $canCreate = $adminUser->can('timesheets.create');
    $canDelete = $adminUser->can('timesheets.delete');
    
    echo "\n🔐 Permission checks:\n";
    echo "  - timesheets.view: " . ($canView ? "✅ Yes" : "❌ No") . "\n";
    echo "  - timesheets.edit: " . ($canEdit ? "✅ Yes" : "❌ No") . "\n";
    echo "  - timesheets.create: " . ($canCreate ? "✅ Yes" : "❌ No") . "\n";
    echo "  - timesheets.delete: " . ($canDelete ? "✅ Yes" : "❌ No") . "\n";
    
    // Check timesheet data
    $timesheetCount = \Modules\TimesheetManagement\Domain\Models\Timesheet::count();
    echo "\n📊 Database:\n";
    echo "  - Total timesheets: {$timesheetCount}\n";
    
    if ($timesheetCount > 0) {
        $timesheet = \Modules\TimesheetManagement\Domain\Models\Timesheet::with(['employee', 'project'])->first();
        echo "  - First timesheet ID: {$timesheet->id}\n";
        echo "  - Employee: " . ($timesheet->employee ? $timesheet->employee->first_name . ' ' . $timesheet->employee->last_name : 'N/A') . "\n";
        echo "  - Status: {$timesheet->status}\n";
        echo "  - Date: {$timesheet->date}\n";
        echo "  - Hours: {$timesheet->hours_worked}\n";
        
        // Test approval workflow
        echo "\n🔄 Approval System Check:\n";
        echo "  - Current status: {$timesheet->status}\n";
        echo "  - Can be edited: " . ($timesheet->canBeEdited() ? "✅ Yes" : "❌ No") . "\n";
        echo "  - Can be submitted: " . ($timesheet->canBeSubmitted() ? "✅ Yes" : "❌ No") . "\n";
        echo "  - Current approval step: " . $timesheet->getCurrentApprovalStep() . "\n";
        echo "  - Approval progress: " . $timesheet->getApprovalProgressPercentage() . "%\n";
        echo "  - Stage description: " . $timesheet->getApprovalStageDescription() . "\n";
        
        // Check approval methods
        echo "\n👥 Approval Methods Available:\n";
        echo "  - approveByForeman: " . (method_exists($timesheet, 'approveByForeman') ? "✅" : "❌") . "\n";
        echo "  - approveByIncharge: " . (method_exists($timesheet, 'approveByIncharge') ? "✅" : "❌") . "\n";
        echo "  - approveByChecking: " . (method_exists($timesheet, 'approveByChecking') ? "✅" : "❌") . "\n";
        echo "  - approveByManager: " . (method_exists($timesheet, 'approveByManager') ? "✅" : "❌") . "\n";
        echo "  - reject: " . (method_exists($timesheet, 'reject') ? "✅" : "❌") . "\n";
    }
    
    // Check if React components exist
    echo "\n📁 Frontend Components:\n";
    $showComponent = file_exists('Modules/TimesheetManagement/resources/js/pages/Timesheets/Show.tsx');
    $editComponent = file_exists('Modules/TimesheetManagement/resources/js/pages/Timesheets/Edit.tsx');
    $indexComponent = file_exists('Modules/TimesheetManagement/resources/js/pages/Timesheets/Index.tsx');
    
    echo "  - Show.tsx: " . ($showComponent ? "✅ Exists" : "❌ Missing") . "\n";
    echo "  - Edit.tsx: " . ($editComponent ? "✅ Exists" : "❌ Missing") . "\n";
    echo "  - Index.tsx: " . ($indexComponent ? "✅ Exists" : "❌ Missing") . "\n";
    
    // Check controller methods
    echo "\n🎮 Controller Methods:\n";
    $controller = new \Modules\TimesheetManagement\Http\Controllers\TimesheetController(
        new \Modules\TimesheetManagement\Services\GeofencingService()
    );
    
    echo "  - show method: " . (method_exists($controller, 'show') ? "✅ Exists" : "❌ Missing") . "\n";
    echo "  - edit method: " . (method_exists($controller, 'edit') ? "✅ Exists" : "❌ Missing") . "\n";
    echo "  - update method: " . (method_exists($controller, 'update') ? "✅ Exists" : "❌ Missing") . "\n";
    echo "  - index method: " . (method_exists($controller, 'index') ? "✅ Exists" : "❌ Missing") . "\n";
    
    echo "\n✅ System Check Complete!\n";
    
    if (!$canView || !$canEdit) {
        echo "\n⚠️  WARNING: Admin user missing timesheet permissions!\n";
        echo "Run: php artisan user:assign-permissions admin@ias.com\n";
    }
    
} catch (Exception $e) {
    echo "💥 Error: {$e->getMessage()}\n";
    echo "File: {$e->getFile()}:{$e->getLine()}\n";
} 