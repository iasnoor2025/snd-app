<?php
namespace Modules\RentalManagement\Http\Controllers;

/**
 * This is a symlink controller to maintain backward compatibility
 * after moving to modular architecture (now extends PayrollManagement)
 */
class AdvancePaymentController extends \Modules\EmployeeManagement\Http\Controllers\AdvancePaymentController
{
    // This is a symlink class that extends the real controller from the module
    // No additional code needed
}
