import { Card, CardContent, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/components/ui/card';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface PurchaseOrder {
    id: number;
    supplier: { id: number; name: string };
    equipment: { id: number; name: string };
    order_date: string;
    quantity: number;
    unit_price: number;
    status: string;
    notes: string;
}

export function PurchaseOrderList() {
    const [orders, setOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/purchase-orders');
            const data = await res.json();
            setOrders(data.data);
        } catch {
            toast.error('Failed to fetch purchase orders');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
                <table className="min-w-full border text-sm">
                    <thead>
                        <tr>
                            <th className="border px-2 py-1">Supplier</th>
                            <th className="border px-2 py-1">Equipment</th>
                            <th className="border px-2 py-1">Order Date</th>
                            <th className="border px-2 py-1">Quantity</th>
                            <th className="border px-2 py-1">Unit Price</th>
                            <th className="border px-2 py-1">Status</th>
                            <th className="border px-2 py-1">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((o) => (
                            <tr key={o.id}>
                                <td className="border px-2 py-1">{o.supplier?.name}</td>
                                <td className="border px-2 py-1">{o.equipment?.name}</td>
                                <td className="border px-2 py-1">{new Date(o.order_date)}</td>
                                <td className="border px-2 py-1">{o.quantity}</td>
                                <td className="border px-2 py-1">${o.unit_price.toFixed(2)}</td>
                                <td className="border px-2 py-1">{o.status}</td>
                                <td className="border px-2 py-1">{/* Edit/Delete actions can be added here */}</td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-2 text-center">
                                    No purchase orders found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </CardContent>
        </Card>
    );
}
