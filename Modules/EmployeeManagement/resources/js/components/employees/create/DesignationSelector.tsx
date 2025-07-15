import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Designation {
    id: number;
    name: string;
    [key: string]: any;
}

interface DesignationSelectorProps {
    value: Designation | null;
    onChange: (designation: Designation | null) => void;
    error?: string;
}

const DesignationSelector: React.FC<DesignationSelectorProps> = ({ value, onChange, error }) => {
    const [designations, setDesignations] = useState<Designation[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios
            .get('/api/v1/designations')
            .then((res) => setDesignations(res.data))
            .catch(() => toast.error('Failed to load designations'))
            .finally(() => setLoading(false));
    }, []);

    const filtered = search ? designations.filter((d) => d.name.toLowerCase().includes(search.toLowerCase())) : designations;

    return (
        <div>
            <label className="mb-1 block text-sm font-medium">Designation</label>
            <Input
                placeholder="Search designation..."
                value={search}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                className="mb-2"
            />
            <Select
                value={value ? String(value.id) : ''}
                onValueChange={(val: string) => {
                    const selected = designations.find((d) => String(d.id) === val) || null;
                    onChange(selected);
                }}
                disabled={loading}
            >
                <SelectTrigger className={error ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                    {filtered.length === 0 && <div className="p-2 text-gray-500">No designations found</div>}
                    {filtered.map((designation) => (
                        <SelectItem key={`${designation.id}-${designation.name}`} value={String(designation.id)}>
                            {designation.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
        </div>
    );
};

export default DesignationSelector;
