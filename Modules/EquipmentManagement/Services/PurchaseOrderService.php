<?php

namespace Modules\EquipmentManagement\Services;

use Modules\EquipmentManagement\Domain\Models\PurchaseOrder;

class PurchaseOrderService
{
    public function getAllOrders()
    {
        return PurchaseOrder::with(['supplier', 'equipment'])->orderByDesc('order_date')->get();
    }

    public function createOrder(array $data): PurchaseOrder
    {
        return PurchaseOrder::create($data);
    }

    public function updateOrder(PurchaseOrder $order, array $data): PurchaseOrder
    {
        $order->update($data);
        return $order->fresh();
    }

    public function deleteOrder(PurchaseOrder $order): void
    {
        $order->delete();
    }
}
