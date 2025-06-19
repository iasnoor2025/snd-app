import React from 'react';
import { Button } from '@/Modules/Core/resources/js/components/ui/button';
import { Input } from '@/Modules/Core/resources/js/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Modules/Core/resources/js/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/Modules/Core/resources/js/components/ui/popover';
import { Calendar } from '@/Modules/Core/resources/js/components/ui/calendar';
import { format } from 'date-fns';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { cn } from '@/Modules/Core/resources/js/lib/utils';
import { useTranslation } from 'react-i18next';

interface ResourceFiltersProps {
    type: 'manpower' | 'equipment' | 'material' | 'fuel' | 'expense';
    filters: {
        search?: string;
        status?: string;
        startDate?: Date;
        endDate?: Date;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    };
    onFilterChange: (filters: any) => void;
    onReset: () => void;
}

export default function ResourceFilters({
    type,
    filters,
    onFilterChange,
    onReset
}: ResourceFiltersProps) {
    const { t } = useTranslation();
    const handleDateChange = (date: Date | undefined, field: 'startDate' | 'endDate') => {
        onFilterChange({ ...filters, [field]: date })
    };

    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-');
        onFilterChange({ ...filters, sortBy, sortOrder })
    };

    const getSortOptions = () => {
        const commonOptions = [
            { value: 'created_at-desc', label: t('projects:newest_first') },
            { value: 'created_at-asc', label: t('projects:oldest_first') },
        ];

        switch (type) {
            case 'manpower':
                return [
                    ...commonOptions,
                    { value: 'hours-desc', label: t('projects:most_hours') },
                    { value: 'hours-asc', label: t('projects:least_hours') },
                    { value: 'cost-desc', label: t('projects:highest_cost') },
                    { value: 'cost-asc', label: t('projects:lowest_cost') },
                ];
            case 'equipment':
                return [
                    ...commonOptions,
                    { value: 'hours-desc', label: t('projects:most_hours') },
                    { value: 'hours-asc', label: t('projects:least_hours') },
                    { value: 'cost-desc', label: t('projects:highest_cost') },
                    { value: 'cost-asc', label: t('projects:lowest_cost') },
                ];
            case 'material':
                return [
                    ...commonOptions,
                    { value: 'quantity-desc', label: t('projects:highest_quantity') },
                    { value: 'quantity-asc', label: t('projects:lowest_quantity') },
                    { value: 'cost-desc', label: t('projects:highest_cost') },
                    { value: 'cost-asc', label: t('projects:lowest_cost') },
                ];
            case 'fuel':
                return [
                    ...commonOptions,
                    { value: 'quantity-desc', label: t('projects:highest_quantity') },
                    { value: 'quantity-asc', label: t('projects:lowest_quantity') },
                    { value: 'cost-desc', label: t('projects:highest_cost') },
                    { value: 'cost-asc', label: t('projects:lowest_cost') },
                ];
            case 'expense':
                return [
                    ...commonOptions,
                    { value: 'amount-desc', label: t('projects:highest_amount') },
                    { value: 'amount-asc', label: t('projects:lowest_amount') },
                ];
            default:
                return commonOptions;
        }
    };

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg">
            {/* Search Input */}
            <Input
                placeholder={t('projects:search_resources')}
                value={filters.search || ''}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                className="max-w-xs"
            />

            {/* Date Range Filter */}
            <div className="flex items-center gap-2">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !filters.startDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.startDate ? (
                                format(filters.startDate, "PPP")
                            ) : (
                                <span>{t('projects:start_date')}</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={filters.startDate}
                            onSelect={(date) => handleDateChange(date, 'startDate')}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">{t('common:to')}</span>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !filters.endDate && "text-muted-foreground"
                            )}
                        >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {filters.endDate ? (
                                format(filters.endDate, "PPP")
                            ) : (
                                <span>{t('projects:end_date')}</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                            mode="single"
                            selected={filters.endDate}
                            onSelect={(date) => handleDateChange(date, 'endDate')}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Sort Select */}
            <Select
                value={`${filters.sortBy || 'created_at'}-${filters.sortOrder || 'desc'}`}
                onValueChange={handleSortChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder={t('projects:sort_by')} />
                </SelectTrigger>
                <SelectContent>
                    {getSortOptions().map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Reset Button */}
            <Button
                variant="outline"
                onClick={onReset}
                className="ml-auto"
            >
                <X className="h-4 w-4 mr-2" />
                {t('projects:reset_filters')}
            </Button>
        </div>
    );
}















