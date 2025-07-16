import { useEffect } from 'react';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from './alert';

interface ErrorAlertProps {
  message: string;
  title?: string;
  showInline?: boolean;
}

export function ErrorAlert({ message, title = 'Error', showInline = false }: ErrorAlertProps) {
  useEffect(() => {
    toast.error(message, { description: title });
  }, [message, title]);

  if (!showInline) return null;

  return (
    <Alert variant="destructive">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
