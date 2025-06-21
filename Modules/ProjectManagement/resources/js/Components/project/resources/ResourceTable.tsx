import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/Core";
import { Button } from "@/Core";
import { Pencil, Trash2 } from 'lucide-react';
import { Skeleton } from "@/Core";

interface ResourceTableProps {
    data: any[];
    columns: {
        header: string;
        accessorKey: string;
        cell?: (props: any) => React.ReactNode;
    }[];
    onEdit: (resource: any) => void;
    onDelete: (resource: any) => void;
    isLoading?: boolean;
}

const ResourceTable: React.FC<ResourceTableProps> = ({
    data,
    columns,
    onEdit,
    onDelete,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                No resources found
            </div>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    {columns.map((column) => (
                        <TableHead key={column.accessorKey}>
                            {column.header}
                        </TableHead>
                    ))}
                    <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((resource) => (
                    <TableRow key={resource.id}>
                        {columns.map((column) => (
                            <TableCell key={column.accessorKey}>
                                {column.cell
                                    ? column.cell({ row: { original: resource } })
                                    : resource[column.accessorKey]}
                            </TableCell>
                        ))}
                        <TableCell>
                            <div className="flex space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(resource)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onDelete(resource)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
};

export default ResourceTable;

export { ResourceTable };














