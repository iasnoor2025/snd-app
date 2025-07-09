<?php

namespace Modules\CustomerManagement\Actions;

use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\CustomerManagement\Services\ERPNextClient;
use Illuminate\Support\Facades\Log;

class SyncCustomersFromERPNextAction
{
    public function execute(): int
    {
        $client = app(ERPNextClient::class);
        $erpCustomers = $client->fetchAllCustomers();
        $count = 0;
        foreach ($erpCustomers as $erpCustomer) {
            $data = $client->mapToLocal($erpCustomer);
            // Fallback: if company_name is missing, use ERPNext 'name' field
            if (empty($data['company_name']) && isset($erpCustomer['name'])) {
                $data['company_name'] = $erpCustomer['name'];
                $data['name'] = $erpCustomer['name'];
            }
            // Always set erpnext_id from ERPNext 'name' field
            $data['erpnext_id'] = $erpCustomer['name'] ?? null;
            if (empty($data['erpnext_id'])) {
                continue;
            }
            Customer::updateOrCreate(
                ['erpnext_id' => $data['erpnext_id']],
                $data
            );
            $count++;
        }
        Log::info("ERPNext Customer Sync: {$count} customers processed.");
        return $count;
    }
}
