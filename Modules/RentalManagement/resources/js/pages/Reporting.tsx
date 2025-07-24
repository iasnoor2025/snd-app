import { AppLayout, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core';
import { BarChart3 } from 'lucide-react';

export default function RentalManagementReporting() {
    return (
        <AppLayout title="Reporting">
            <div className="container mx-auto py-12">
                <Card className="mx-auto max-w-xl text-center">
                    <CardHeader className="flex flex-col items-center">
                        <BarChart3 className="mb-2 h-10 w-10 text-primary" />
                        <CardTitle>Reporting Moved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription className="mb-4">
                            The reporting dashboard has moved. Please use the main reporting dashboard for all analytics and reports.
                        </CardDescription>
                        <a href="/reporting">
                            <Button variant="default">Go to Reporting Dashboard</Button>
                        </a>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
