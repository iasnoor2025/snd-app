<?php

namespace Modules\SafetyManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TrainingRecordUser extends Model
{
    use HasFactory;

    protected $table = 'training_record_user';
    protected $fillable = ['training_record_id', 'user_id'];
}
