import { AppLayout, Button, Card, CardContent, CardHeader, CardTitle } from '@/Core';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BarChart, Construction } from 'lucide-react';

export default function ProjectReportsIndex() {
    return (
        <AppLayout title="Project Reports">
            <Head title="Project Reports" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Project Reports</h1>
                        <p className="text-muted-foreground">Project analytics and insights</p>
                    </div>
                    <Button variant="outline" asChild>
                        <Link href="/reports">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Main Reports
                        </Link>
                    </Button>
                </div>

                {/* Coming Soon Card */}
                <Card className="py-16 text-center">
                    <CardHeader>
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                            <Construction className="h-8 w-8 text-orange-600" />
                        </div>
                        <CardTitle className="text-2xl">Project Reports Coming Soon</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="mx-auto max-w-md text-muted-foreground">
                            We're working on comprehensive project reporting features including progress tracking, resource utilization, cost
                            analysis, and performance metrics.
                        </p>
                        <div className="flex justify-center space-x-4">
                            <Button variant="outline" asChild>
                                <Link href="/projects">View Projects</Link>
                            </Button>
                            <Button asChild>
                                <Link href="/reports">
                                    <BarChart className="mr-2 h-4 w-4" />
                                    Main Reports Dashboard
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
