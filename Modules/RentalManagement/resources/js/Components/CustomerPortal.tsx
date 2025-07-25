import { Card, CardContent, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Booking {
    id: number;
    equipment_id: number;
    start_date: string;
    end_date: string;
}

interface Invoice {
    id: number;
    amount: number;
    status: string;
}

interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
}

export function CustomerPortal() {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [profile, setProfile] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await fetch('/api/customer-portal/dashboard');
            const data = await res.json();
            setCustomer(data.customer);
            setBookings(data.bookings);
            setInvoices(data.invoices);
            setProfile({
                name: data.customer.name,
                email: data.customer.email,
                phone: data.customer.phone,
            });
        } catch {
            toast.error('Failed to load dashboard');
        }
    };

    const updateProfile = async () => {
        try {
            const res = await fetch('/api/customer-portal/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profile),
            });
            if (res.ok) {
                toast.success('Profile updated');
                fetchDashboard();
            } else {
                toast.error('Failed to update profile');
            }
        } catch {
            toast.error('Failed to update profile');
        }
    };

    const cancelBooking = async (id: number) => {
        try {
            const res = await fetch(`/api/customer-portal/bookings/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Booking cancelled');
                fetchDashboard();
            } else {
                toast.error('Failed to cancel booking');
            }
        } catch {
            toast.error('Failed to cancel booking');
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <input
                        className="mb-2 block"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        placeholder="Name"
                    />
                    <input
                        className="mb-2 block"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="Email"
                    />
                    <input
                        className="mb-2 block"
                        value={profile.phone}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="Phone"
                    />
                    <button className="rounded bg-blue-500 px-2 py-1 text-white" onClick={updateProfile}>
                        Update Profile
                    </button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {bookings.map((b) => (
                            <li key={b.id} className="mb-2">
                                Equipment #{b.equipment_id}: {new Date(b.start_date)} - {new Date(b.end_date)}
                                <button className="ml-2 rounded bg-red-500 px-2 py-1 text-white" onClick={() => cancelBooking(b.id)}>
                                    Cancel
                                </button>
                            </li>
                        ))}
                        {bookings.length === 0 && <li>No bookings found</li>}
                    </ul>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Invoices</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul>
                        {invoices.map((inv) => (
                            <li key={inv.id} className="mb-2">
                                Invoice #{inv.id}: ${inv.amount} - {inv.status}
                            </li>
                        ))}
                        {invoices.length === 0 && <li>No invoices found</li>}
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
