import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from 'react-hook-form';

interface ResourceFormProps {
    form: UseFormReturn<any>
    children: React.ReactNode;
}

export function ResourceForm({ form, children }: ResourceFormProps) {
  const { t } = useTranslation('project');

    return (
        <Form>
            <form className="space-y-4">
                {children}
            </form>
        </Form>
    );
}

interface ResourceInputProps {
    form: UseFormReturn<any>
    name: string;
    label: string;
    type?: string;
    placeholder?: string;
}

export function ResourceInput({ form, name, label, type = 'text', placeholder }: ResourceInputProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Input
                id={name}
                type={type}
                placeholder={placeholder}
                {...form.register(name)}
            />
            {form.formState.errors[name] && (
                <p className="text-sm text-red-500">{form.formState.errors[name]?.message}</p>
            )}
        </div>
    );
}

interface ResourceSelectProps {
    form: UseFormReturn<any>
    name: string;
    label: string;
    options: Array<{ value: string; label: string }>
    placeholder?: string;
}

export function ResourceSelect({ form, name, label, options, placeholder }: ResourceSelectProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Select
                onValueChange={(value) => form.setValue(name, value)}
                defaultValue={form.getValues(name)}
                <SelectTrigger>
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {form.formState.errors[name] && (
                <p className="text-sm text-red-500">{form.formState.errors[name]?.message}</p>
            )}
        </div>
    );
}

interface ResourceTextareaProps {
    form: UseFormReturn<any>
    name: string;
    label: string;
    placeholder?: string;
}

export function ResourceTextarea({ form, name, label, placeholder }: ResourceTextareaProps) {
    return (
        <div className="space-y-2">
            <Label htmlFor={name}>{label}</Label>
            <Textarea
                id={name}
                placeholder={placeholder}
                {...form.register(name)}
            />
            {form.formState.errors[name] && (
                <p className="text-sm text-red-500">{form.formState.errors[name]?.message}</p>
            )}
        </div>
    );
}














