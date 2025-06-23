<?php

namespace Modules\EmployeeManagement\Domain\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Translatable\HasTranslations;

class Position extends Model
{
    use HasFactory, HasTranslations;

    protected $fillable = [
        'name',
        'description',
        'active',
    ];

    protected $casts = [
        'active' => 'boolean',
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





