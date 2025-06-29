<?php

namespace Modules\RentalManagement\Console\Commands;

use Illuminate\Console\Command;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\Customer;
use Illuminate\Support\Facades\Notification;
use Modules\RentalManagement\Notifications\AutomatedFollowUpNotification;
use Carbon\Carbon;

class SendAutomatedFollowUps extends Command
{
    protected $signature = 'rental:send-followups';
    protected $description = 'Send automated follow-up notifications to customers after rental completion or inactivity';

    public function handle(): void
    {
        $this->info('Sending automated follow-ups...');
        $completedRentals = Rental::where('status', 'completed')
            ->whereDate('end_date', '<=', Carbon::now()->subDays(3))
            ->whereNull('followup_sent_at')
            ->get();

        foreach ($completedRentals as $rental) {
            $customer = $rental->customer;
            if ($customer) {
                Notification::send($customer, new AutomatedFollowUpNotification($rental));
                $rental->update(['followup_sent_at' => now()]);
                $this->info("Follow-up sent to customer ID {$customer->id} for rental ID {$rental->id}");
            }
        }
        $this->info('Automated follow-ups completed.');
    }
}
