import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/Core";
import { Button } from "@/Core";
import { FileText, Plus } from "lucide-react";
import RentalItemsTable from "./RentalItemsTable";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/Core";
import CreateRentalItemForm from "../../pages/Rentals/Items/Create";

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
  equipment: any[];
  operators: any[];
  extraHeaderButton?: React.ReactNode;
}

const RentalItemsCard: React.FC<RentalItemsCardProps & { equipment?: any[]; operators?: any[] }> = ({
  rentalId,
  items,
  canAddItems,
  equipment,
  operators,
  extraHeaderButton,
}) => {
  const { t } = useTranslation('rental');
  const [open, setOpen] = React.useState(false);
  // Defensive fallback for undefined/null
  const safeEquipment = Array.isArray(equipment) ? equipment : [];
  const safeOperators = Array.isArray(operators) ? operators : [];
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle>{t('rental_items')}</CardTitle>
          <CardDescription>{t('equipment_and_operator_details_for_this_rental')}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {canAddItems && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  {t('btn_add_item')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                <DialogDescription id="add-item-modal-desc">
                  {t('equipment_and_operator_details_for_this_rental')}
                </DialogDescription>
                <DialogHeader>
                  <DialogTitle>{t('ttl_add_rental_item')}</DialogTitle>
                </DialogHeader>
                <CreateRentalItemForm
                  key={`modal-form-${rentalId}-${JSON.stringify(safeEquipment)}-${JSON.stringify(safeOperators)}`}
                  rental={{ id: rentalId }}
                  equipment={safeEquipment}
                  operators={safeOperators}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {items && items.length > 0 ? (
          <RentalItemsTable rentalItems={items} items={items as any[]} />
        ) : (
          <div className="text-center py-6">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <p className="mt-2 text-lg font-medium">{t('no_items_added_yet')}</p>
            <p className="text-sm text-muted-foreground">
              Add equipment and operators to this rental.
            </p>
            {canAddItems && (
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl" aria-describedby={undefined}>
                  <DialogDescription id="add-item-modal-desc">
                    {t('equipment_and_operator_details_for_this_rental')}
                  </DialogDescription>
                  <DialogHeader>
                    <DialogTitle>{t('ttl_add_rental_item')}</DialogTitle>
                  </DialogHeader>
                  <CreateRentalItemForm
                    key={`modal-form-${rentalId}-${JSON.stringify(safeEquipment)}-${JSON.stringify(safeOperators)}`}
                    rental={{ id: rentalId }}
                    equipment={safeEquipment}
                    operators={safeOperators}
                  />
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RentalItemsCard;














