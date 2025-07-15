import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import useLoadingState from '../../hooks/useLoadingState';
import { OrgChartNode } from '../../types/employee';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

interface OrganizationChartProps {
  initialData?: OrgChartNode[];
}

export const OrganizationChart: React.FC<OrganizationChartProps> = ({ initialData }) => {
  const [orgData, setOrgData] = useState<OrgChartNode[]>(initialData || []);
  const { isLoading, error, withLoading } = useLoadingState('orgChart');

  useEffect(() => {
    if (!initialData) {
      fetchOrgChart();
    }
  }, [initialData]);

  const fetchOrgChart = async () => {
    await withLoading(async () => {
      const response = await axios.get('/api/departments/organization-chart');
      setOrgData(response.data.data);
    })
  };

  // Recursive component to render a department node and its children
  const DepartmentNode: React.FC<{ node: OrgChartNode; level: number }> = ({ node, level }) => {
    return (
      <div className="org-chart-node">
        <div
          className={`border rounded-lg p-4 mb-2 ${
            level === 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
          }`}
        >
          <div className="font-medium">{node.name}</div>
          {node.code && <div className="text-xs text-gray-500">Code: {node.code}</div>}
          {node.manager && (
            <div className="text-xs text-gray-500 mt-1">
              Manager: {node.manager.name}
            </div>
          )}
        </div>

        {node.children && node.children.length > 0 && (
          <div className="pl-8 border-l border-gray-300 ml-4 mt-2">
            {node.children.map((child, index) => (
              <DepartmentNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Vertical tree-like organization chart
  const renderVerticalTree = () => {
  const { t } = useTranslation('employee');

    if (orgData.length === 0) {
      return (
        <div className="py-8 text-center text-gray-500">
          No department data available
        </div>
      );
    }

    return (
      <div className="org-chart">
        {orgData.map((department) => (
          <DepartmentNode key={department.id} node={department} level={0} />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-48" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('ttl_organization_chart')}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {renderVerticalTree()}
      </CardContent>
    </Card>
  );
};

export default OrganizationChart;
















