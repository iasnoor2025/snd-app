import { Button, Card, CardContent, CardHeader, CardTitle, DatePicker, Input, Label } from '@/Core';
import axios from 'axios';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';

interface SettlementData {
    last_working_date: Date | null;
    unused_leaves: number;
    notice_period_served: number;
    unpaid_salary: number;
    deductions: number;
    bonuses: number;
}

export default function SettlementDocument() {
    const { employeeId } = useParams<{ employeeId: string }>();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SettlementData>({
        last_working_date: null,
        unused_leaves: 0,
        notice_period_served: 0,
        unpaid_salary: 0,
        deductions: 0,
        bonuses: 0,
    });

    const handleGenerate = async () => {
        if (!data.last_working_date) {
            toast.error('Please select the last working date');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post(`/api/employees/${employeeId}/settlement`, {
                ...data,
                last_working_date: data.last_working_date.toISOString().split('T')[0],
            });

            // Open PDF in new tab
            const pdfUrl = `/storage/${response.data.path}`;
            window.open(pdfUrl, '_blank');

            toast.success('Settlement document generated successfully');
        } catch (error) {
            toast.error('Failed to generate settlement document');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader>
                    <CardTitle>Generate Settlement Document</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="last_working_date">Last Working Date</Label>
                            <DatePicker
                                value={data.last_working_date}
                                onChange={(date) =>
                                    setData((prev) => ({
                                        ...prev,
                                        last_working_date: date,
                                    }))
                                }
                            />
                        </div>
                        <div>
                            <Label htmlFor="unused_leaves">Unused Leaves</Label>
                            <Input
                                id="unused_leaves"
                                type="number"
                                value={data.unused_leaves}
                                onChange={(e) =>
                                    setData((prev) => ({
                                        ...prev,
                                        unused_leaves: parseInt(e.target.value) || 0,
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="notice_period_served">Notice Period Served (Days)</Label>
                            <Input
                                id="notice_period_served"
                                type="number"
                                value={data.notice_period_served}
                                onChange={(e) =>
                                    setData((prev) => ({
                                        ...prev,
                                        notice_period_served: parseInt(e.target.value) || 0,
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="unpaid_salary">Unpaid Salary</Label>
                            <Input
                                id="unpaid_salary"
                                type="number"
                                value={data.unpaid_salary}
                                onChange={(e) =>
                                    setData((prev) => ({
                                        ...prev,
                                        unpaid_salary: parseFloat(e.target.value) || 0,
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="deductions">Deductions</Label>
                            <Input
                                id="deductions"
                                type="number"
                                value={data.deductions}
                                onChange={(e) =>
                                    setData((prev) => ({
                                        ...prev,
                                        deductions: parseFloat(e.target.value) || 0,
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="bonuses">Bonuses</Label>
                            <Input
                                id="bonuses"
                                type="number"
                                value={data.bonuses}
                                onChange={(e) =>
                                    setData((prev) => ({
                                        ...prev,
                                        bonuses: parseFloat(e.target.value) || 0,
                                    }))
                                }
                                className="mt-1"
                            />
                        </div>
                        <Button onClick={handleGenerate} disabled={loading}>
                            {loading ? 'Generating...' : 'Generate Settlement Document'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
