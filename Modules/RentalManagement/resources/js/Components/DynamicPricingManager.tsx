import { useState, useEffect } from 'react';
import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/../../Modules/Core/resources/js/components/ui/dialog';
import { Input } from '@/../../Modules/Core/resources/js/components/ui/input';
import { Label } from '@/../../Modules/Core/resources/js/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/../../Modules/Core/resources/js/components/ui/select';
import { Switch } from '@/../../Modules/Core/resources/js/components/ui/switch';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/../../Modules/Core/resources/js/components/ui/table';
import { DatePicker } from '@/../../Modules/Core/resources/js/components/ui/date-picker';
import { formatDateTime, formatDateMedium, formatDateShort } from '@/Core/utils/dateFormatter';

interface DynamicPricingRule {
    id: number;
    rule_type: string;
    condition_type: string;
    condition_value: any;
    adjustment_type: string;
    adjustment_value: number;
    priority: number;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
}

interface DynamicPricingManagerProps {
    equipmentId: number;
}

export function DynamicPricingManager({ equipmentId }: DynamicPricingManagerProps) {
    const [rules, setRules] = useState<DynamicPricingRule[]>([]);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        rule_type: '',
        condition_type: '',
        condition_value: {},
        adjustment_type: '',
        adjustment_value: 0,
        priority: 0,
        start_date: null,
        end_date: null,
        is_active: true,
    });

    useEffect(() => {
        fetchRules();
    }, [equipmentId]);

    const fetchRules = async () => {
        try {
            const response = await fetch(`/api/equipment/${equipmentId}/pricing-rules`);
            const data = await response.json();
            setRules(data.data);
        } catch (error) {
            toast.error('Failed to fetch pricing rules');
        }
    };

    const handleCreateRule = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/equipment/${equipmentId}/pricing-rules`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                await fetchRules();
                setShowCreateDialog(false);
                toast.success('Pricing rule created successfully');
            } else {
                throw new Error('Failed to create rule');
            }
        } catch (error) {
            toast.error('Failed to create pricing rule');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleRule = async (rule: DynamicPricingRule) => {
        try {
            const response = await fetch(`/api/pricing-rules/${rule.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_active: !rule.is_active,
                }),
            });

            if (response.ok) {
                await fetchRules();
                toast.success('Rule status updated successfully');
            } else {
                throw new Error('Failed to update rule');
            }
        } catch (error) {
            toast.error('Failed to update rule status');
        }
    };

    const handleDeleteRule = async (rule: DynamicPricingRule) => {
        try {
            const response = await fetch(`/api/pricing-rules/${rule.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                await fetchRules();
                toast.success('Rule deleted successfully');
            } else {
                throw new Error('Failed to delete rule');
            }
        } catch (error) {
            toast.error('Failed to delete rule');
        }
    };

    const renderConditionValue = (rule: DynamicPricingRule) => {
        switch (rule.condition_type) {
            case 'date_range':
                return `${new Date(rule.condition_value.start)} - ${new Date(rule.condition_value.end)}`;
            case 'utilization':
            case 'rental_days':
            case 'quantity':
                return `${rule.condition_value.min} - ${rule.condition_value.max}`;
            case 'customer_segment':
                return Array.isArray(rule.condition_value) ? rule.condition_value.join(', ') : rule.condition_value;
            default:
                return JSON.stringify(rule.condition_value);
        }
    };

    const renderAdjustmentValue = (rule: DynamicPricingRule) => {
        switch (rule.adjustment_type) {
            case 'percentage':
                return `${rule.adjustment_value}%`;
            case 'fixed':
                return `$${rule.adjustment_value}`;
            case 'multiplier':
                return `×${rule.adjustment_value}`;
            default:
                return rule.adjustment_value;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Dynamic Pricing Rules</CardTitle>
                <CardDescription>
                    Manage pricing rules and adjustments for this equipment.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <Button onClick={() => setShowCreateDialog(true)}>
                        Create New Rule
                    </Button>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Condition</TableHead>
                                <TableHead>Adjustment</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {rules.map((rule) => (
                                <TableRow key={rule.id}>
                                    <TableCell>{rule.rule_type}</TableCell>
                                    <TableCell>
                                        <div className="text-sm">
                                            <div>{rule.condition_type}</div>
                                            <div className="text-gray-500">
                                                {renderConditionValue(rule)}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{renderAdjustmentValue(rule)}</TableCell>
                                    <TableCell>{rule.priority}</TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={rule.is_active}
                                            onCheckedChange={() => handleToggleRule(rule)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDeleteRule(rule)}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent aria-describedby={undefined}>
                    <DialogHeader>
                        <DialogTitle>Create Pricing Rule</DialogTitle>
                        <DialogDescription>
                            Set up a new dynamic pricing rule for this equipment.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div>
                            <Label>Rule Type</Label>
                            <Select
                                value={formData.rule_type}
                                onValueChange={(value) => setFormData({ ...formData, rule_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select rule type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="seasonal">Seasonal</SelectItem>
                                    <SelectItem value="demand">Demand-based</SelectItem>
                                    <SelectItem value="duration">Duration-based</SelectItem>
                                    <SelectItem value="customer_type">Customer Type</SelectItem>
                                    <SelectItem value="bulk">Bulk Discount</SelectItem>
                                    <SelectItem value="special">Special Offer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Condition Type</Label>
                            <Select
                                value={formData.condition_type}
                                onValueChange={(value) => setFormData({ ...formData, condition_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select condition type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date_range">Date Range</SelectItem>
                                    <SelectItem value="utilization">Utilization</SelectItem>
                                    <SelectItem value="rental_days">Rental Days</SelectItem>
                                    <SelectItem value="customer_segment">Customer Segment</SelectItem>
                                    <SelectItem value="quantity">Quantity</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Adjustment Type</Label>
                            <Select
                                value={formData.adjustment_type}
                                onValueChange={(value) => setFormData({ ...formData, adjustment_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select adjustment type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="percentage">Percentage</SelectItem>
                                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                                    <SelectItem value="multiplier">Multiplier</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Adjustment Value</Label>
                            <Input
                                type="number"
                                value={formData.adjustment_value}
                                onChange={(e) => setFormData({ ...formData, adjustment_value: parseFloat(e.target.value) })}
                            />
                        </div>

                        <div>
                            <Label>Priority</Label>
                            <Input
                                type="number"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                            />
                        </div>

                        <div className="flex space-x-4">
                            <div>
                                <Label>Start Date</Label>
                                <DatePicker
                                    value={formatDateMedium(formData.start_date)}
                                    onChange={(date) => setFormData({ ...formData, start_date: date })}
                                />
                            </div>
                            <div>
                                <Label>End Date</Label>
                                <DatePicker
                                    value={formatDateMedium(formData.end_date)}
                                    onChange={(date) => setFormData({ ...formData, end_date: date })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={handleCreateRule}
                            disabled={isSubmitting || !formData.rule_type || !formData.condition_type || !formData.adjustment_type}
                        >
                            {isSubmitting ? 'Creating...' : 'Create Rule'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
