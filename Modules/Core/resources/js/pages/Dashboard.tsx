import React from 'react';
declare global { interface Window { Inertia: any; } }
import WelcomeHero from '@/Core/Components/dashboard/WelcomeHero';
import QuickStats from '@/Core/Components/dashboard/QuickStats';
import DualClockWidget from '@/Core/Components/dashboard/DualClockWidget';
import TeamWidget from '@/Core/Components/dashboard/TeamWidget';
import SelfServiceWidget from '@/Core/Components/dashboard/SelfServiceWidget';
import { DailyTimesheetRecords } from '../../../../TimesheetManagement/resources/js/components/timesheets/DailyTimesheetRecords';
import { AppLayout } from '@/Core';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Core/Components/ui/card';
import { Badge } from '@/Core/Components/ui/badge';
import { Button } from '@/Core/Components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/Core/Components/ui/hover-card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/Core/Components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/Core/Components/ui/popover';
import { Calendar, Clock, Users, TrendingUp, AlertCircle, CheckCircle, UserCheck, Search, Settings, Bell, Mail, Plus } from 'lucide-react';

// Generate mock timesheet data for the current month
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, '0');
const daysInMonth = new Date(year, now.getMonth() + 1, 0).getDate();
const timesheets = Array.from({ length: daysInMonth }, (_, i) => {
  const date = `${year}-${month}-${String(i + 1).padStart(2, '0')}`;
  const day = String(i + 1);
  const dayName = new Date(year, now.getMonth(), i + 1).toLocaleDateString('en-US', { weekday: 'short' });
  // Mark Fridays as 'friday', some days as 'absent', others as present
  const weekday = new Date(year, now.getMonth(), i + 1).getDay();
  let status = 'present';
  let regularHours = 8;
  let overtimeHours = 0;
  if (weekday === 5) {
    status = 'friday';
    regularHours = 0;
  } else if (i % 7 === 2) {
    status = 'absent';
    regularHours = 0;
  } else if (i % 7 === 4) {
    status = 'present';
    regularHours = 8;
    overtimeHours = 2;
  }
  return { date, day, dayName, regularHours, overtimeHours, status };
});

// Mock current assignment data
const currentAssignment = {
  project: 'Downtown Tower Construction',
  role: 'Site Engineer',
  status: 'Active',
  startDate: '2024-06-01',
  endDate: null,
};

// Mock team data
const team = [
  { name: 'Ali Hassan', role: 'Foreman', status: 'Active' },
  { name: 'Sara Ahmed', role: 'Engineer', status: 'Active' },
  { name: 'Mohammed Noor', role: 'Laborer', status: 'Active' },
  { name: 'Fatima Yousuf', role: 'Safety Officer', status: 'On Leave' },
  { name: 'Omar Khalid', role: 'Electrician', status: 'Active' },
  { name: 'Aisha Rahman', role: 'Laborer', status: 'Active' },
];

// Mock stats data
const stats = [
  {
    title: 'Total Hours',
    value: '156',
    change: '+12%',
    changeType: 'positive',
    icon: Clock,
  },
  {
    title: 'Active Projects',
    value: '3',
    change: '+1',
    changeType: 'positive',
    icon: TrendingUp,
  },
  {
    title: 'Team Members',
    value: '12',
    change: '+2',
    changeType: 'positive',
    icon: Users,
  },
  {
    title: 'Pending Approvals',
    value: '5',
    change: '-2',
    changeType: 'negative',
    icon: AlertCircle,
  },
];

// Mock quick actions
const quickActions = [
  { name: 'Log Time', icon: Clock, href: '/timesheets/create' },
  { name: 'Request Leave', icon: Calendar, href: '/leave/create' },
  { name: 'Report Issue', icon: AlertCircle, href: '/issues/create' },
  { name: 'Team Chat', icon: Users, href: '/chat' },
];

// Mock recent activities
const recentActivities = [
  {
    id: 1,
    title: 'Time logged for Downtown Tower',
    description: 'Logged 8 hours for site inspection',
    time: '2 hours ago',
    type: 'timesheet',
    color: 'bg-green-500',
  },
  {
    id: 2,
    title: 'Leave request approved',
    description: 'Your leave request for next week has been approved',
    time: '1 day ago',
    type: 'leave',
    color: 'bg-blue-500',
  },
  {
    id: 3,
    title: 'New project assigned',
    description: 'You have been assigned to the Marina Project',
    time: '3 days ago',
    type: 'project',
    color: 'bg-purple-500',
  },
];

const enabledModules = [
  'LeaveManagement',
  'PayrollManagement',
  'EmployeeManagement',
  'TimesheetManagement',
  'ProjectManagement',
  'RentalManagement',
];

export default function Dashboard() {
  const user = window?.Inertia?.page?.props?.auth?.user;
  let employeeId = user?.employee?.id;
  // Fallback: if user.type === 'employee' and user.id exists, use user.id
  if (!employeeId && user?.type === 'employee' && user?.id) {
    employeeId = user.id;
  }
  // Debug log if employeeId is missing
  if (!employeeId) {
    // Optionally, fetch employeeId from an API or show a warning
    // console.warn('No employeeId found for user', user);
  }
  const fullName = user?.employee?.full_name || user?.name || '';

  return (
    <AppLayout title="Dashboard">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header Section */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
          <div className="relative px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Welcome back, {fullName.split(' ')[0]}!
                  </h1>
                  <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Here's what's happening with your projects today.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Search Command */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="hidden md:flex">
                        <Search className="h-4 w-4 mr-2" />
                        Search...
                        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                          <span className="text-xs">⌘</span>K
                        </kbd>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="end">
                      <Command>
                        <CommandInput placeholder="Search projects, timesheets, team..." />
                        <CommandList>
                          <CommandEmpty>No results found.</CommandEmpty>
                          <CommandGroup heading="Quick Actions">
                            <CommandItem>
                              <Clock className="mr-2 h-4 w-4" />
                              <span>Log Time</span>
                            </CommandItem>
                            <CommandItem>
                              <Calendar className="mr-2 h-4 w-4" />
                              <span>Request Leave</span>
                            </CommandItem>
                            <CommandItem>
                              <AlertCircle className="mr-2 h-4 w-4" />
                              <span>Report Issue</span>
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  {/* Notifications */}
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>

                  {/* Clock Widget */}
                  <div className="hidden md:block">
                    <DualClockWidget />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <HoverCard key={index}>
                  <HoverCardTrigger asChild>
                    <Card className="relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                          {stat.title}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">
                          {stat.value}
                        </div>
                        <p className={`text-xs ${
                          stat.changeType === 'positive'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {stat.change} from last month
                        </p>
                      </CardContent>
                    </Card>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="flex justify-between space-x-4">
                      <div>
                        <h4 className="text-sm font-semibold">{stat.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Current value: {stat.value}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Change: {stat.change} from last month
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* Current Assignment */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5" />
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                      <CardTitle>Current Assignment</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Your active project and role information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                        {currentAssignment.project}
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        Role: {currentAssignment.role}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={currentAssignment.status === 'Active' ? 'default' : 'secondary'}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {currentAssignment.status}
                      </Badge>
                      <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                        <Calendar className="h-4 w-4" />
                        <span>Started: {currentAssignment.startDate}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Team Widget */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <CardTitle>Team Overview</CardTitle>
                    </div>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardDescription>
                    Your team members and their current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamWidget team={team} />
                </CardContent>
              </Card>

              {/* Timesheet Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Monthly Timesheet</CardTitle>
                  <CardDescription>
                    Your timesheet records for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DailyTimesheetRecords timesheets={timesheets} selectedMonth={`${year}-${month}`} showSummary={false} />
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Access frequently used features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {quickActions.map((action, index) => (
                    <Button key={index} variant="outline" className="w-full justify-start">
                      <action.icon className="h-4 w-4 mr-2" />
                      {action.name}
                    </Button>
                  ))}
                </CardContent>
              </Card>

              {/* Self Service Widget */}
              <Card>
                <CardHeader>
                  <CardTitle>Self Service</CardTitle>
                  <CardDescription>
                    Manage your account and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SelfServiceWidget enabledModules={enabledModules} employeeId={employeeId} fullName={fullName} />
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    Your latest activities and updates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900 dark:text-white">
                            {activity.title}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {activity.description}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-500">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
