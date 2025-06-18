<?php

namespace Modules\LeaveManagement\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * The module name.
     *
     * @var string
     */
    protected $moduleName = 'LeaveManagement';

    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        'Modules\LeaveManagement\Events\LeaveRequested' => [
            'Modules\LeaveManagement\Listeners\NotifyHRDepartment',
            'Modules\LeaveManagement\Listeners\NotifySupervisor',
        ],
        'Modules\LeaveManagement\Events\LeaveApproved' => [
            'Modules\LeaveManagement\Listeners\NotifyEmployee',
            'Modules\LeaveManagement\Listeners\UpdateLeaveBalance',
        ],
        'Modules\LeaveManagement\Events\LeaveRejected' => [
            'Modules\LeaveManagement\Listeners\NotifyEmployeeRejection'
        ]
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();
    }
}




