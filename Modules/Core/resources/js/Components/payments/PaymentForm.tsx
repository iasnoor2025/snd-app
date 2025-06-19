import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/Modules/Core/resources/js/components/ui/card";
import { Button } from "@/Modules/Core/resources/js/components/ui/button";
import { Input } from "@/Modules/Core/resources/js/components/ui/input";
import { Label } from "@/Modules/Core/resources/js/components/ui/label";
import { Textarea } from "@/Modules/Core/resources/js/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Modules/Core/resources/js/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/Modules/Core/resources/js/components/ui/dialog";
import { CalendarIcon, CreditCard, DollarSign } from "lucide-react";
import { toast } from 'sonner';
import { format } from "date-fns";

interface PaymentFormData {
  amount: number;
  method: string;
  date: string;
  reference: string;
  notes?: string;
  status: 'pending' | 'completed' | 'failed';
}

interface PaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PaymentFormData) => void;
  maxAmount?: number;
  currency?: string;
  title?: string;
  description?: string;
  isLoading?: boolean;
}

export default function PaymentForm({
  isOpen,
  onClose,
  onSubmit,
  maxAmount,
  currency = 'USD',
  title = 'Add Payment',
  description = 'Enter payment details below',
  isLoading = false
}: PaymentFormProps) {
  const { t } = useTranslation('payment');
  
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: 0,
    method: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    reference: '',
    notes: '',
    status: 'completed'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const paymentMethods = [
    { value: 'cash', label: 'Cash' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'check', label: 'Check' },
    { value: 'online_payment', label: 'Online Payment' },
    { value: 'mobile_payment', label: 'Mobile Payment' }
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }
    
    if (maxAmount && formData.amount > maxAmount) {
      newErrors.amount = `Amount cannot exceed ${maxAmount}`;
    }

    if (!formData.method) {
      newErrors.method = 'Please select a payment method';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a payment date';
    }

    if (!formData.reference.trim()) {
      newErrors.reference = 'Please enter a payment reference';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      onSubmit(formData);
      toast.success('Payment details submitted successfully');
      handleClose();
    } catch (error) {
      toast.error('Failed to submit payment details');
    }
  };

  const handleClose = () => {
    setFormData({
      amount: 0,
      method: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      reference: '',
      notes: '',
      status: 'completed'
    });
    setErrors({});
    onClose();
  };

  const updateFormData = (key: keyof PaymentFormData, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                max={maxAmount}
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={(e) => updateFormData('amount', parseFloat(e.target.value) || 0)}
                className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Payment Method *</Label>
            <Select
              value={formData.method}
              onValueChange={(value) => updateFormData('method', value)}
            >
              <SelectTrigger className={errors.method ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    {method.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.method && (
              <p className="text-sm text-red-500">{errors.method}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Payment Date *</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => updateFormData('date', e.target.value)}
                className={`pl-10 ${errors.date ? 'border-red-500' : ''}`}
              />
            </div>
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Payment Reference *</Label>
            <Input
              id="reference"
              type="text"
              placeholder="Transaction ID, Check number, etc."
              value={formData.reference}
              onChange={(e) => updateFormData('reference', e.target.value)}
              className={errors.reference ? 'border-red-500' : ''}
            />
            {errors.reference && (
              <p className="text-sm text-red-500">{errors.reference}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Payment Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: 'pending' | 'completed' | 'failed') => updateFormData('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional payment details..."
              value={formData.notes}
              onChange={(e) => updateFormData('notes', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? 'Submitting...' : 'Add Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export type { PaymentFormData, PaymentFormProps }; 