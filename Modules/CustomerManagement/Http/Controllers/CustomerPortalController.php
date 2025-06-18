<?php
namespace Modules\CustomerManagement\Http\Controllers;

use Modules\RentalManagement\Domain\Models\Customer;
use Modules\Core\Domain\Models\User;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\Payment;
use Modules\RentalManagement\Domain\Models\Invoice;
use App\Models\Document;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerPortalController extends Controller
{
    /**
     * Display the customer portal dashboard
     */
    public function dashboard()
    {
        $user = Auth::user();
        $customer = $this->getCustomer($user);

        // Get recent rentals
        $recentRentals = Rental::where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get();

        // Get recent payments
        $recentPayments = Payment::where('customer_id', $customer->id)
            ->orderBy('payment_date', 'desc')
            ->take(5)
            ->get();

        // Get upcoming payments
        $upcomingPayments = Payment::where('customer_id', $customer->id)
            ->where('status', 'pending')
            ->where('due_date', '>=', now())
            ->orderBy('due_date', 'asc')
            ->take(5)
            ->get();

        // Get rental stats
        $rentalStats = [
            'active' => Rental::where('customer_id', $customer->id)
                ->where('status', 'active')
                ->count(),
            'completed' => Rental::where('customer_id', $customer->id)
                ->where('status', 'completed')
                ->count(),
            'total' => Rental::where('customer_id', $customer->id)->count(),
        ];

        // Get payment stats
        $paymentStats = [
            'paid' => Payment::where('customer_id', $customer->id)
                ->where('status', 'paid')
                ->count(),
            'pending' => Payment::where('customer_id', $customer->id)
                ->where('status', 'pending')
                ->count(),
            'overdue' => Payment::where('customer_id', $customer->id)
                ->where('status', 'overdue')
                ->count(),
            'total' => Payment::where('customer_id', $customer->id)->count(),
        ];

        return Inertia::render('CustomerPortal/Dashboard', [
            'customer' => $customer,
            'recentRentals' => $recentRentals,
            'recentPayments' => $recentPayments,
            'upcomingPayments' => $upcomingPayments,
            'rentalStats' => $rentalStats,
            'paymentStats' => $paymentStats,
        ]);
    }

    /**
     * Display the profile page
     */
    public function profile()
    {
        $user = Auth::user();
        $customer = $this->getCustomer($user);

        return Inertia::render('CustomerPortal/Profile', [
            'customer' => $customer,
        ]);
    }

    /**
     * Update customer profile
     */
    public function updateProfile(Request $request)
    {
        $user = Auth::user();
        $customer = $this->getCustomer($user);

        $validated = $request->validate([
            'company_name' => 'required|string|max:100',
            'contact_person' => 'required|string|max:100',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:200',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'postal_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'billing_address' => 'nullable|string|max:200',
            'shipping_address' => 'nullable|string|max:200',
            'notes' => 'nullable|string|max:500',
        ]);

        $customer->update($validated);

        return redirect()->back()->with('success', 'Profile updated successfully.');
    }

    /**
     * Update customer password
     */
    public function updatePassword(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user->password = bcrypt($validated['password']);
        $user->save();

        return redirect()->back()->with('success', 'Password updated successfully.');
    }

    /**
     * Display rental history
     */
    public function rentals(Request $request)
    {
        $user = Auth::user();
        $customer = $this->getCustomer($user);

        $query = Rental::where('customer_id', $customer->id);

        // Apply filters
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('equipment_name', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        $rentals = $query->orderBy('created_at', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('CustomerPortal/Rentals', [
            'customer' => $customer,
            'rentals' => $rentals,
        ]);
    }

    /**
     * Display payments and invoices
     */
    public function payments(Request $request)
    {
        $user = Auth::user();
        $customer = $this->getCustomer($user);

        // Get payments
        $paymentQuery = Payment::where('customer_id', $customer->id);

        if ($request->has('search')) {
            $search = $request->input('search');
            $paymentQuery->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->input('status')) {
            $paymentQuery->where('status', $request->input('status'));
        }

        $payments = $paymentQuery->orderBy('payment_date', 'desc')
            ->paginate(10)
            ->withQueryString();

        // Get invoices
        $invoiceQuery = Invoice::where('customer_id', $customer->id);

        if ($request->has('search')) {
            $search = $request->input('search');
            $invoiceQuery->where(function ($q) use ($search) {
                $q->where('invoice_number', 'like', "%{$search}%")
                  ->orWhere('id', 'like', "%{$search}%");
            });
        }

        if ($request->has('status') && $request->input('status')) {
            $invoiceQuery->where('status', $request->input('status'));
        }

        $invoices = $invoiceQuery->orderBy('issue_date', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('CustomerPortal/Payments', [
            'customer' => $customer,
            'payments' => $payments,
            'invoices' => $invoices,
        ]);
    }

    /**
     * Display documents
     */
    public function documents(Request $request)
    {
        $user = Auth::user();
        $customer = $this->getCustomer($user);

        $query = Document::where('documentable_type', 'App\Models\Customer')
            ->where('documentable_id', $customer->id);

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('file_name', 'like', "%{$search}%");
            });
        }

        if ($request->has('category') && $request->input('category') != 'all') {
            $query->where('category', $request->input('category'));
        }

        $documents = $query->orderBy('created_at', 'desc')->get();

        // Get unique categories
        $categories = Document::where('documentable_type', 'App\Models\Customer')
            ->where('documentable_id', $customer->id)
            ->distinct('category')
            ->pluck('category')
            ->toArray();

        return Inertia::render('CustomerPortal/Documents', [
            'customer' => $customer,
            'documents' => $documents,
            'categories' => $categories,
        ]);
    }

    /**
     * Display settings
     */
    public function settings()
    {
        $user = Auth::user();
        $customer = $this->getCustomer($user);

        // Get current settings or defaults
        $settings = $customer->settings ?? [
            'notification_preferences' => [
                'email' => true,
                'sms' => false,
                'push' => false,
            ],
            'notification_events' => [
                'rental_updates' => true,
                'payment_reminders' => true,
                'document_uploads' => false,
                'invoice_generated' => true,
                'maintenance_alerts' => false,
            ],
            'display_mode' => 'light',
            'language' => 'en',
        ];

        return Inertia::render('CustomerPortal/Settings', [
            'customer' => $customer,
            'settings' => $settings,
        ]);
    }

    /**
     * Update settings
     */
    public function updateSettings(Request $request)
    {
        $user = Auth::user();
        $customer = $this->getCustomer($user);

        $validated = $request->validate([
            'notification_preferences' => 'required|array',
            'notification_preferences.email' => 'required|boolean',
            'notification_preferences.sms' => 'required|boolean',
            'notification_preferences.push' => 'required|boolean',
            'notification_events' => 'required|array',
            'notification_events.rental_updates' => 'required|boolean',
            'notification_events.payment_reminders' => 'required|boolean',
            'notification_events.document_uploads' => 'required|boolean',
            'notification_events.invoice_generated' => 'required|boolean',
            'notification_events.maintenance_alerts' => 'required|boolean',
            'display_mode' => 'required|string|in:light,dark,system',
            'language' => 'required|string|in:en,es,ar',
        ]);

        $customer->settings = $validated;
        $customer->save();

        return redirect()->back()->with('success', 'Settings updated successfully.');
    }

    /**
     * Get the customer record for the current user
     */
    private function getCustomer(User $user)
    {
        // Get customer based on user's relationship (this depends on your specific application setup)
        // This is a placeholder - you may need to adjust this based on your actual user-customer relationship

        // Example 1: If user has a customer relationship
        if ($user->customer) {
            return $user->customer;
        }

        // Example 2: If customer has a user_id column
        return Customer::where('user_id', $user->id)->firstOrFail();
    }
}



