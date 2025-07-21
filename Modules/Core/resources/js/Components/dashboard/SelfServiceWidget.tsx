import React from 'react';
import { FileDown, User, Wallet, Plane, FilePlus2, Calendar, Briefcase, ClipboardList, Users, BookOpen, Bell, LifeBuoy, BarChart3, Smartphone, FileText, ArrowUpRight, ArrowDownLeft, Award, FolderPlus, ShieldCheck, } from 'lucide-react';

interface SelfServiceWidgetProps {
  enabledModules: string[];
  employeeId?: number;
  fullName?: string;
}

const moduleActions = [
  { module: 'EmployeeManagement', label: 'Update Profile', icon: <User className="h-5 w-5" />, color: 'bg-blue-700 hover:bg-blue-800', href: '/profile' },
  { module: 'EmployeeManagement', label: 'Upload/View Documents', icon: <FilePlus2 className="h-5 w-5" />, color: 'bg-yellow-700 hover:bg-yellow-800', href: (employeeId: number | undefined) => employeeId ? `/employees/${employeeId}?tab=documents` : '/employees' },
  { module: 'PayrollManagement', label: 'Download Payslip', icon: <FileDown className="h-5 w-5" />, color: 'bg-emerald-700 hover:bg-emerald-800', href: '/payroll' },
  { module: 'PayrollManagement', label: 'Submit Expense', icon: <Wallet className="h-5 w-5" />, color: 'bg-teal-700 hover:bg-teal-800', href: '/expenses' },
  { module: 'PayrollManagement', label: 'Request Advance Payment', icon: <ArrowUpRight className="h-5 w-5" />, color: 'bg-orange-700 hover:bg-orange-800', href: (employeeId: number) => `/employees/${employeeId}?tab=advances` },
  { module: 'LeaveManagement', label: 'Request Leave', icon: <Plane className="h-5 w-5" />, color: 'bg-cyan-700 hover:bg-cyan-800', href: '/leaves' },
  { module: 'LeaveManagement', label: 'View Leave Balance', icon: <FileText className="h-5 w-5" />, color: 'bg-cyan-800 hover:bg-cyan-900', href: '/leaves/balance' },
  { module: 'TimesheetManagement', label: 'Submit Timesheet', icon: <ClipboardList className="h-5 w-5" />, color: 'bg-purple-700 hover:bg-purple-800', href: '/timesheets' },
  { module: 'TimesheetManagement', label: 'View Timesheet History', icon: <Calendar className="h-5 w-5" />, color: 'bg-purple-800 hover:bg-purple-900', href: '/timesheets/history' },
  { module: 'ProjectManagement', label: 'View/Request Assignments', icon: <Briefcase className="h-5 w-5" />, color: 'bg-pink-700 hover:bg-pink-800', href: '/projects' },
  { module: 'RentalManagement', label: 'View/Request Assignments', icon: <Calendar className="h-5 w-5" />, color: 'bg-orange-700 hover:bg-orange-800', href: '/rentals' },
  { module: 'EmployeeManagement', label: 'View Team', icon: <Users className="h-5 w-5" />, color: 'bg-cyan-900 hover:bg-cyan-950', href: '/team' },
  { module: 'EmployeeManagement', label: 'Performance Review', icon: <Award className="h-5 w-5" />, color: 'bg-green-800 hover:bg-green-900', href: '/performance' },
  { module: 'EmployeeManagement', label: 'Training', icon: <BookOpen className="h-5 w-5" />, color: 'bg-indigo-700 hover:bg-indigo-800', href: '/training' },
  { module: 'Notifications', label: 'View Announcements', icon: <Bell className="h-5 w-5" />, color: 'bg-yellow-800 hover:bg-yellow-900', href: '/announcements' },
  { module: 'MobileBridge', label: 'Submit Support Ticket', icon: <LifeBuoy className="h-5 w-5" />, color: 'bg-red-700 hover:bg-red-800', href: '/support' },
  { module: 'ProjectManagement', label: 'View Projects', icon: <Briefcase className="h-5 w-5" />, color: 'bg-pink-700 hover:bg-pink-800', href: '/projects' },
  { module: 'RentalManagement', label: 'View Rentals', icon: <Calendar className="h-5 w-5" />, color: 'bg-orange-700 hover:bg-orange-800', href: '/rentals' },
  { module: 'EquipmentManagement', label: 'View Equipment', icon: <ShieldCheck className="h-5 w-5" />, color: 'bg-gray-700 hover:bg-gray-800', href: '/equipment' },
  { module: 'MobileBridge', label: 'Access Mobile App', icon: <Smartphone className="h-5 w-5" />, color: 'bg-blue-900 hover:bg-blue-950', href: '/mobile' },
  { module: 'Reporting', label: 'View Reports', icon: <BarChart3 className="h-5 w-5" />, color: 'bg-emerald-900 hover:bg-emerald-950', href: '/reporting' },
];

const SelfServiceWidget: React.FC<SelfServiceWidgetProps> = ({ enabledModules, employeeId, fullName }) => {
  const actions = moduleActions.filter(a => enabledModules.includes(a.module)).filter(a => {
    if (a.label === 'Request Advance Payment') {
      return !!employeeId;
    }
    return true;
  });
  return (
    <div className="backdrop-blur-lg bg-white/10 border border-cyan-400/40 rounded-2xl shadow-xl p-6 flex flex-col items-start relative w-full" style={{ boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37)' }}>
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded-full blur-xl opacity-40" />
      {fullName && (
        <div className="mb-2 text-xl font-bold text-cyan-200 drop-shadow-glow w-full text-center">Welcome, {fullName}</div>
      )}
      <div className="mb-4 text-lg font-semibold text-cyan-100">Employee Self Service</div>
      <div className="flex flex-row gap-2 w-full overflow-x-auto pb-2">
        {actions.length === 0 && <div className="text-cyan-200">No self-service actions available.</div>}
        {actions.map((action, idx) => {
          let href = typeof action.href === 'function' ? (typeof employeeId === 'number' ? action.href(employeeId) : '/employees') : action.href;
          return (
            <a
              key={`${action.label}-${action.module}`}
              href={href}
              className={`flex items-center gap-2 px-2 py-1 rounded-lg text-white text-sm font-medium transition ${action.color} shadow`}
            >
              {action.icon}
              {action.label}
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default SelfServiceWidget;
