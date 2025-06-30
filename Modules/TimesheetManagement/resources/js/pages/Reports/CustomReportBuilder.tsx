import React, { useState } from 'react';
import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/../../Modules/Core/resources/js/components/ui/card';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const FIELDS = [
  { key: 'date', label: 'Date' },
  { key: 'employee', label: 'Employee' },
  { key: 'project', label: 'Project' },
  { key: 'hours_worked', label: 'Hours Worked' },
  { key: 'overtime_hours', label: 'Overtime Hours' },
  { key: 'status', label: 'Status' },
];

export default function CustomReportBuilder() {
  const [selectedFields, setSelectedFields] = useState<string[]>(['date', 'employee', 'hours_worked']);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    projectId: '',
  });
  const [groupBy, setGroupBy] = useState('');
  const [report, setReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('TimesheetManagement');

  const handleFieldChange = (key: string) => {
    setSelectedFields((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGroupBy(e.target.value);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/timesheets/custom-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: selectedFields, filters, groupBy }),
      });
      const data = await res.json();
      setReport(data.report);
      setLoading(false);
    } catch (e) {
      toast.error(t('custom_report_failed', 'Failed to generate report'));
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Timesheet Report Builder</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="font-semibold mb-2">Select Fields</div>
          <div className="flex flex-wrap gap-4">
            {FIELDS.map((f) => (
              <label key={f.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedFields.includes(f.key)}
                  onChange={() => handleFieldChange(f.key)}
                />
                {f.label}
              </label>
            ))}
          </div>
        </div>
        <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Start Date</label>
            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="input" />
          </div>
          <div>
            <label className="block mb-1">End Date</label>
            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="input" />
          </div>
          <div>
            <label className="block mb-1">Employee ID</label>
            <input type="text" name="employeeId" value={filters.employeeId} onChange={handleFilterChange} className="input" />
          </div>
          <div>
            <label className="block mb-1">Project ID</label>
            <input type="text" name="projectId" value={filters.projectId} onChange={handleFilterChange} className="input" />
          </div>
        </div>
        <div className="mb-4">
          <label className="block mb-1">Group By</label>
          <select value={groupBy} onChange={handleGroupByChange} className="input">
            <option value="">None</option>
            <option value="date">Date</option>
            <option value="employee">Employee</option>
            <option value="project">Project</option>
          </select>
        </div>
        <Button onClick={generateReport} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
        <div className="mt-8">
          <div className="font-semibold mb-2">Report Results</div>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  {selectedFields.map((f) => (
                    <th key={f} className="border px-2 py-1 text-left">{FIELDS.find((fld) => fld.key === f)?.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report.map((row, i) => (
                  <tr key={i}>
                    {selectedFields.map((f) => (
                      <td key={f} className="border px-2 py-1">{row[f]}</td>
                    ))}
                  </tr>
                ))}
                {report.length === 0 && (
                  <tr>
                    <td colSpan={selectedFields.length} className="text-center text-muted-foreground py-4">
                      No data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
