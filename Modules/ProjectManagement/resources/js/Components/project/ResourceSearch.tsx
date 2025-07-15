import { cn, Input } from '@/Core';
import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ResourceSearchProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    debounceTime?: number;
}

export default function ResourceSearch({
    value,
    onChange,
    placeholder = 'Search resources...',
    className = '',
    debounceTime = 300,
}: ResourceSearchProps) {
    const { t } = useTranslation('project');

    const [searchValue, setSearchValue] = useState(value);

    // Debounce the search input
    useEffect(() => {
        const timer = setTimeout(() => {
            onChange(searchValue);
        }, debounceTime);

        return () => clearTimeout(timer);
    }, [searchValue, onChange, debounceTime]);

    const handleClear = () => {
        setSearchValue('');
        onChange('');
    };

    return (
        <div className={cn('relative', className)}>
            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder={placeholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="pr-8 pl-8"
            />
            {searchValue && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute top-2.5 right-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    );
}
