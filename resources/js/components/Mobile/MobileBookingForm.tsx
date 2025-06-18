/**
 * Mobile Booking Form Component
 * Touch-optimized equipment booking interface with step-by-step flow
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslation } from 'react-i18next';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  DollarSign,
  FileText,
  Shield,
  Info,
  Calculator,
  Calendar as CalendarIcon
} from 'lucide-react';
import { useForm } from '@inertiajs/react';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePWA } from '@/hooks/usePWA';

interface Equipment {
  id: string;
  name: string;
  description: string;
  category: string;
  dailyRate: number;
  weeklyRate: number;
  monthlyRate: number;
  images: string[];
  specifications: Record<string, any>;
  location: string;
  requiresDeposit: boolean;
  depositAmount?: number;
  minimumRentalDays?: number;
  maximumRentalDays?: number;
}

interface BookingFormData {
  equipment_id: string;
  start_date: string;
  end_date: string;
  delivery_method: 'pickup' | 'delivery';
  delivery_address?: string;
  delivery_notes?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  company_name?: string;
  special_requirements?: string;
  insurance_option: 'basic' | 'premium' | 'none';
  payment_method: 'card' | 'bank' | 'cash';
  terms_accepted: boolean;
  marketing_consent: boolean;
}

interface MobileBookingFormProps {
  equipment: Equipment;
  onSubmit?: (data: BookingFormData) => void;
  onCancel?: () => void;
  className?: string;
}

const MobileBookingForm: React.FC<MobileBookingFormProps> = ({
  equipment,
  onSubmit,
  onCancel,
  className = ''
}) => {
  const isMobile = useIsMobile();
  const { isOnline } = usePWA();
  const { t } = useTranslation(['common', 'booking']);
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [pricing, setPricing] = useState({
    subtotal: 0,
    deposit: 0,
    insurance: 0,
    delivery: 0,
    tax: 0,
    total: 0,
    rentalDays: 0
  });

  const { data, setData, post, processing, errors, reset } = useForm<BookingFormData>({
    equipment_id: equipment.id,
    start_date: '',
    end_date: '',
    delivery_method: 'pickup',
    delivery_address: '',
    delivery_notes: '',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    company_name: '',
    special_requirements: '',
    insurance_option: 'basic',
    payment_method: 'card',
    terms_accepted: false,
    marketing_consent: false
  });

  const steps = [
    { id: 1, title: t('booking:step_dates_delivery', 'Dates & Delivery'), icon: Calendar },
    { id: 2, title: t('booking:step_customer_info', 'Customer Info'), icon: User },
    { id: 3, title: t('booking:step_options_payment', 'Options & Payment'), icon: CreditCard },
    { id: 4, title: t('booking:step_review_confirm', 'Review & Confirm'), icon: CheckCircle }
  ];

  // Calculate pricing when dates change
  useEffect(() => {
    if (data.start_date && data.end_date) {
      calculatePricing();
    }
  }, [data.start_date, data.end_date, data.delivery_method, data.insurance_option]);

  const calculatePricing = async () => {
    setIsCalculating(true);

    try {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const rentalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      let dailyRate = equipment.dailyRate;

      // Apply weekly/monthly rates if applicable
      if (rentalDays >= 30) {
        dailyRate = equipment.monthlyRate / 30;
      } else if (rentalDays >= 7) {
        dailyRate = equipment.weeklyRate / 7;
      }

      const subtotal = dailyRate * rentalDays;
      const deposit = equipment.requiresDeposit ? (equipment.depositAmount || subtotal * 0.2) : 0;

      let insurance = 0;
      if (data.insurance_option === 'basic') {
        insurance = subtotal * 0.05;
      } else if (data.insurance_option === 'premium') {
        insurance = subtotal * 0.1;
      }

      const delivery = data.delivery_method === 'delivery' ? 50 : 0;
      const tax = (subtotal + insurance + delivery) * 0.1; // 10% tax
      const total = subtotal + deposit + insurance + delivery + tax;

      setPricing({
        subtotal,
        deposit,
        insurance,
        delivery,
        tax,
        total,
        rentalDays
      });
    } catch (error) {
      console.error('Error calculating pricing:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(data.start_date && data.end_date && data.delivery_method);
      case 2:
        return !!(data.customer_name && data.customer_email && data.customer_phone);
      case 3:
        return !!(data.insurance_option && data.payment_method);
      case 4:
        return data.terms_accepted;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateStep(4)) {
      if (onSubmit) {
        onSubmit(data);
      } else {
        post('/api/bookings', {
          onSuccess: () => {
            // Handle success
          },
          onError: () => {
            // Handle error
          }
        });
      }
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className={`
              flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
              ${isActive ? 'border-blue-600 bg-blue-600 text-white' : ''}
              ${isCompleted ? 'border-green-600 bg-green-600 text-white' : ''}
              ${!isActive && !isCompleted ? 'border-gray-300 text-gray-400' : ''}
            `}>
              {isCompleted ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div className={`
                w-8 h-0.5 mx-2
                ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
              `} />
            )}
          </div>
        );
      })}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Rental Dates & Delivery</h3>

        {/* Date Selection */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={data.start_date}
              onChange={(e) => setData('start_date', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="mt-1"
            />
            {errors.start_date && (
              <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
            )}
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={data.end_date}
              onChange={(e) => setData('end_date', e.target.value)}
              min={data.start_date || new Date().toISOString().split('T')[0]}
              className="mt-1"
            />
            {errors.end_date && (
              <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
            )}
          </div>
        </div>

        {/* Delivery Method */}
        <div className="mb-4">
          <Label>{t('booking:delivery_method', 'Delivery Method')}</Label>
          <RadioGroup
            value={data.delivery_method}
            onValueChange={(value) => setData('delivery_method', value as 'pickup' | 'delivery')}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pickup" id="pickup" />
              <Label htmlFor="pickup" className="flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>{t('booking:pickup_from_location', 'Pickup from location')}</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="delivery" id="delivery" />
              <Label htmlFor="delivery" className="flex items-center space-x-2">
                <Truck className="h-4 w-4" />
                <span>{t('booking:delivery_fee', 'Delivery (+$50)')}</span>
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Delivery Address */}
        {data.delivery_method === 'delivery' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="delivery_address">{t('booking:delivery_address', 'Delivery Address')}</Label>
              <Textarea
                id="delivery_address"
                value={data.delivery_address}
                onChange={(e) => setData('delivery_address', e.target.value)}
                placeholder={t('booking:delivery_address_placeholder', 'Enter full delivery address...')}
                className="mt-1"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="delivery_notes">{t('booking:delivery_notes', 'Delivery Notes (Optional)')}</Label>
              <Textarea
                id="delivery_notes"
                value={data.delivery_notes}
                onChange={(e) => setData('delivery_notes', e.target.value)}
                placeholder={t('booking:delivery_notes_placeholder', 'Special delivery instructions...')}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        )}

        {/* Pricing Preview */}
        {pricing.rentalDays > 0 && (
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-sm">
                <span>{t('booking:rental_duration', 'Rental Duration:')}</span>
                <span className="font-medium">{t('booking:days_count', '{{count}} days', { count: pricing.rentalDays })}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span>{t('booking:estimated_total', 'Estimated Total:')}</span>
                <span className="font-bold text-lg">${pricing.total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">{t('booking:customer_information', 'Customer Information')}</h3>

        <div className="space-y-4">
          <div>
            <Label htmlFor="customer_name">{t('booking:full_name', 'Full Name *')}</Label>
            <Input
              id="customer_name"
              value={data.customer_name}
              onChange={(e) => setData('customer_name', e.target.value)}
              placeholder={t('booking:full_name_placeholder', 'Enter your full name')}
              className="mt-1"
            />
            {errors.customer_name && (
              <p className="text-red-500 text-xs mt-1">{errors.customer_name}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_email">{t('booking:email_address', 'Email Address *')}</Label>
            <Input
              id="customer_email"
              type="email"
              value={data.customer_email}
              onChange={(e) => setData('customer_email', e.target.value)}
              placeholder={t('booking:email_placeholder', 'Enter your email address')}
              className="mt-1"
            />
            {errors.customer_email && (
              <p className="text-red-500 text-xs mt-1">{errors.customer_email}</p>
            )}
          </div>

          <div>
            <Label htmlFor="customer_phone">Phone Number *</Label>
            <Input
              id="customer_phone"
              type="tel"
              value={data.customer_phone}
              onChange={(e) => setData('customer_phone', e.target.value)}
              placeholder="Enter your phone number"
              className="mt-1"
            />
            {errors.customer_phone && (
              <p className="text-red-500 text-xs mt-1">{errors.customer_phone}</p>
            )}
          </div>

          <div>
            <Label htmlFor="company_name">Company Name (Optional)</Label>
            <Input
              id="company_name"
              value={data.company_name}
              onChange={(e) => setData('company_name', e.target.value)}
              placeholder="Enter company name if applicable"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="special_requirements">Special Requirements (Optional)</Label>
            <Textarea
              id="special_requirements"
              value={data.special_requirements}
              onChange={(e) => setData('special_requirements', e.target.value)}
              placeholder="Any special requirements or notes..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Insurance & Payment</h3>

        {/* Insurance Options */}
        <div className="mb-6">
          <Label className="text-base font-medium">Insurance Coverage</Label>
          <RadioGroup
            value={data.insurance_option}
            onValueChange={(value) => setData('insurance_option', value as 'basic' | 'premium' | 'none')}
            className="mt-3 space-y-3"
          >
            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="none" id="no-insurance" />
                <Label htmlFor="no-insurance" className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">No Insurance</div>
                      <div className="text-sm text-muted-foreground">Customer assumes all risk</div>
                    </div>
                    <div className="font-bold">$0</div>
                  </div>
                </Label>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="basic" id="basic-insurance" />
                <Label htmlFor="basic-insurance" className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Basic Coverage</div>
                      <div className="text-sm text-muted-foreground">Covers damage up to $5,000</div>
                    </div>
                    <div className="font-bold">+${pricing.insurance.toFixed(2)}</div>
                  </div>
                </Label>
              </div>
            </Card>

            <Card className="p-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="premium" id="premium-insurance" />
                <Label htmlFor="premium-insurance" className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Premium Coverage</div>
                      <div className="text-sm text-muted-foreground">Full coverage + liability</div>
                    </div>
                    <div className="font-bold">+${(pricing.subtotal * 0.1).toFixed(2)}</div>
                  </div>
                </Label>
              </div>
            </Card>
          </RadioGroup>
        </div>

        {/* Payment Method */}
        <div>
          <Label className="text-base font-medium">Payment Method</Label>
          <RadioGroup
            value={data.payment_method}
            onValueChange={(value) => setData('payment_method', value as 'card' | 'bank' | 'cash')}
            className="mt-3 space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="card" id="card" />
              <Label htmlFor="card" className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>Credit/Debit Card</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="bank" id="bank" />
              <Label htmlFor="bank" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Bank Transfer</span>
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="cash" id="cash" />
              <Label htmlFor="cash" className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4" />
                <span>Cash on Pickup/Delivery</span>
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Review & Confirm</h3>

        {/* Equipment Summary */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Equipment</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex space-x-3">
              <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                {equipment.images.length > 0 ? (
                  <img
                    src={equipment.images[0]}
                    alt={equipment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{equipment.name}</h4>
                <p className="text-sm text-muted-foreground">{equipment.category}</p>
                <p className="text-sm text-muted-foreground">{equipment.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Rental Period:</span>
              <span>{data.start_date} to {data.end_date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Duration:</span>
              <span>{pricing.rentalDays} days</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery:</span>
              <span className="capitalize">{data.delivery_method}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Insurance:</span>
              <span className="capitalize">{data.insurance_option}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Payment:</span>
              <span className="capitalize">{data.payment_method}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Breakdown */}
        <Card className="mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{t('booking:pricing_breakdown', 'Pricing Breakdown')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            <div className="flex justify-between text-sm">
              <span>{t('booking:rental_days', 'Rental ({{count}} days):', { count: pricing.rentalDays })}</span>
              <span>${pricing.subtotal.toFixed(2)}</span>
            </div>
            {pricing.deposit > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('booking:security_deposit', 'Security Deposit:')}</span>
                <span>${pricing.deposit.toFixed(2)}</span>
              </div>
            )}
            {pricing.insurance > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('booking:insurance', 'Insurance:')}</span>
                <span>${pricing.insurance.toFixed(2)}</span>
              </div>
            )}
            {pricing.delivery > 0 && (
              <div className="flex justify-between text-sm">
                <span>{t('booking:delivery', 'Delivery:')}</span>
                <span>${pricing.delivery.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>{t('booking:tax', 'Tax:')}</span>
              <span>${pricing.tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>{t('booking:total', 'Total:')}</span>
              <span>${pricing.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Terms and Conditions */}
        <div className="space-y-3">
          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={data.terms_accepted}
              onCheckedChange={(checked) => setData('terms_accepted', !!checked)}
            />
            <Label htmlFor="terms" className="text-sm leading-relaxed">
              {t('booking:terms_agreement', 'I agree to the <a>Terms and Conditions</a> and <a>Rental Agreement</a>', {
                a: (chunks) => <a href="#" className="text-blue-600 underline">{chunks}</a>
              })}
            </Label>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="marketing"
              checked={data.marketing_consent}
              onCheckedChange={(checked) => setData('marketing_consent', !!checked)}
            />
            <Label htmlFor="marketing" className="text-sm leading-relaxed">
              {t('booking:marketing_consent', 'I would like to receive marketing communications and special offers (optional)')}
            </Label>
          </div>
        </div>

        {!isOnline && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t('booking:offline_message', 'You\'re currently offline. Your booking will be submitted when you\'re back online.')}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  return (
    <div className={`mobile-booking-form ${className}`}>
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{t('booking:book_equipment', 'Book Equipment')}</CardTitle>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                ×
              </Button>
            )}
          </div>
          <CardDescription>
            {t('booking:step_indicator', 'Step {{current}} of {{total}}: {{title}}', {
              current: currentStep,
              total: steps.length,
              title: steps[currentStep - 1].title
            })}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {renderStepIndicator()}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{t('common:previous', 'Previous')}</span>
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!validateStep(currentStep) || isCalculating}
                  className="flex items-center space-x-2"
                >
                  <span>{t('common:next', 'Next')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!validateStep(4) || processing}
                  className="flex items-center space-x-2"
                >
                  {processing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <span>{processing ? t('booking:submitting', 'Submitting...') : t('booking:confirm_booking', 'Confirm Booking')}</span>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileBookingForm;


