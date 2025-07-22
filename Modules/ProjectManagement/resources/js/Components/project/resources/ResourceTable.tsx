import { Button, Skeleton } from '@/Core';
import { TableComponent } from '@/Core/Components/ui';
import { Pencil, Trash2 } from 'lucide-react';

interface ResourceTableProps<T> {
    data: T[];
    columns: import('@/Core/components/ui/table').Column<T>[];
    onEdit: (resource: T) => void;
    onDelete: (resource: T) => void;
    isLoading?: boolean;
    emptyMessage?: string;
    pageSize?: number;
    currentPage?: number;
    totalItems?: number;
    onPageChange?: (page: number) => void;
}

export function ResourceTable<T>({
    data,
    columns,
    onEdit,
    onDelete,
    isLoading = false,
    emptyMessage = 'No resources found',
    pageSize = 10,
    currentPage = 1,
    totalItems,
    onPageChange,
}: ResourceTableProps<T>) {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    return (
        <TableComponent
            data={data}
            columns={[
                ...columns,
                {
                    key: 'actions',
                    header: 'Actions',
                    accessor: (item: T) => (
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onDelete(item)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ),
                    className: 'w-[100px]',
                },
            ]}
            isLoading={isLoading}
            emptyMessage={emptyMessage}
            pageSize={pageSize}
            currentPage={currentPage}
            totalItems={totalItems}
            onPageChange={onPageChange}
            showPagination={!!onPageChange}
            showBorders
            showHover
            striped
        />
    );
}

export default ResourceTable;
