<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Designation extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'description',
        'is_active',
        'department_id',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * The attributes that are translatable.
     *
     * @var array
     */
    public $translatable = ['name', 'description'];

    /**
     * Get the employees in this position
     */
    public function employees()
    {
        return $this->hasMany(Employee::class);
    }
}





