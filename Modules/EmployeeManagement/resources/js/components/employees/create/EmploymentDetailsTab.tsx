import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Input } from "@/Core";
import { Label } from "@/Core";
import PositionSelector from './PositionSelector';

interface Position {
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
}

interface EmploymentDetailsData {
    position_id: number | null;
    department: string;
    employment_status: string;
    hire_date: string;
    termination_date: string | null;
}

interface EmploymentDetailsTabProps {
    data: EmploymentDetailsData;
    positions: Position[];
    onSaveDraft: (data: EmploymentDetailsData) => void;
    isSubmitting: boolean;
}

export function EmploymentDetailsTab({ data, positions, onSaveDraft, isSubmitting }: EmploymentDetailsTabProps) {
  const { t } = useTranslation('employee');

    const handleChange = (field: keyof EmploymentDetailsData, value: any) => {
        onSaveDraft({
            ...data,
            [field]: value
        })
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('employment_details')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <PositionSelector
                        value={data.position_id}
                        onChange={(value) => handleChange('position_id', value)}
                        initialPositions={positions}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                        id="department"
                        value={data.department || ''}
                        onChange={(e) => handleChange('department', e.target.value)}
                        placeholder={t('ph_enter_department')}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="employment_status">{t('lbl_employment_status')}</Label>
                    <Input
                        id="employment_status"
                        value={data.employment_status || ''}
                        onChange={(e) => handleChange('employment_status', e.target.value)}
                        placeholder={t('ph_enter_employment_status')}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="hire_date">{t('hire_date')}</Label>
                    <Input
                        id="hire_date"
                        type="date"
                        value={data.hire_date || ''}
                        onChange={(e) => handleChange('hire_date', e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="termination_date">Termination Date (Optional)</Label>
                    <Input
                        id="termination_date"
                        type="date"
                        value={data.termination_date || ''}
                        onChange={(e) => handleChange('termination_date', e.target.value || null)}
                        disabled={isSubmitting}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
















