<?php

namespace Modules\ProjectManagement\Observers;

use Modules\ProjectManagement\Domain\Models\Task;
use Illuminate\Support\Facades\Log;

class TaskObserver
{
    /**
     * Handle the Task "created" event.
     *
     * @param  \Modules\ProjectManagement\Domain\Models\Task  $task
     * @return void;
     */
    public function created(Task $task)
    {
        Log::info('Task created', ['id' => $task->id, 'project_id' => $task->project_id, 'name' => $task->name]);
    }

    /**
     * Handle the Task "updated" event.
     *
     * @param  \Modules\ProjectManagement\Domain\Models\Task  $task
     * @return void;
     */
    public function updated(Task $task)
    {
        Log::info('Task updated', ['id' => $task->id, 'status' => $task->status]);
    }

    /**
     * Handle the Task "deleted" event.
     *
     * @param  \Modules\ProjectManagement\Domain\Models\Task  $task
     * @return void;
     */
    public function deleted(Task $task)
    {
        Log::info('Task deleted', ['id' => $task->id]);
    }

    /**
     * Handle the Task "restored" event.
     *
     * @param  \Modules\ProjectManagement\Domain\Models\Task  $task
     * @return void;
     */
    public function restored(Task $task)
    {
        Log::info('Task restored', ['id' => $task->id]);
    }

    /**
     * Handle the Task "force deleted" event.
     *
     * @param  \Modules\ProjectManagement\Domain\Models\Task  $task
     * @return void;
     */
    public function forceDeleted(Task $task)
    {
        Log::info('Task force deleted', ['id' => $task->id]);
    }
}


