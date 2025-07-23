import {
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/Core';
import axios from 'axios';
import { addMonths, endOfMonth, format, startOfMonth, subMonths } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, List, Plus, Upload } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import BulkTimesheetUpload from '../../Components/timesheets/BulkTimesheetUpload';
import TimesheetCalendar from '../../Components/timesheets/TimesheetCalendar';
import TimesheetList from '../../Components/timesheets/TimesheetList';
import useLoadingState from '../../hooks/useLoadingState';
import { Employee } from '../../types/employee';
import { EmployeeTimesheet } from '../../types/timesheet';

const TimesheetManagement: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('timesheet');
    const { isLoading, error, withLoading } = useLoadingState('timesheetManagement');

    const [activeTab, setActiveTab] = useState('calendar');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [timesheets, setTimesheets] = useState<EmployeeTimesheet[]>([]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        fetchTimesheets();
    }, [selectedEmployeeId, currentMonth]);

    const fetchEmployees = async () => {
        await withLoading(async () => {
            const response = await axios.get('/api/employees');
            setEmployees(response.data.data);
        });
    };

    const fetchTimesheets = async () => {
        await withLoading(async () => {
            const startDate = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

            let url = `/api/timesheets?start_date=${startDate}&end_date=${endDate}`;

            if (selectedEmployeeId !== 'all') {
                url += `&employee_id=${selectedEmployeeId}`;
            }

            const response = await axios.get(url);
            setTimesheets(response.data.data);
        });
    };

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    const handleCreateTimesheet = () => {
        navigate('/hr/timesheets/create');
    };

    const handleBulkApprove = async (timesheetIds: number[]) => {
        await withLoading(async () => {
            await axios.post('/api/timesheets/bulk-approve', { timesheet_ids: timesheetIds });
            fetchTimesheets();
        });
    };

    return (
        <div className="container mx-auto space-y-6 py-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <Breadcrumbs
                        breadcrumbs={[
                            { title: 'Dashboard', href: '/' },
                            { title: 'Timesheet Management', href: '#' },
                        ]}
                    />
                    <h1 className="text-3xl font-bold tracking-tight">{t('timesheet_management')}</h1>
                    <p className="text-muted-foreground">View, create, and manage employee timesheets</p>
                </div>
                <Button onClick={handleCreateTimesheet} className="flex items-center gap-1">
                    <Plus className="h-4 w-4" />
                    New Timesheet
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <CardTitle>{t('ttl_employee_timesheets')}</CardTitle>

                        <div className="flex items-center gap-2">
                            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                                <SelectTrigger className="w-[220px]">
                                    <SelectValue placeholder={t('ph_select_employee')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">{t('all_employees')}</SelectItem>
                                    {employees.map((employee) => (
                                        <SelectItem key={employee.id} value={employee.id.toString()}>
                                            {employee.first_name} {employee.last_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="min-w-[120px] px-2 text-center font-medium">{format(currentMonth, 'MMMM yyyy')}</div>
                                <Button variant="outline" size="icon" onClick={handleNextMonth}>
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                            <TabsTrigger value="calendar" className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Calendar View
                            </TabsTrigger>
                            <TabsTrigger value="list" className="flex items-center gap-1">
                                <List className="h-4 w-4" />
                                List View
                            </TabsTrigger>
                            <TabsTrigger value="upload" className="flex items-center gap-1">
                                <Upload className="h-4 w-4" />
                                Bulk Upload
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="calendar">
                            <TimesheetCalendar
                                timesheets={timesheets}
                                currentMonth={currentMonth}
                                employees={employees}
                                onTimesheetCreated={fetchTimesheets}
                            />
                        </TabsContent>

                        <TabsContent value="list">
                            <TimesheetList
                                timesheets={timesheets}
                                isLoading={isLoading}
                                onApprove={fetchTimesheets}
                                onReject={fetchTimesheets}
                                onBulkApprove={handleBulkApprove}
                            />
                        </TabsContent>

                        <TabsContent value="upload">
                            <BulkTimesheetUpload onUploadComplete={fetchTimesheets} />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default TimesheetManagement;
