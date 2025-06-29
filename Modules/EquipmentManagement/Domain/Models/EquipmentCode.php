<?php

namespace Modules\EquipmentManagement\Domain\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EquipmentCode extends Model
{
    protected $fillable = [
        'equipment_id',
        'code_type',
        'code_value',
        'is_primary',
        'last_scanned_at',
        'metadata',
    ];

    protected $casts = [
        'is_primary' => 'boolean',
        'last_scanned_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    public function generateQrCode(): string
    {
        // Generate a QR code URL that includes equipment information
        $data = [
            'type' => 'equipment',
            'id' => $this->equipment_id,
            'code' => $this->code_value,
            'timestamp' => now()->timestamp,
        ];

        return route('equipment.scan', ['data' => base64_encode(json_encode($data))]);
    }

    public function generateBarcode(): string
    {
        // Generate a barcode that includes equipment information
        return $this->code_value;
    }

    public function recordScan(): void
    {
        $this->update([
            'last_scanned_at' => now(),
            'metadata' => array_merge($this->metadata ?? [], [
                'last_scan' => [
                    'timestamp' => now()->timestamp,
                    'location' => request()->ip(),
                ],
            ]),
        ]);
    }
} 