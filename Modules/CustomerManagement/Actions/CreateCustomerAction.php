<?php

namespace Modules\CustomerManagement\Actions;

use Modules\CustomerManagement\Domain\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\UploadedFile;
use Spatie\Activitylog\Facades\LogBatch;

class CreateCustomerAction
{
    /**
     * Execute the action to create a new customer.
     *
     * @param array $data
     * @param array|null $documents
     * @return Customer;
     */
    public function execute(array $data, ?array $documents = null): Customer
    {
        return DB::transaction(function () use ($data, $documents) {
            // Start activity log batch
            LogBatch::startBatch();

            // Ensure payment terms is a valid value
            $validPaymentTerms = [15, 30, 45, 60];
            $paymentTerms = intval($data['payment_terms'] ?? 30);
            if (!in_array($paymentTerms, $validPaymentTerms)) {
                $paymentTerms = 30; // Default to 30 days if invalid
            }

            // Create the customer
            $customer = Customer::create([
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


