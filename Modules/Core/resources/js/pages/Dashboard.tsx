import React from 'react';
declare global { interface Window { Inertia: any; } }
import WelcomeHero from '@/Core/components/dashboard/WelcomeHeroTemp';
import QuickStats from '@/Core/components/dashboard/QuickStats';
import DualClockWidget from '@/Core/components/dashboard/DualClockWidget';
import TeamWidget from '@/Core/components/dashboard/TeamWidget';
import SelfServiceWidget from '@/Core/components/dashboard/SelfServiceWidget';
import { DailyTimesheetRecords } from '../../../../TimesheetManagement/resources/js/components/timesheets/DailyTimesheetRecords';
// Placeholder import for TimesheetApprovalList
// import TimesheetApprovalList from '../../../../TimesheetManagement/resources/js/components/timesheets/TimesheetApprovalList';
import { AppLayout } from '@/Core';

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
      <div className="min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] py-12">
        <WelcomeHero />
        <QuickStats />
        <div className="fixed top-6 right-6 z-30 max-w-xs w-full hidden md:block">
          <DualClockWidget />
        </div>
        <div className="w-full flex justify-center mt-8">
          <div className="max-w-xl w-full">
            <div className="backdrop-blur-lg bg-white/10 border border-cyan-400/40 rounded-2xl shadow-xl p-6 flex flex-col items-start relative" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-xl opacity-40" />
              <div className="mb-2 text-lg font-semibold text-cyan-100">Current Assignment</div>
              <div className="text-white text-xl font-bold mb-1">{currentAssignment.project}</div>
              <div className="text-cyan-200 mb-1">Role: <span className="font-medium text-white">{currentAssignment.role}</span></div>
              <div className="text-cyan-200 mb-1">Status: <span className="font-medium text-emerald-300">{currentAssignment.status}</span></div>
              <div className="text-cyan-200">Start: <span className="font-medium text-white">{currentAssignment.startDate}</span></div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center mt-8">
          <div className="max-w-xl w-full">
            <TeamWidget team={team} />
          </div>
        </div>
        <div className="w-full flex justify-center mt-8">
          <SelfServiceWidget enabledModules={enabledModules} employeeId={employeeId} fullName={fullName} />
        </div>
        {/* Timesheet Approval List Section */}
        <div className="w-full max-w-3xl mx-auto mt-8">
        </div>
        <div className="w-full mt-8">
          <DailyTimesheetRecords timesheets={timesheets} selectedMonth={`${year}-${month}`} showSummary={false} />
        </div>
        {/* Add more modular widgets below (Current Assignment, Timesheet, Activity Feed, etc.) */}
      </div>
    </AppLayout>
  );
}
