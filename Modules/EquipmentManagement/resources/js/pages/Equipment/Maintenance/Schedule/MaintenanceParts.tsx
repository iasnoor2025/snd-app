import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Numeric } from '@/components/ui/numeric';

interface Part {
  id: number;
  name: string;
  part_number: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  in_stock: boolean;
}

interface MaintenancePartsProps {
  maintenanceId: number;
  parts: Part[];
  availableParts: Part[];
  onSuccess?: () => void;
}

export function MaintenanceParts({ maintenanceId, parts, availableParts, onSuccess }: MaintenancePartsProps) {
  const [isAddingPart, setIsAddingPart] = useState(false);

  const { data, setData, post, processing, errors, reset } = useForm({
    maintenance_id: maintenanceId,
    part_id: '',
    quantity: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post(route('equipment.maintenance.parts.store'), {
      onSuccess: () => {
        reset();
        setIsAddingPart(false);
        if (onSuccess) onSuccess();
      },
    });
  };

  const removePart = (partId: number) => {
    if (confirm('Are you sure you want to remove this part?')) {
      post(route('equipment.maintenance.parts.remove', { id: maintenanceId, partId }), {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      });
    }
  };

  const totalPartsCost = parts.reduce((total, part) => total + part.total_cost, 0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Parts & Materials</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAddingPart(!isAddingPart)}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Part
        </Button>
      </CardHeader>
      <CardContent>
        {isAddingPart && (
          <div className="mb-4 border rounded-md p-4">
            <h3 className="font-medium mb-2">Add Part</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="part_id">Select Part</Label>
                <select
                  id="part_id"
                  className="w-full p-2 border rounded-md"
                  value={data.part_id}
                  onChange={(e) => setData('part_id', e.target.value)}
                >
                  <option value="">Select a part</option>
                  {availableParts.map((part) => (
                    <option key={part.id} value={part.id.toString()}>
                      {part.name} ({part.part_number}) - ${part.unit_cost.toFixed(2)}
                      {!part.in_stock && ' - Out of stock'}
                    </option>
                  ))}
                </select>
                {errors.part_id && (
                  <p className="text-sm text-red-500 mt-1">{errors.part_id}</p>
                )}
              </div>

              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Numeric
                  id="quantity"
                  value={data.quantity}
                  onValueChange={(value) => setData('quantity', value)}
                  min={1}
                  className="w-full"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500 mt-1">{errors.quantity}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddingPart(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing}>
                  {processing ? 'Adding...' : 'Add Part'}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div>
          {parts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No parts added to this maintenance task yet
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part</TableHead>
                    <TableHead>Part Number</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Cost</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parts.map((part) => (
                    <TableRow key={part.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {part.name}
                          {!part.in_stock && (
                            <Badge variant="outline" className="bg-red-100 text-red-800">
                              Out of stock
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{part.part_number}</TableCell>
                      <TableCell className="text-right">{part.quantity}</TableCell>
                      <TableCell className="text-right">${part.unit_cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">${part.total_cost.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePart(part.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                          <span className="sr-only">Remove part</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Separator className="my-4" />

              <div className="flex justify-end">
                <div className="text-sm font-medium">
                  Total Cost: <span className="text-lg ml-2">${totalPartsCost.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
