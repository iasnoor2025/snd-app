import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Core";
import { Button } from "@/Core";
import { FileText, Plus } from "lucide-react";
import { Link } from "@inertiajs/react";
import RentalItemsTable from "./RentalItemsTable";

interface RentalItem {
  id: number;
  equipment_id: number;
  equipment_name: string;
  operator_id?: number;
  operator_name?: string;
  start_date: string;
  end_date: string;
  rate: number;
  rate_type: string;
  quantity: number;
  total: number;
}

interface RentalItemsCardProps {
  rentalId: number;
  items: RentalItem[];
  canAddItems: boolean;
}

const RentalItemsCard: React.FC<RentalItemsCardProps> = ({
  rentalId,
  items,
  canAddItems,
}) => {
  const { t } = useTranslation('rental');
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{t('rental_items')}</CardTitle>
          <CardDescription>{t('equipment_and_operator_details_for_this_rental')}</CardDescription>
        </div>
        {canAddItems && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/rentals/${rentalId}/items/create`}>
              <Plus className="h-4 w-4 mr-2" />
              {t('btn_add_item')}
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <RentalItemsTable rentalItems={items} items={items} />
        ) : (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-lg font-medium">{t('no_items_added_yet')}</p>
            <p className="text-sm text-muted-foreground">
              Add equipment and operators to this rental.
            </p>
            {canAddItems && (
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <Link href={`/rentals/${rentalId}/items/create`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Item
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RentalItemsCard;














