<?php

namespace Modules\EquipmentManagement\Services;

use Modules\EquipmentManagement\Domain\Models\Supplier;

class SupplierService
{
    public function getAllSuppliers()
    {
        return Supplier::orderBy('name')->get();
    }

    public function createSupplier(array $data): Supplier
    {
        return Supplier::create($data);
    }

    public function updateSupplier(Supplier $supplier, array $data): Supplier
    {
        $supplier->update($data);
        return $supplier->fresh();
    }

    public function deleteSupplier(Supplier $supplier): void
    {
        $supplier->delete();
    }
}
