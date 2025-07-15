import * as React from "react"
import { useFormContext, Controller, FormProvider } from "react-hook-form"

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode
}

export function Form({ children, ...props }: FormProps) {
  return <form {...props}>{children}</form>
}

export function FormField({ name, control, render }: any) {
  return <Controller name={name} control={control} render={render} />
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{children}</label>
}

export function FormControl({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>
}

export function FormMessage({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p className="text-xs text-red-500 mt-1">{children}</p>
}
