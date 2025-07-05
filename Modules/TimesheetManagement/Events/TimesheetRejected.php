<?php

namespace Modules\TimesheetManagement\Events;

use Illuminate\Queue\SerializesModels;

class TimesheetRejected
{
    use SerializesModels;
    /**
     * The timesheet instance.
     *
     * @var \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet
     */
    public $timesheet;

    /**
     * Create a new event instance.
     *
     * @param  \Modules\TimesheetManagement\Domain\Models\WeeklyTimesheet  $timesheet
     * @return void;
     */
    public function __construct(WeeklyTimesheet $timesheet)
    {
        $this->timesheet = $timesheet;
    }

    /**
     * Get the channels the event should be broadcast on.
     *
     * @return array;
     */
    public function broadcastOn()
    {
        return [];
    }
}


