import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Book,
    Code,
    Copy,
    Play,
    Key,
    ArrowLeft,
    CheckCircle,
    AlertCircle,
    Info,
    Terminal
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/auth-layout';

interface Props {
    apiVersion: string;
    apiVersions: string[];
    defaultVersion: string;
    auth: {
        user: any;
    };
}

const APIDocumentation: React.FC<Props> = ({ apiVersion, apiVersions, defaultVersion, auth }) => {
    const [selectedEndpoint, setSelectedEndpoint] = useState<string | null>(null);
    const [testToken, setTestToken] = useState('');
    const [testResponse, setTestResponse] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const apiSections = [
        {
            title: 'Authentication',
            description: 'Learn how to authenticate with the API using tokens',
            endpoints: [
                {
                    method: 'POST',
                    path: '/api/auth/login',
                    title: 'Login',
                    description: 'Authenticate user and receive API token',
                    parameters: [
                        { name: 'email', type: 'string', required: true, description: 'User email address' },
                        { name: 'password', type: 'string', required: true, description: 'User password' }
                    ],
                    example: {
                        request: {
                            email: 'user@example.com',
                            password: 'password123'
                        },
                        response: {
                            token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
                            user: {
                                id: 1,
                                name: 'John Doe',
                                email: 'user@example.com'
                            }
                        }
                    }
                }
            ]
        },
        {
            title: 'Employee Management',
            description: 'Manage employee data and information',
            endpoints: [
                {
                    method: 'GET',
                    path: '/api/v1/employees',
                    title: 'List Employees',
                    description: 'Retrieve a paginated list of employees',
                    parameters: [
                        { name: 'page', type: 'integer', required: false, description: 'Page number for pagination' },
                        { name: 'per_page', type: 'integer', required: false, description: 'Number of items per page (max 100)' },
                        { name: 'search', type: 'string', required: false, description: 'Search term for filtering employees' }
                    ],
                    example: {
                        response: {
                            data: [
                                {
                                    id: 1,
                                    employee_id: 'EMP001',
                                    first_name: 'John',
                                    last_name: 'Doe',
                                    email: 'john.doe@company.com',
                                    department: 'Engineering',
                                    position: 'Software Developer'
                                }
                            ],
                            meta: {
                                current_page: 1,
                                total: 50,
                                per_page: 15
                            }
                        }
                    }
                },
                {
                    method: 'POST',
                    path: '/api/v1/employees',
                    title: 'Create Employee',
                    description: 'Create a new employee record',
                    parameters: [
                        { name: 'first_name', type: 'string', required: true, description: 'Employee first name' },
                        { name: 'last_name', type: 'string', required: true, description: 'Employee last name' },
                        { name: 'email', type: 'string', required: true, description: 'Employee email address' },
                        { name: 'department_id', type: 'integer', required: true, description: 'Department ID' },
                        { name: 'position', type: 'string', required: true, description: 'Job position' }
                    ],
                    example: {
                        request: {
                            first_name: 'Jane',
                            last_name: 'Smith',
                            email: 'jane.smith@company.com',
                            department_id: 2,
                            position: 'Project Manager'
                        },
                        response: {
                            id: 2,
                            employee_id: 'EMP002',
                            first_name: 'Jane',
                            last_name: 'Smith',
                            email: 'jane.smith@company.com',
                            department: 'Management',
                            position: 'Project Manager',
                            created_at: '2024-01-15T10:30:00Z'
                        }
                    }
                }
            ]
        },
        {
            title: 'Leave Management',
            description: 'Handle leave requests and approvals',
            endpoints: [
                {
                    method: 'GET',
                    path: '/api/v1/leaves',
                    title: 'List Leave Requests',
                    description: 'Retrieve leave requests with filtering options',
                    parameters: [
                        { name: 'status', type: 'string', required: false, description: 'Filter by status (pending, approved, rejected)' },
                        { name: 'employee_id', type: 'integer', required: false, description: 'Filter by employee ID' },
                        { name: 'date_from', type: 'date', required: false, description: 'Filter from date (YYYY-MM-DD)' },
                        { name: 'date_to', type: 'date', required: false, description: 'Filter to date (YYYY-MM-DD)' }
                    ],
                    example: {
                        response: {
                            data: [
                                {
                                    id: 1,
                                    employee_id: 1,
                                    leave_type: 'Annual Leave',
                                    start_date: '2024-02-01',
                                    end_date: '2024-02-05',
                                    days: 5,
                                    status: 'approved',
                                    reason: 'Family vacation'
                                }
                            ]
                        }
                    }
                },
                {
                    method: 'POST',
                    path: '/api/v1/leaves',
                    title: 'Create Leave Request',
                    description: 'Submit a new leave request',
                    parameters: [
                        { name: 'employee_id', type: 'integer', required: true, description: 'Employee ID' },
                        { name: 'leave_type_id', type: 'integer', required: true, description: 'Leave type ID' },
                        { name: 'start_date', type: 'date', required: true, description: 'Leave start date (YYYY-MM-DD)' },
                        { name: 'end_date', type: 'date', required: true, description: 'Leave end date (YYYY-MM-DD)' },
                        { name: 'reason', type: 'string', required: true, description: 'Reason for leave' }
                    ],
                    example: {
                        request: {
                            employee_id: 1,
                            leave_type_id: 1,
                            start_date: '2024-03-01',
                            end_date: '2024-03-03',
                            reason: 'Medical appointment'
                        },
                        response: {
                            id: 2,
                            employee_id: 1,
                            leave_type: 'Sick Leave',
                            start_date: '2024-03-01',
                            end_date: '2024-03-03',
                            days: 3,
                            status: 'pending',
                            reason: 'Medical appointment',
                            created_at: '2024-01-15T10:30:00Z'
                        }
                    }
                }
            ]
        }
    ];

    const getMethodColor = (method: string) => {
        switch (method) {
            case 'GET': return 'bg-green-100 text-green-800';
            case 'POST': return 'bg-blue-100 text-blue-800';
            case 'PUT': return 'bg-yellow-100 text-yellow-800';
            case 'DELETE': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const testEndpoint = async (endpoint: any) => {
        if (!testToken) {
            alert('Please enter an API token to test the endpoint');
            return;
        }

        setIsLoading(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            setTestResponse(endpoint.example.response);
        } catch (error) {
            setTestResponse({ error: 'Failed to test endpoint' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link href="/api">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back to API
                            </Button>
                        </Link>
                        <div>
                            <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                                API Documentation
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                Version {apiVersion} - Interactive API Reference
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/api/tokens">
                            <Button variant="outline">
                                <Key className="w-4 h-4 mr-2" />
                                Get API Token
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="API Documentation" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Sidebar Navigation */}
                        <div className="lg:col-span-1">
                            <Card className="sticky top-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Book className="w-5 h-5 mr-2" />
                                        API Sections
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {apiSections.map((section, index) => (
                                        <div key={index}>
                                            <h4 className="font-medium text-sm text-gray-900 mb-2">
                                                {section.title}
                                            </h4>
                                            <div className="space-y-1 ml-2">
                                                {section.endpoints.map((endpoint, endpointIndex) => (
                                                    <button
                                                        key={endpointIndex}
                                                        onClick={() => setSelectedEndpoint(`${index}-${endpointIndex}`)}
                                                        className={`w-full text-left text-xs p-2 rounded hover:bg-gray-100 transition-colors ${
                                                            selectedEndpoint === `${index}-${endpointIndex}` ? 'bg-blue-50 text-blue-700' : 'text-gray-600'
                                                        }`}
                                                    >
                                                        <Badge className={`${getMethodColor(endpoint.method)} mr-2 text-xs`}>
                                                            {endpoint.method}
                                                        </Badge>
                                                        {endpoint.title}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Main Content */}
                        <div className="lg:col-span-3 space-y-6">
                            {/* Getting Started */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Info className="w-5 h-5 mr-2" />
                                        Getting Started
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            All API requests require authentication using Bearer tokens.
                                            Include your token in the Authorization header: <code>Authorization: Bearer YOUR_TOKEN</code>
                                        </AlertDescription>
                                    </Alert>

                                    <div className="space-y-2">
                                        <Label htmlFor="test-token">API Token for Testing</Label>
                                        <Input
                                            id="test-token"
                                            type="password"
                                            placeholder="Enter your API token to test endpoints"
                                            value={testToken}
                                            onChange={(e) => setTestToken(e.target.value)}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            {/* API Sections */}
                            {apiSections.map((section, sectionIndex) => (
                                <Card key={sectionIndex}>
                                    <CardHeader>
                                        <CardTitle>{section.title}</CardTitle>
                                        <CardDescription>{section.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {section.endpoints.map((endpoint, endpointIndex) => {
                                            const isSelected = selectedEndpoint === `${sectionIndex}-${endpointIndex}`;
                                            return (
                                                <div key={endpointIndex} className="border rounded-lg p-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <Badge className={getMethodColor(endpoint.method)}>
                                                                {endpoint.method}
                                                            </Badge>
                                                            <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                                {endpoint.path}
                                                            </code>
                                                            <h4 className="font-medium">{endpoint.title}</h4>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => testEndpoint(endpoint)}
                                                            disabled={isLoading}
                                                        >
                                                            <Play className="w-4 h-4 mr-2" />
                                                            {isLoading ? 'Testing...' : 'Test'}
                                                        </Button>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-4">{endpoint.description}</p>

                                                    <Tabs defaultValue="parameters" className="space-y-4">
                                                        <TabsList>
                                                            <TabsTrigger value="parameters">Parameters</TabsTrigger>
                                                            <TabsTrigger value="example">Example</TabsTrigger>
                                                            {testResponse && <TabsTrigger value="response">Response</TabsTrigger>}
                                                        </TabsList>

                                                        <TabsContent value="parameters">
                                                            <div className="space-y-3">
                                                                {endpoint.parameters.map((param, paramIndex) => (
                                                                    <div key={paramIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                                                        <div>
                                                                            <code className="font-mono text-sm">{param.name}</code>
                                                                            <Badge variant="outline" className="ml-2">
                                                                                {param.type}
                                                                            </Badge>
                                                                            {param.required && (
                                                                                <Badge variant="destructive" className="ml-2">
                                                                                    Required
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <span className="text-sm text-gray-600">
                                                                            {param.description}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </TabsContent>

                                                        <TabsContent value="example">
                                                            <div className="space-y-4">
                                                                {endpoint.example.request && (
                                                                    <div>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <h5 className="font-medium">Request Body</h5>
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => copyToClipboard(JSON.stringify(endpoint.example.request, null, 2))}
                                                                            >
                                                                                <Copy className="w-4 h-4" />
                                                                            </Button>
                                                                        </div>
                                                                        <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                                                                            {JSON.stringify(endpoint.example.request, null, 2)}
                                                                        </pre>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h5 className="font-medium">Response</h5>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            onClick={() => copyToClipboard(JSON.stringify(endpoint.example.response, null, 2))}
                                                                        >
                                                                            <Copy className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>
                                                                    <pre className="bg-gray-900 text-gray-100 p-4 rounded text-sm overflow-x-auto">
                                                                        {JSON.stringify(endpoint.example.response, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </div>
                                                        </TabsContent>

                                                        {testResponse && (
                                                            <TabsContent value="response">
                                                                <div>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <h5 className="font-medium flex items-center">
                                                                            <Terminal className="w-4 h-4 mr-2" />
                                                                            Test Response
                                                                        </h5>
                                                                        <Badge variant="default">
                                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                                            Success
                                                                        </Badge>
                                                                    </div>
                                                                    <pre className="bg-green-50 border border-green-200 text-green-800 p-4 rounded text-sm overflow-x-auto">
                                                                        {JSON.stringify(testResponse, null, 2)}
                                                                    </pre>
                                                                </div>
                                                            </TabsContent>
                                                        )}
                                                    </Tabs>
                                                </div>
                                            );
                                        })}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default APIDocumentation;
