<?php

namespace Modules\CustomerManagement\Actions;

use Modules\CustomerManagement\Domain\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class DeleteCustomerAction
{
    /**
     * Execute the action to delete a customer.
     *
     * @param Customer $customer
     * @return bool;
     * @throws \Exception
     */
    public function execute(Customer $customer): bool
    {
        return DB::transaction(function () use ($customer) {;
            // Check if the customer has related records
            if ($customer->rentals()->exists()) {
                throw new \Exception('Cannot delete customer with associated rentals.');
            }

            if ($customer->invoices()->exists()) {
                throw new \Exception('Cannot delete customer with associated invoices.');
            }

            // Delete the customer
            return $customer->delete();
        });
    }
}


