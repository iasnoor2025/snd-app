<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceHistory extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'equipment_id',
        'maintenance_type',
        'description',
        'cost',
        'performed_by',
        'performed_at',
        'next_maintenance_due',
        'status',
        'parts_used',
        'notes',
    ];

    protected $casts = [
        'cost' => 'decimal:2',
        'performed_at' => 'datetime',
        'next_maintenance_due' => 'datetime',
        'parts_used' => 'array',
    ];

    public function equipment()
    {
        return $this->belongsTo(Equipment::class);
    }

    public function technician()
    {
        return $this->belongsTo(User::class, 'performed_by');
    }

    public function scheduleNextMaintenance()
    {
        if ($this->next_maintenance_due) {
            event(new MaintenanceAlert(
                $this->equipment,
                'scheduled',
                "Next maintenance scheduled for {$this->next_maintenance_due->format('Y-m-d')}",
                'info'
            ));
        }
    }

    public function markAsCompleted()
    {
        $this->update(['status' => 'completed']);

        event(new MaintenanceAlert(
            $this->equipment,
            'completed',
            "Maintenance completed: {$this->description}",
            'success'
        ));
    }
}






