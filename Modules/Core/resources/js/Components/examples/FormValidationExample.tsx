import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

/**
 * Example component demonstrating how to use react-i18next with form validation
 */
const FormValidationExample: React.FC = () => {
    // Use the useTranslation hook to access translation functions
    const { t } = useTranslation(['common', 'employees']);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        iqamaNumber: '',
    });

    // Validation errors state
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when field is edited
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    // Validate form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        // First name validation
        if (!formData.firstName.trim()) {
            newErrors.firstName = t('common:field_required', { field: t('employees:first_name') });
        }

        // Last name validation
        if (!formData.lastName.trim()) {
            newErrors.lastName = t('common:field_required', { field: t('employees:last_name') });
        }

        // Email validation
        if (!formData.email.trim()) {
            newErrors.email = t('common:field_required', { field: t('common:email') });
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = t('common:invalid_email');
        }

        // Phone validation (optional)
        if (formData.phone && !/^\d{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
            newErrors.phone = t('common:invalid_phone');
        }

        // Iqama number validation (optional but with format check)
        if (formData.iqamaNumber && !/^\d{10}$/.test(formData.iqamaNumber)) {
            newErrors.iqamaNumber = t('employees:invalid_iqama_format');
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // Form is valid, proceed with submission
            toast.success(t('common:success'), {
                description: t('employees:form_submitted_successfully'),
            });

            // Reset form after successful submission
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                iqamaNumber: '',
            });
        } else {
            // Form has errors
            toast.error(t('common:error'), {
                description: t('common:form_has_errors'),
            });
        }
    };

    return (
        <div className="mx-auto max-w-md p-4">
            <h1 className="mb-4 text-2xl font-bold">{t('employees:employee_form')}</h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="firstName">{t('employees:first_name')}</Label>
                    <Input
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={errors.firstName ? 'border-red-500' : ''}
                    />
                    {errors.firstName && <p className="text-sm text-red-500">{errors.firstName}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="lastName">{t('employees:last_name')}</Label>
                    <Input
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={errors.lastName ? 'border-red-500' : ''}
                    />
                    {errors.lastName && <p className="text-sm text-red-500">{errors.lastName}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">{t('common:email')}</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">{t('common:phone')}</Label>
                    <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} className={errors.phone ? 'border-red-500' : ''} />
                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="iqamaNumber">{t('employees:iqama_number')}</Label>
                    <Input
                        id="iqamaNumber"
                        name="iqamaNumber"
                        value={formData.iqamaNumber}
                        onChange={handleChange}
                        className={errors.iqamaNumber ? 'border-red-500' : ''}
                    />
                    {errors.iqamaNumber && <p className="text-sm text-red-500">{errors.iqamaNumber}</p>}
                </div>

                <Button type="submit" className="w-full">
                    {t('common:submit')}
                </Button>
            </form>
        </div>
    );
};

export default FormValidationExample;
