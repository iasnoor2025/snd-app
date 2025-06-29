import React, { useState } from 'react';
import { Button } from '@/../../Modules/Core/resources/js/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/../../Modules/Core/resources/js/components/ui/card';
import { toast } from 'sonner';

export default function BillableHoursReport() {
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    employeeId: '',
    projectId: '',
  });
  const [report, setReport] = useState<any>({ totalBillable: 0, totalNonBillable: 0, entries: [] });
  const [loading, setLoading] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/timesheets/billable-hours-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });
      const data = await res.json();
      setReport(data);
      setLoading(false);
    } catch (e) {
      toast.error('Failed to generate billable hours report');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Billable Hours Report</CardTitle>
      </CardHeader>
      <CardContent>
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
        <Button onClick={generateReport} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
        <div className="mt-8">
          <div className="font-semibold mb-2">Totals</div>
          <div className="flex gap-8 mb-4">
            <div>Billable Hours: <span className="font-bold">{report.totalBillable}</span></div>
            <div>Non-Billable Hours: <span className="font-bold">{report.totalNonBillable}</span></div>
          </div>
          <div className="font-semibold mb-2">Entries</div>
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead>
                <tr>
                  <th className="border px-2 py-1">Date</th>
                  <th className="border px-2 py-1">Employee</th>
                  <th className="border px-2 py-1">Project</th>
                  <th className="border px-2 py-1">Hours</th>
                  <th className="border px-2 py-1">Billable</th>
                </tr>
              </thead>
              <tbody>
                {report.entries.map((row: any, i: number) => (
                  <tr key={i}>
                    <td className="border px-2 py-1">{row.date}</td>
                    <td className="border px-2 py-1">{row.employee}</td>
                    <td className="border px-2 py-1">{row.project}</td>
                    <td className="border px-2 py-1">{row.hours}</td>
                    <td className="border px-2 py-1">{row.is_billable ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
                {report.entries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted-foreground py-4">
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
