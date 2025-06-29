<?php

namespace Modules\RentalManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Modules\RentalManagement\Domain\Models\Rental;
use Modules\RentalManagement\Domain\Models\Invoice;
use Modules\CustomerManagement\Domain\Models\Customer;

class CustomerPortalController extends Controller
{
    public function dashboard()
    {
        $customer = Auth::user()->customer;
        $bookings = Rental::where('customer_id', $customer->id)->latest()->take(5)->get();
        $invoices = Invoice::where('customer_id', $customer->id)->latest()->take(5)->get();
        return response()->json([
            'customer' => $customer,
            'bookings' => $bookings,
            'invoices' => $invoices,
        ]);
    }

    public function bookings()
    {
        $customer = Auth::user()->customer;
        $bookings = Rental::where('customer_id', $customer->id)->latest()->get();
        return response()->json(['bookings' => $bookings]);
    }

    public function invoices()
    {
        $customer = Auth::user()->customer;
        $invoices = Invoice::where('customer_id', $customer->id)->latest()->get();
        return response()->json(['invoices' => $invoices]);
    }

    public function updateProfile(Request $request)
    {
        $customer = Auth::user()->customer;
        $customer->update($request->only(['name', 'email', 'phone']));
        return response()->json(['customer' => $customer]);
    }

    public function createBooking(Request $request)
    {
        $customer = Auth::user()->customer;
        $data = $request->validate([
            'equipment_id' => 'required|exists:equipment,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);
        $data['customer_id'] = $customer->id;
        $booking = Rental::create($data);
        return response()->json(['booking' => $booking]);
    }

    public function cancelBooking($id)
    {
        $customer = Auth::user()->customer;
        $booking = Rental::where('id', $id)->where('customer_id', $customer->id)->firstOrFail();
        $booking->delete();
        return response()->json(['success' => true]);
    }
}
