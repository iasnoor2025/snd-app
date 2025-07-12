<?php

namespace Modules\SafetyManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PpeCheckEquipment extends Model
{
    use HasFactory;

    protected $table = 'ppe_check_equipment';
    protected $fillable = ['ppe_check_id', 'equipment_id'];
}
