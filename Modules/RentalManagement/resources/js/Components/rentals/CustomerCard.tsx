import React from "react";
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Home, Mail, Phone, User } from "lucide-react";

interface CustomerCardProps {
  customer: {
    id: number;
    company_name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
  };
}

const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  // Get customer initials for avatar
  const getCustomerInitials = (customerName: string) => {
  const { t } = useTranslation('rental');

    if (!customerName) return "CU";

    return customerName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{t('customer_details')}</span>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getCustomerInitials(customer.company_name || '')}</AvatarFallback>
          </Avatar>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm font-medium">{customer.company_name || 'Unknown Company'}</p>

          {customer.contact_person && (
            <p className="text-sm text-muted-foreground">
              <User className="h-3 w-3 inline mr-1" />
              {customer.contact_person}
            </p>
          )}

          {customer.email && (
            <p className="text-sm text-muted-foreground">
              <Mail className="h-3 w-3 inline mr-1" />
              {customer.email}
            </p>
          )}

          {customer.phone && (
            <p className="text-sm text-muted-foreground">
              <Phone className="h-3 w-3 inline mr-1" />
              {customer.phone}
            </p>
          )}

          {customer.address && (
            <p className="text-sm text-muted-foreground">
              <Home className="h-3 w-3 inline mr-1" />
              {customer.address}
              {(customer.city || customer.state || customer.zip_code || customer.country) && (
                <>
                  {(customer.city || customer.state || customer.zip_code) && (
                    <>
                      <br />
                      <span className="ml-4">
                        {[customer.city, customer.state, customer.zip_code].filter(Boolean).join(', ')}
                      </span>
                    </>
                  )}
                  {customer.country && (
                    <>
                      <br />
                      <span className="ml-4">{customer.country}</span>
                    </>
                  )}
                </>
              )}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerCard;














