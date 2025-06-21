import React from "react";
import { useTranslation } from 'react-i18next';
import { RentalItem, Equipment, Employee } from "@/Core/types/models";

// Shadcn UI Components
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/Core";
import { Badge } from "@/Core";

interface ExtendedRentalItem extends Omit<RentalItem, 'operator'> {
  daily_rate?: number;
  days?: number;
  total_price?: number;
  operator_id?: number | null;
  operator?: Employee | null | {
    id: number;
    name: string;
  };
}

interface Props {
  rentalItems: any[];
  items: ExtendedRentalItem[] | undefined;
  readOnly?: boolean;
}

export default function RentalItemsTable({ rentalItems, items = [], readOnly = true }: Props) {
  const { t } = useTranslation('rental');

  // Format currency for display
  const formatCurrency = (amount: number) => {
    // Check for null, undefined, or NaN
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return "SAR 0.00";
    }

    // Ensure amount is a number
    const numericAmount = Number(amount);

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SAR",
    }).format(numericAmount);
  };

  // Calculate subtotal for all items
  const subtotal = (items || []).reduce(
    (sum, item) => {
      const itemTotal = Number(item.total_price || item.total_amount || 0);
      return sum + (isNaN(itemTotal) ? 0 : itemTotal);
    },
    0
  );

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Equipment</TableHead>
            <TableHead className="w-[15%]">Operator</TableHead>
            <TableHead className="w-[15%]">Price/Day</TableHead>
            <TableHead className="w-[10%]">Quantity</TableHead>
            <TableHead className="w-[10%]">Days</TableHead>
            <TableHead className="w-[20%] text-right">Subtotal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!items || items.length === 0) ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No items found for this rental.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">
                  {item.equipment?.name || "Unknown Equipment"}
                </TableCell>
                <TableCell>
                  {item.operator_id ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {item.operator
                        ? (typeof item.operator === 'object' && item.operator !== null
                            ? ('name' in item.operator
                                ? item.operator.name
                                : ('first_name' in item.operator && 'last_name' in item.operator)
                                  ? `${item.operator.first_name} ${item.operator.last_name}`
                                  : 'With Driver')
                            : 'With Driver')
                        : 'With Driver'}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                      No Driver
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {formatCurrency(item.daily_rate || (item.rate_type === 'daily' ? item.rate : 0) || 0)}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.days || 1}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(item.total_price || item.total_amount || 0)}
                </TableCell>
              </TableRow>
            ))
          )}

          {/* Totals */}
          <TableRow>
            <TableCell colSpan={5} className="text-right font-medium">
              Subtotal
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(subtotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}















