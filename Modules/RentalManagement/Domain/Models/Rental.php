<?php

namespace Modules\RentalManagement\Domain\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Modules\CustomerManagement\Domain\Models\Customer;
use Modules\EquipmentManagement\Domain\Models\Equipment;
use Modules\EquipmentManagement\Domain\Models\MaintenanceRecord;
use Modules\EquipmentManagement\Traits\HasMediaAttachments;
use Modules\RentalManagement\Domain\Models\Enums\RentalStatus;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Modules\EquipmentManagement\Traits\AutoLoadsRelations;
use Modules\RentalManagement\Domain\Models\Quotation;
use Modules\RentalManagement\Domain\Models\QuotationItem;
use Modules\RentalManagement\Domain\Models\RentalExtension;
use Modules\TimesheetManagement\Domain\Models\Timesheet;
use Modules\Core\Domain\Models\User;
use Modules\RentalManagement\Domain\Models\Invoice;

class Rental extends Model implements HasMedia
{
    use HasFactory;
    use SoftDeletes;
    use HasMediaAttachments;
    use LogsActivity, AutoLoadsRelations;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'customer_id',
        'quotation_id',
        'rental_number',
        'start_date',
        'expected_end_date',
        'actual_end_date',
        'mobilization_date',
        'invoice_date',
        'status',
        'payment_status',
        'deposit_amount',
        'payment_terms_days',
        'payment_due_date',
        'total_amount',
        'subtotal',
        'tax_amount',
        'has_timesheet',
        'tax_percentage',
        'discount_percentage',
        'notes',
        'created_by',
        'completed_by',
        'completed_at',
        'approved_by',
        'approved_at',
        'location_id',
        'billing_cycle',
        'has_operators',
        'equipment_id',
        'end_date',
        'invoice_id', // ERPNext invoice reference
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'start_date' => 'date',
        'expected_end_date' => 'date',
        'actual_end_date' => 'date',
        'mobilization_date' => 'datetime',
        'invoice_date' => 'datetime',
        'payment_due_date' => 'date',
        'deposit_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'tax_percentage' => 'decimal:2',
        'discount_percentage' => 'decimal:2',
        'has_timesheet' => 'boolean',
        'completed_at' => 'datetime',
        'approved_at' => 'datetime',
        'status' => 'string',
        'has_operators' => 'boolean',
    ];

    /**
     * The attributes that should be appended.
     *
     * @var array<string, string>
     */
    protected $appends = [
        'duration_days',
        'total_paid',
        'remaining_balance',
        'payment_progress',
        'is_payment_overdue',
        'days_overdue',
        'th_has_operators',
        'th_total_amount'
    ];

    /**
     * Get the customer that owns the rental.
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(\Modules\CustomerManagement\Domain\Models\Customer::class);
    }

    /**
     * Get the client that owns the rental (for backward compatibility).
     */
    public function client(): BelongsTo
    {
        return $this->customer();
    }

    /**
     * Get the quotation associated with this rental.
     */
    public function quotation(): BelongsTo
    {
        return $this->belongsTo(Quotation::class, 'quotation_id');
    }

    /**
     * Get the rental items for the rental.
     */
    public function rentalItems(): HasMany
    {
        return $this->hasMany(RentalItem::class);
    }

    /**
     * Get the invoices for the rental.
     */
    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }

    /**
     * Get the timesheets for the rental.
     */
    public function timesheets(): HasMany
    {
        return $this->hasMany(Timesheet::class);
    }

    /**
     * Get the maintenance records for the rental's equipment.
     */
    public function maintenanceRecords(): HasManyThrough
    {
        return $this->hasManyThrough(
            MaintenanceRecord::class,
            RentalItem::class,
            'rental_id', // Foreign key on RentalItem
            'equipment_id', // Foreign key on MaintenanceRecord
            'id', // Local key on Rental
            'equipment_id' // Local key on RentalItem
        );
    }

    /**
     * Get the equipment associated with the rental through rental items.
     */
    public function equipment(): HasManyThrough
    {
        return $this->hasManyThrough(
            \Modules\EquipmentManagement\Domain\Models\Equipment::class,
            RentalItem::class,
            'rental_id', // Foreign key on RentalItem
            'id', // Foreign key on Equipment
            'id', // Local key on Rental
            'equipment_id' // Local key on RentalItem
        );
    }

    /**
     * Get the user who created the rental.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get the user who completed the rental.
     */
    public function completer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    /**
     * Get the user who approved the rental.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Calculate the duration in days.
     */
    public function getDurationDaysAttribute(): int
    {
        $endDate = $this->actual_end_date ?? $this->expected_end_date;
        return $this->start_date->diffInDays($endDate);
    }

    /**
     * Generate a unique rental number.
     *
     * @return string;
     */
    public static function generateRentalNumber(): string
    {
        $prefix = 'RENT-';
        $year = now()->format('Y');
        $lastRental = self::whereRaw("rental_number LIKE 'RENT-{$year}-%'")->latest()->first();

        $sequence = 1;
        if ($lastRental) {
            $parts = explode('-', $lastRental->rental_number);
            $sequence = intval(end($parts)) + 1;
        }

        return $prefix . $year . '-' . str_pad($sequence, 5, '0', STR_PAD_LEFT);
    }

    /**
     * Check if the rental is overdue.
     */
    public function isOverdue(): bool
    {
        if ($this->status === 'completed') {
            return false;
        }

        if ($this->status === 'active' && $this->expected_end_date < now() && !$this->actual_end_date) {
            return true;
        }

        if ($this->invoice_date && $this->payment_due_date && $this->payment_due_date < now()) {
            $paid = $this->invoices->sum('paid_amount');
            $total = $this->invoices->sum('total_amount');
            return $paid < $total;
        }

        return false;
    }

    /**
     * Check if the rental has active timesheets.
     */
    public function hasActiveTimesheets(): bool
    {
        return $this->timesheets()->where('status', 'active')->exists();
    }

    /**
     * Create a quotation from the rental.
     */
    public function createQuotation(): Quotation
    {
        if (!$this->relationLoaded('customer') || !$this->relationLoaded('rentalItems')) {
            $this->load(['customer', 'rentalItems.equipment', 'rentalItems.operator']);
        }

        if ($this->rentalItems->isEmpty()) {
            throw new \Exception('Rental has no items to create a quotation');
        }

        // Begin database transaction
        DB::beginTransaction();

        try {
            // Create the quotation
            $quotation = new Quotation();
            $quotation->customer_id = $this->customer_id;
            $quotation->rental_id = $this->id;
            $quotation->quotation_number = Quotation::generateQuotationNumber();
            $quotation->issue_date = now();
            $quotation->valid_until = now()->addDays(30);
            $quotation->subtotal = 0;
            $quotation->tax_percentage = 15; // Default tax rate
            $quotation->tax_amount = 0;
            $quotation->discount_percentage = 0;
            $quotation->discount_amount = 0;
            $quotation->total_amount = 0;
            $quotation->status = 'draft';
            $quotation->notes = "Quotation generated from rental {$this->rental_number}";
            $quotation->terms_and_conditions = "Standard terms and conditions apply.";
            $quotation->created_by = $this->created_by ?? auth()->id();
            $quotation->save();

            // Create quotation items from rental items
            $subtotal = 0;
            foreach ($this->rentalItems as $rentalItem) {
                $quotationItem = new QuotationItem();
                $quotationItem->quotation_id = $quotation->id;
                $quotationItem->equipment_id = $rentalItem->equipment_id;
                $quotationItem->operator_id = $rentalItem->operator_id;

                // Get operator/driver information if available
                if ($rentalItem->operator_id) {
                    // First check if we have an Operator model
                    if (class_exists('App\Models\\Operator')) {
                        try {
                            // Use the Operator model if available
                            $operator = Operator::find($rentalItem->operator_id);
                            if ($operator) {
                                $operatorTitle = $operator->category == 'driver' ? 'Driver' : 'Operator';
                                $quotationItem->description = $rentalItem->equipment->name . ' with ' . $operatorTitle;
                            } else {
                                $quotationItem->description = $rentalItem->equipment->name;
                            }
                        } catch (\Exception $e) {
                            // Fallback to equipment name only
                            $quotationItem->description = $rentalItem->equipment->name;
                        }
                    } else {
                        // Fallback to the employee model directly
                        try {
                            $employee = Employee::find($rentalItem->operator_id);
                            $quotationItem->description = $rentalItem->equipment->name . ' with Operator';
                        } catch (\Exception $e) {
                            $quotationItem->description = $rentalItem->equipment->name;
                        }
                    }
                } else {
                    $quotationItem->description = $rentalItem->equipment->name;
                }

                $quotationItem->quantity = $rentalItem->quantity;
                $quotationItem->rate = $rentalItem->rate;
                $quotationItem->rate_type = $rentalItem->rate_type;
                $quotationItem->total_amount = $rentalItem->quantity * $rentalItem->rate;
                $quotationItem->save();

                $subtotal += $quotationItem->total_amount;
            }

            // Update quotation with calculated values
            $taxAmount = ($subtotal * $quotation->tax_percentage) / 100;
            $totalAmount = $subtotal + $taxAmount - $quotation->discount_amount;

            $quotation->subtotal = $subtotal;
            $quotation->tax_amount = $taxAmount;
            $quotation->total_amount = $totalAmount;
            $quotation->save();

            // Make sure the quotation_id is set on this rental
            $this->quotation_id = $quotation->id;
            $this->save();

            // Make absolutely sure by doing a direct DB update
            DB::table('rentals')
                ->where('id', $this->id)
                ->update(['quotation_id' => $quotation->id]);

            // Make sure quotation has rental_id
            DB::table('quotations')
                ->where('id', $quotation->id)
                ->update(['rental_id' => $this->id]);

            // Log the bidirectional relationship update for debugging
            \Log::info('Bidirectional relationship set up between rental and quotation', [
                'rental_id' => $this->id,
                'quotation_id' => $quotation->id,
                'rental_quotation_id' => $this->quotation_id,
                'quotation_rental_id' => $quotation->rental_id,
                'db_rental_check' => DB::table('rentals')->where('id', $this->id)->value('quotation_id'),
                'db_quotation_check' => DB::table('quotations')->where('id', $quotation->id)->value('rental_id')
            ]);

            // Refresh the model to reflect the changes
            $this->refresh();
            $quotation->refresh();

            DB::commit();
            return $quotation;
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Error in createQuotation: ' . $e->getMessage(), [
                'rental_id' => $this->id,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Start mobilization process.
     */
    public function startMobilization(): self
    {
        if (!$this->quotation_id || !$this->quotation || $this->quotation->status !== 'approved') {
            throw new \Exception('Quotation must be approved before starting mobilization');
        }

        $this->update([
            'status' => 'mobilization',
            'mobilization_date' => now(),
        ]);

        return $this;
    }

    /**
     * Activate the rental.
     */
    public function activate(): self
    {
        if ($this->status !== 'mobilization' && $this->status !== 'mobilization_completed') {
            throw new \Exception('Rental must be in mobilization or mobilization_completed status before activation');
        }

        $this->update([
            'status' => 'active'
        ]);

        // Update equipment status to rented
        foreach ($this->rentalItems as $item) {
            $item->equipment->update(['status' => 'rented']);
        }

        return $this;
    }

    /**
     * Complete the rental.
     */
    public function complete(int $completedBy): self
    {
        if ($this->status !== 'active' && $this->status !== 'overdue') {
            throw new \Exception('Rental must be active or overdue to complete');
        }

        $this->update([
            'status' => 'completed',
            'actual_end_date' => now(),
            'completed_by' => $completedBy,
            'completed_at' => now(),
        ]);

        // Update equipment status to available
        foreach ($this->rentalItems as $item) {
            $item->equipment->update(['status' => 'available']);
        }

        return $this;
    }

    /**
     * Create an invoice for the rental.
     */
    public function createInvoice(): Invoice
    {
        if ($this->status !== 'completed' && $this->status !== 'active') {
            throw new \Exception('Rental must be completed or active to create an invoice');
        }

        // Prevent duplicate invoices
        $existingInvoice = $this->invoices()->first();
        if ($existingInvoice) {
            // Update status if not already set
            if ($this->status !== 'invoice_prepared') {
                $this->update(['status' => 'invoice_prepared']);
            }
            return $existingInvoice;
        }

        // Begin database transaction
        DB::beginTransaction();

        try {
            // Get payment terms from client
            $paymentTerms = $this->customer->payment_terms ?? 30;

            // Convert payment terms from string format (like 'net_30') to integer if needed
            if (is_string($paymentTerms)) {
                // Extract number from strings like 'net_30', 'net_15', etc.
                if (preg_match('/net_(\d+)/', $paymentTerms, $matches)) {
                    $paymentTerms = (int)$matches[1];
                } else if ($paymentTerms === 'immediate') {
                    $paymentTerms = 0;
                } else {
                    // Default to 30 days if the format is unrecognized
                    $paymentTerms = 30;
                }
            }

            // Use query-based sum to avoid loading all items into memory
            $subtotal = $this->rentalItems()->sum('total_amount');
            $discountAmount = ($subtotal * ($this->discount_percentage ?? 0)) / 100;
            $taxAmount = ($subtotal * ($this->tax_percentage ?? 15)) / 100;
            $totalAmount = $subtotal - $discountAmount + $taxAmount;

            // Generate a unique invoice number
            $year = now()->format('Y');
            $lastInvoice = Invoice::whereYear('created_at', $year)
                ->orderBy('id', 'desc')
                ->first();

            $sequence = 1;
            if ($lastInvoice) {
                // Extract the sequence number from the last invoice number
                if (preg_match('/INV-' . $year . '-(\d+)/', $lastInvoice->invoice_number, $matches)) {
                    $sequence = (int)$matches[1] + 1;
                }
            }

            $invoiceNumber = 'INV-' . $year . '-' . str_pad($sequence, 5, '0', STR_PAD_LEFT);

            // Create the invoice
            $invoice = Invoice::create([
                'customer_id' => $this->customer_id,
                'rental_id' => $this->id,
                'invoice_number' => $invoiceNumber,
                'invoice_date' => now(),
                'due_date' => now()->addDays($paymentTerms),
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'paid_amount' => 0,
                'balance' => $totalAmount,
                'status' => 'draft',
                'notes' => $this->status === 'completed' ? 'Completed rental' : null,
                'created_by' => (function () {
                    try {
                        return auth()->id() ?: 1;
                    } catch (\Throwable $e) {
                        return 1;
                    }
                })(),
            ]);

            // Only process up to 5 rental items to debug memory issues
            foreach ($this->rentalItems()->limit(5)->get() as $rentalItem) {
                $days = $this->getDurationDaysAttribute();

                // Adjust rate based on rate_type
                $rateMultiplier = 1;
                if ($rentalItem->rate_type === 'daily') {
                    $rateMultiplier = $days;
                } elseif ($rentalItem->rate_type === 'weekly') {
                    $rateMultiplier = ceil($days / 7);
                } elseif ($rentalItem->rate_type === 'monthly') {
                    $rateMultiplier = ceil($days / 30);
                }

                $amount = $rentalItem->rate * $rentalItem->quantity * $rateMultiplier;

                $invoice->invoiceItems()->create([
                    'description' => $rentalItem->equipment->name . ' (' . $days . ' days @ ' . $rentalItem->rate_type . ' rate)',
                    'quantity' => $rentalItem->quantity,
                    'unit_price' => $rentalItem->rate,
                    'amount' => $amount,
                ]);

                // Add operator fee if applicable
                if ($rentalItem->operator_id) {
                    $operatorName = $rentalItem->operator->first_name . ' ' . $rentalItem->operator->last_name;
                    $invoice->invoiceItems()->create([
                        'description' => 'Operator: ' . $operatorName,
                        'quantity' => $days,
                        'unit_price' => 200, // Example daily operator rate
                        'amount' => 200 * $days,
                    ]);
                }
            }

            // Update rental with invoice date and payment due date
            $this->update([
                'invoice_date' => now(),
                'payment_terms_days' => $paymentTerms,
                'payment_due_date' => now()->addDays($paymentTerms),
            ]);

            DB::commit();
            return $invoice;
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Check if payment is overdue and update status accordingly.
     */
    public function checkPaymentOverdue(): bool
    {
        if (!$this->payment_due_date || !$this->invoice_date) {
            return false;
        }

        if ($this->payment_due_date < now()) {
            // Check if there's any invoice with unpaid balance
            $totalDue = $this->invoices->sum(function($invoice) {
                return $invoice->total_amount - $invoice->paid_amount;
            });

            if ($totalDue > 0) {
                $this->update(['status' => 'overdue']);
                return true;
            }
        }

        return false;
    }

    /**
     * Update start date and regenerate timesheets if needed
     *
     * @param \DateTime|string $newStartDate The new start date
     * @return self;
     */
    public function updateStartDate($newStartDate): self
    {
        $oldStartDate = $this->start_date;

        // Update the start date
        $this->update([
            'start_date' => $newStartDate
        ]);

        // If rental is active, regenerate timesheets based on new start date
        if ($this->status === 'active') {
            // Generate fresh timesheets from the new start date
            $this->generateTimesheets();

            // Double-check for any missing dates
            $this->fillMissingTimesheets();
        }

        return $this;
    }

    public function extensionRequests(): HasMany
    {
        return $this->hasMany(RentalExtension::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function getTotalPaidAttribute()
    {
        return $this->payments()
            ->where('status', 'completed')
            ->sum('amount');
    }

    public function getRemainingBalanceAttribute()
    {
        return $this->total_amount - $this->total_paid;
    }

    public function getPaymentProgressAttribute()
    {
        if ($this->total_amount <= 0) {
            return 100;
        }
        return round(($this->total_paid / $this->total_amount) * 100);
    }

    public function getIsPaymentOverdueAttribute()
    {
        return $this->payment_due_date && now()->isAfter($this->payment_due_date);
    }

    public function getDaysOverdueAttribute()
    {
        if (!$this->is_payment_overdue) {
            return 0;
        }
        return now()->diffInDays($this->payment_due_date);
    }

    /**
     * Get the documents for the rental.
     */
    public function documents(): MorphMany
    {
        return $this->morphMany(Document::class, 'documentable');
    }

    /**
     * Register media collections
     */
    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('rental_documents')
             ->useDisk('public');

        $this->addMediaCollection('rental_images')
             ->useDisk('public');
    }

    /**
     * Register media conversions
     */
    public function registerMediaConversions(Media $media = null): void
    {
        $this->addMediaConversion('thumb')
             ->width(200)
             ->height(200)
             ->sharpen(10)
             ->nonQueued();

        $this->addMediaConversion('preview')
             ->width(800)
             ->height(800)
             ->nonQueued();
    }

    /**
     * Get the activity log options for the model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status', 'total_amount', 'start_date', 'expected_end_date', 'actual_end_date'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    /**
     * Get the status logs for the rental.
     */
    public function statusLogs(): HasMany
    {
        return $this->hasMany(RentalStatusLog::class);
    }

    /**
     * Get the latest status log.
     */
    public function latestStatusLog(): HasOne
    {
        return $this->hasOne(RentalStatusLog::class)->latest();
    }

    /**
     * Get the next possible states for this rental
     *
     * @return array;
     */
    public function getNextPossibleStates(): array
    {
        try {
            // Use the RentalStatusWorkflow service to get valid next states
            $workflowService = app(RentalStatusWorkflow::class);
            return $workflowService->getNextPossibleStates($this);
        } catch (\Exception $e) {
            \Log::error('Error getting next possible states: ' . $e->getMessage(), [
                'rental_id' => $this->id,
                'status' => $this->status
            ]);
            return []; // Return empty array as fallback;
        }
    }

    /**
     * Check if the rental can transition to a given status
     *
     * @param RentalStatus $status
     * @return bool;
     */
    public function canTransitionTo(RentalStatus $status): bool
    {
        try {
            // Use the RentalStatusWorkflow service to check transition validity
            $workflowService = app(RentalStatusWorkflow::class);
            return $workflowService->canTransitionTo($this, $status);
        } catch (\Exception $e) {
            \Log::error('Error checking transition possibility: ' . $e->getMessage(), [
                'rental_id' => $this->id,
                'current_status' => $this->status,
                'target_status' => $status
            ]);
            return false; // Default to not allowing transition on error;
        }
    }

    /**
     * Transition the rental to a new status
     *
     * @param RentalStatus $status
     * @param int|null $userId
     * @return self;
     */
    public function transitionTo(RentalStatus $status, ?int $userId = null): self
    {
        try {
            // Use the RentalStatusWorkflow service to perform the transition
            $workflowService = app(RentalStatusWorkflow::class);
            return $workflowService->transitionTo($this, $status, $userId);
        } catch (\Exception $e) {
            \Log::error('Error transitioning rental status: ' . $e->getMessage(), [
                'rental_id' => $this->id,
                'current_status' => $this->status,
                'target_status' => $status,
                'user_id' => $userId
            ]);
            throw $e; // Re-throw the exception after logging
        }
    }

    /**
     * Check if the rental is in a final state.
     */
    public function isFinalState(): bool
    {
        return $this->status->isFinalState();
    }

    /**
     * Get the location for the rental.
     */
    public function location(): BelongsTo
    {
        return $this->belongsTo(\Modules\Core\Domain\Models\Location::class, 'location_id');
    }

    /**
     * Get the th_has_operators attribute.
     */
    public function getThHasOperatorsAttribute(): bool
    {
        return $this->rentalItems()
            ->whereHas('operators', function ($query) {
                $query->where('rental_operator_assignments.status', 'active');
            })
            ->exists();
    }

    /**
     * Get the th_total_amount attribute.
     */
    public function getThTotalAmountAttribute(): float
    {
        return $this->total_amount ?? 0.00;
    }

    public function getCustomerNameAttribute()
    {
        return $this->customer ? $this->customer->name : null;
    }

    /**
     * Stub: Generate timesheets for this rental (to be implemented)
     */
    public function generateTimesheets(): void
    {
        \Log::info('Called generateTimesheets for rental', ['rental_id' => $this->id]);
        // TODO: Implement timesheet generation logic
    }

    /**
     * Stub: Fill missing timesheets for this rental (to be implemented)
     */
    public function fillMissingTimesheets(): void
    {
        \Log::info('Called fillMissingTimesheets for rental', ['rental_id' => $this->id]);
        // TODO: Implement missing timesheet fill logic
    }

    /**
     * Get the workflow history for the rental (for frontend audit trail)
     */
    public function getWorkflowHistoryAttribute()
    {
        return $this->statusLogs()->orderBy('created_at')->get()->map(function ($log) {
            return [
                'id' => $log->id,
                'from_status' => $this->getStatusValue($log->from_status),
                'to_status' => $this->getStatusValue($log->to_status) ?? $log->status ?? null,
                'action' => $this->getStatusDisplayName($log->to_status) ?? $log->status ?? null,
                'status' => $this->getStatusValue($log->to_status) ?? $log->status ?? null,
                'changed_by' => $log->changed_by,
                'user' => $log->changedBy?->name,
                'date' => $log->created_at?->toDateTimeString(),
                'description' => $log->notes,
            ];
        });
    }

    /**
     * Helper to get enum value or string.
     */
    private function getStatusValue($status)
    {
        return is_object($status) && property_exists($status, 'value') ? $status->value : $status;
    }

    /**
     * Helper to get display name from enum or string.
     */
    private function getStatusDisplayName($status)
    {
        return is_object($status) && method_exists($status, 'getDisplayName') ? $status->getDisplayName() : (string)$status;
    }
}






