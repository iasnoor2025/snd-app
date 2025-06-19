import * as React from 'react';
import { useFormContext, Controller, FormProvider } from 'react-hook-form';

const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => (
  <form {...props}>{children}</form>
);

const FormField = ({ name, control, render }: any) => (
  <Controller name={name} control={control} render={render} />
);

const FormItem = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <div className={className}>{children ?? <></>}</div>
);

const FormLabel = ({ children, className }: { children?: React.ReactNode; className?: string }) => (
  <label className={className}>{children ?? <></>}</label>
);

const FormControl = ({ children }: { children?: React.ReactNode }) => <>{children ?? <></>}</>;

const FormDescription = ({ children }: { children?: React.ReactNode }) => (
  <div className="text-muted-foreground text-xs">{children ?? <></>}</div>
);

const FormMessage = ({ children }: { children?: React.ReactNode }) => (
  <div className="text-destructive text-xs mt-1">{children ?? <></>}</div>
);

export { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage };






















