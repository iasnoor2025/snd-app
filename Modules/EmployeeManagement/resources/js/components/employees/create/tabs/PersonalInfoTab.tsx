import {
    Alert,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Input,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/Core';
import axios from 'axios';
import { Info, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

interface PersonalInfoTabProps {
    form: UseFormReturn<any>;
}

const countries = [
    { value: 'Saudi Arabia', label: 'Saudi Arabia' },
    { value: 'Kuwait', label: 'Kuwait' },
    { value: 'Bahrain', label: 'Bahrain' },
    { value: 'Qatar', label: 'Qatar' },
    { value: 'Oman', label: 'Oman' },
    { value: 'Yemen', label: 'Yemen' },
    { value: 'Egypt', label: 'Egypt' },
    { value: 'India', label: 'India' },
    { value: 'Pakistan', label: 'Pakistan' },
    { value: 'Bangladesh', label: 'Bangladesh' },
    { value: 'Philippines', label: 'Philippines' },
    { value: 'Sri Lanka', label: 'Sri Lanka' },
    { value: 'Nepal', label: 'Nepal' },
    { value: 'Sudan', label: 'Sudan' },
];

export default function PersonalInfoTab({ form }: PersonalInfoTabProps) {
    const { t } = useTranslation('employee');
    const [lastFileNumber, setLastFileNumber] = useState<number>(0);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        const fetchLastFileNumber = async () => {
            try {
                // Check if file_number is already set (for editing)
                if (form.getValues('file_number')) {
                    return; // Skip fetching if we already have a file number
                }

                // Generate a default sequential file number
                const nextNumber = lastFileNumber + 1;
                const formattedNumber = nextNumber.toString().padStart(4, '0');
                const defaultFileNumber = `EMP-${formattedNumber}`;
                form.setValue('file_number', defaultFileNumber, { shouldValidate: true });
                setLastFileNumber(nextNumber);

                // Try to get a proper file number from API
                try {
                    const response = await axios.get('/api/employees/simple-file-number');
                    console.log('API response:', response.data);

                    if (response.data && response.data.file_number) {
                        form.setValue('file_number', response.data.file_number, { shouldValidate: true });
                        if (response.data.lastFileNumber) {
                            setLastFileNumber(response.data.lastFileNumber);
                        }
                    }
                } catch (apiError) {
                    // Silent fail - we already have a default file number
                    console.log('Could not fetch file number from API, using default');
                }
            } catch (error) {
                console.error('Error in file number setup:', error);
                // Set default value on error
                setLastFileNumber(0);
                if (!form.getValues('file_number')) {
                    form.setValue('file_number', 'EMP-0001', { shouldValidate: true });
                }
            }
        };

        fetchLastFileNumber();
    }, [form]);

    const handleGenerateFileNumber = async () => {
        try {
            setIsGenerating(true);

            // Clear any existing error on the field
            form.clearErrors('file_number');

            try {
                // Try the simple endpoint
                const response = await axios.get('/api/employees/simple-file-number');
                console.log('Generate simple file number response:', response.data);

                if (response.data && response.data.file_number) {
                    // Set the file number
                    form.setValue('file_number', response.data.file_number, { shouldValidate: true });

                    // Update last file number for consistency
                    if (response.data.lastFileNumber) {
                        setLastFileNumber(response.data.lastFileNumber);
                    }

                    // Show success message
                    toast.success(`Unique file number ${response.data.file_number} generated`);
                    return;
                }
            } catch (apiError) {
                console.log('API call failed, generating random file number');
            }

            // Fallback to sequential generation if API fails
            let nextNumber = lastFileNumber + 1;
            if (nextNumber < 1) nextNumber = 1;
            const formattedNumber = nextNumber.toString().padStart(4, '0');
            const fileNumber = `EMP-${formattedNumber}`;
            form.setValue('file_number', fileNumber, { shouldValidate: true });
            setLastFileNumber(nextNumber);
            toast.success(`Generated file number: ${fileNumber}`);
        } catch (error) {
            console.error('Error generating file number:', error);
            let errorMessage = 'Failed to generate unique file number. Please try again.';
            if (typeof error === 'object' && error !== null && 'response' in error && (error as any).response?.data?.message) {
                errorMessage = (error as any).response.data.message;
            }
            toast.error(errorMessage);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('personal_information')}</CardTitle>
            </CardHeader>
            <CardContent>
                <Alert className="mb-6">
                    <Info className="h-4 w-4" />
                    <div className="font-semibold">Important!</div>
                    <div>Fields marked with an asterisk (*) are required. Please fill in all required fields to create an employee.</div>
                </Alert>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="file_number"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>
                                    {t('file_number')} <span className="ml-1 text-red-500">*</span>
                                </FormLabel>
                                <div className="flex space-x-2">
                                    <FormControl>
                                        <Input {...field} placeholder="Enter employee file number" />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        onClick={handleGenerateFileNumber}
                                        title={t('ttl_generate_file_number')}
                                        disabled={isGenerating}
                                    >
                                        <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>
                                    {t('lbl_first_name')} <span className="ml-1 text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter first name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>
                                    {t('lbl_last_name')} <span className="ml-1 text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter last name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>
                                    {t('email')} <span className="ml-1 text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} placeholder="name@example.com" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>
                                    {t('phone')} <span className="ml-1 text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter phone number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="nationality"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>
                                    {t('nationality')} <span className="ml-1 text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Select value={field.value || ''} onValueChange={field.onChange}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={t('ph_select_nationality')} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {countries.map((country) => (
                                                <SelectItem key={country.value} value={country.value}>{country.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="date_of_birth"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>
                                    {t('date_of_birth')} <span className="ml-1 text-red-500">*</span>
                                </FormLabel>
                                <FormControl>
                                    <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{t('address')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter address" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="city"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{t('city')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter city" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="emergency_contact_name"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{t('lbl_emergency_contact_name')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter emergency contact name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="emergency_contact_phone"
                        render={({ field }: any) => (
                            <FormItem>
                                <FormLabel>{t('lbl_emergency_contact_phone')}</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Enter emergency contact phone" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
