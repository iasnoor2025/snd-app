<?php

namespace Modules\RentalManagement\Actions;

use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\RentalExtension;
use Illuminate\Support\Facades\DB;

class RequestExtensionAction
{
    public function execute(Rental $rental, array $data, int $userId): RentalExtension
    {
        return DB::transaction(function () use ($rental, $data, $userId) {
            $extension = $rental->extensionRequests()->create(array_merge($data, [
                'requested_by' => $userId,
                'status' => 'pending',
            ]));
            $rental->update(['status' => 'extension_requested']);
            return $extension;
        });
    }
}
