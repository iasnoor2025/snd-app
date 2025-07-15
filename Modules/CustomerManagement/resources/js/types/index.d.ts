import { User } from '@/types';

export interface PageProps {
    auth: {
        user: User;
    };
    errors: Record<string, string>;
    [key: string]: any;
}

export interface Customer {
    id: number;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    zip?: string;
    country?: string;
    website?: string;
    tax_id?: string;
    tax_number?: string;
    payment_terms?: string;
    credit_limit?: number;
    is_active: boolean;
    status: string;
    notes?: string;
    user_id?: number;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
}
