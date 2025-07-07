<?php

namespace Modules\RentalManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;

class QuotationHistory extends Model
{
    protected $table = 'quotation_histories';
    protected $fillable = [
        'quotation_id',
        'user_id',
        'action',
        'from_status',
        'to_status',
        'notes',
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }

    public function user()
    {
        return $this->belongsTo(\App\Models\User::class);
    }
}
