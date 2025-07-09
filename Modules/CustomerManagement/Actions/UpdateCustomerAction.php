<?php

namespace Modules\CustomerManagement\Actions;

use Modules\CustomerManagement\Domain\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Spatie\Activitylog\Facades\LogBatch;
use Modules\CustomerManagement\Services\ERPNextClient;

class UpdateCustomerAction
{
    /**
     * Execute the action to update a customer.
     *
     * @param Customer $customer
     * @param array $data
     * @param array|null $documents
     * @return Customer;
     */
    public function execute(Customer $customer, array $data, ?array $documents = null): Customer
    {
        return DB::transaction(function () use ($customer, $data, $documents) {
            // Start activity log batch
            LogBatch::startBatch();

            // Ensure payment terms is a valid value
            $validPaymentTerms = [15, 30, 45, 60];
            $paymentTerms = intval($data['payment_terms'] ?? 30);
            if (!in_array($paymentTerms, $validPaymentTerms)) {
                $paymentTerms = 30; // Default to 30 days if invalid
            }

            // Update the customer
            $customer->update([
                'company_name' => $data['company_name'],
                'contact_person' => $data['contact_person'],
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'],
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'postal_code' => $data['postal_code'] ?? null,
                'country' => $data['country'] ?? null,
                'tax_number' => $data['tax_number'] ?? null,
                'credit_limit' => $data['credit_limit'] ?? null,
                'payment_terms' => $paymentTerms,
                'notes' => $data['notes'] ?? null,
                'is_active' => $data['is_active'] ?? true
            ]);

            // Sync to ERPNext
            $erp = app(ERPNextClient::class);
            $erpResponse = $erp->createOrUpdateCustomerInERPNext($customer->toArray());
            \Log::info('ERPNext update customer response', ['response' => $erpResponse]);

            // Add documents if provided
            if ($documents && count($documents) > 0) {
                foreach ($documents as $index => $document) {
                    if ($document instanceof UploadedFile) {
                        $customer->addMedia($document)
                            ->usingName($data['document_names'][$index] ?? $document->getClientOriginalName())
                            ->toMediaCollection('documents');
                    }
                }
            }

            // End activity log batch
            LogBatch::endBatch();

            return $customer;
        });
    }
}



