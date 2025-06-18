import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Modal from '../../../../../../Modules/TimesheetManagement/resources/js/components/Modal';
import { Textarea } from '@/components/ui/textarea';

// Minimal placeholder formatDate and formatHours functions
const formatDate = (date) => date ? String(date) : '';
const formatHours = (hours) => hours != null ? String(hours) : '';

// Minimal placeholder TextInput component
const TextInput = (props) => <input {...props} />;

// Minimal placeholder Label component
const Label = (props) => <label {...props} />;

// Minimal placeholder InputError component
const InputError = ({ message }) => message ? <div style={{ color: 'red' }}>{message}</div> : null;

// Minimal placeholder SelectInput component
const SelectInput = (props) => <select {...props}>{props.children}</select>;

// Minimal placeholder FormSection component
const FormSection = ({ children }) => <section>{children}</section>;

// Minimal placeholder InputGroup component
const InputGroup = ({ children }) => <div>{children}</div>;

// Minimal placeholder Table component
const Table = ({ children }) => <table>{children}</table>;

// Minimal placeholder Pagination component
const Pagination = () => null;

// Minimal placeholder Badge component
const Badge = ({ children }) => <span>{children}</span>;

const TimesheetApprovalsIndex = ({ timesheets, employees, filters, canViewAll }) => {
  const { t } = useTranslation('timesheet');

  const [rejectingTimesheet, setRejectingTimesheet] = useState(null);
  const [approvingTimesheet, setApprovingTimesheet] = useState(null);

  const filterForm = useForm({
    employee_id: filters.employee_id || '',
    department_id: filters.department_id || '',
    show_all: filters.show_all || false,
  });

  const approvalForm = useForm({
    notes: '',
  });

  const rejectionForm = useForm({
    rejection_reason: '',
  });

  const handleApprove = (timesheet) => {
    setApprovingTimesheet(timesheet);
  };

  const handleReject = (timesheet) => {
    setRejectingTimesheet(timesheet);
  };

  const submitApproval = () => {
    approvalForm.post(route('timesheets.approvals.approve', approvingTimesheet.id), {
      onSuccess: () => {
        setApprovingTimesheet(null);
        approvalForm.reset();
      },
    });
  };

  const submitRejection = () => {
    rejectionForm.post(route('timesheets.approvals.reject', rejectingTimesheet.id), {
      onSuccess: () => {
        setRejectingTimesheet(null);
        rejectionForm.reset();
      },
    });
  };

  const handleFilterChange = () => {
    filterForm.get(route('timesheets.approvals.index'), {
      preserveState: true,
    });
  };

  return (
    <AppLayout>
      <Head title={t('timesheet_approvals')} />

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('timesheet_approvals')}</h1>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="employee_id">Employee</Label>
                  <SelectInput
                    id="employee_id"
                    name="employee_id"
                    value={filterForm.data.employee_id}
                    onChange={(e) => {
                      filterForm.setData('employee_id', e.target.value);
                      setTimeout(handleFilterChange, 100);
                    }}
                  >
                    <option value="">{t('all_employees')}</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.first_name} {employee.last_name}
                      </option>
                    ))}
                  </SelectInput>
                </div>

                {canViewAll && (
                  <div>
                    <div className="flex items-center mt-7">
                      <input
                        id="show_all"
                        name="show_all"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        checked={filterForm.data.show_all}
                        onChange={(e) => {
                          filterForm.setData('show_all', e.target.checked);
                          setTimeout(handleFilterChange, 100);
                        }}
                      />
                      <label htmlFor="show_all" className="ml-2 block text-sm text-gray-900">
                        Show all timesheets
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                <h2 className="text-lg font-medium text-gray-900">{t('timesheets_pending_approval')}</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Employee</Table.HeaderCell>
                    <Table.HeaderCell>Week</Table.HeaderCell>
                    <Table.HeaderCell>Hours</Table.HeaderCell>
                    <Table.HeaderCell>Submitted</Table.HeaderCell>
                    <Table.HeaderCell className="text-right">Actions</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {timesheets.data.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={5} className="text-center py-4">
                        No timesheets pending approval
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    timesheets.data.map((timesheet) => (
                      <Table.Row key={timesheet.id}>
                        <Table.Cell>
                          {timesheet.employee?.first_name} {timesheet.employee?.last_name}
                        </Table.Cell>
                        <Table.Cell>
                          {formatDate(timesheet.week_start_date)} - {formatDate(timesheet.week_end_date)}
                        </Table.Cell>
                        <Table.Cell>
                          <div>{formatHours(timesheet.total_hours)} Total</div>
                          <div className="text-xs text-gray-500">
                            {formatHours(timesheet.regular_hours)} Regular / {formatHours(timesheet.overtime_hours)} Overtime
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          {formatDate(timesheet.submitted_at, true)}
                        </Table.Cell>
                        <Table.Cell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={route('timesheets.weekly.show', timesheet.id)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              View
                            </Link>
                            <button
                              type="button"
                              className="text-green-600 hover:text-green-800"
                              onClick={() => handleApprove(timesheet)}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-800"
                              onClick={() => handleReject(timesheet)}
                            >
                              Reject
                            </button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table>

              <div className="px-4 py-3 border-t border-gray-200">
                <Pagination links={timesheets.links} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approval Modal */}
      <Modal
        show={!!approvingTimesheet}
        onClose={() => setApprovingTimesheet(null)}
        maxWidth="md"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            {t('approve_timesheet')}
          </h2>

          <div className="mt-4">
            <p>
              Are you sure you want to approve the timesheet for{' '}
              <span className="font-semibold">
                {approvingTimesheet?.employee?.first_name} {approvingTimesheet?.employee?.last_name}
              </span>{' '}
              for the week of{' '}
              <span className="font-semibold">
                {formatDate(approvingTimesheet?.week_start_date)} - {formatDate(approvingTimesheet?.week_end_date)}
              </span>
              ?
            </p>

            <div className="mt-4">
              <Label htmlFor="approval_notes" value="Notes (Optional)" />
              <Textarea
                id="approval_notes"
                className="mt-1 block w-full"
                value={approvalForm.data.notes}
                onChange={(e) => approvalForm.setData('notes', e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setApprovingTimesheet(null)}
                disabled={approvalForm.processing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={submitApproval}
                disabled={approvalForm.processing}
              >
                {t('approve_timesheet')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        show={!!rejectingTimesheet}
        onClose={() => setRejectingTimesheet(null)}
        maxWidth="md"
      >
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900">
            {t('reject_timesheet')}
          </h2>

          <div className="mt-4">
            <p>
              Are you sure you want to reject the timesheet for{' '}
              <span className="font-semibold">
                {rejectingTimesheet?.employee?.first_name} {rejectingTimesheet?.employee?.last_name}
              </span>{' '}
              for the week of{' '}
              <span className="font-semibold">
                {formatDate(rejectingTimesheet?.week_start_date)} - {formatDate(rejectingTimesheet?.week_end_date)}
              </span>
              ?
            </p>

            <div className="mt-4">
              <Label htmlFor="rejection_reason" value="Reason for Rejection *" />
              <Textarea
                id="rejection_reason"
                className="mt-1 block w-full"
                value={rejectionForm.data.rejection_reason}
                onChange={(e) => rejectionForm.setData('rejection_reason', e.target.value)}
                required
              />
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRejectingTimesheet(null)}
                disabled={rejectionForm.processing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={submitRejection}
                disabled={rejectionForm.processing || !rejectionForm.data.rejection_reason}
              >
                {t('reject_timesheet')}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </AppLayout>
  );
};

export default TimesheetApprovalsIndex;
