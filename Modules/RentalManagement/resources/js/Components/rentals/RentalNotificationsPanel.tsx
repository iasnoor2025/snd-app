import React from "react";
import { useTranslation } from 'react-i18next';
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Bell, Wrench } from "lucide-react";

interface Notification {
  type: 'maintenance' | 'overdue' | 'info';
  message: string;
  timestamp: Date;
}

interface RentalNotificationsPanelProps {
  notifications: Notification[];
  className?: string;
}

export default function RentalNotificationsPanel({
  notifications,
  className = ""
}: RentalNotificationsPanelProps) {
  const { t } = useTranslation('rental');

  return (
    <Card className={`shadow-sm ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="h-4 w-4 text-muted-foreground" />
          Notifications
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t('no_notifications')}</p>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <div className="mt-1">
                  {notification.type === 'maintenance' && <Wrench className="h-4 w-4 text-orange-500" />}
                  {notification.type === 'overdue' && <AlertCircle className="h-4 w-4 text-red-500" />}
                  {notification.type === 'info' && <Bell className="h-4 w-4 text-blue-500" />}
                </div>
                <div>
                  <p className="text-sm">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(notification.timestamp), "MMM dd, yyyy HH:mm")}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}














