import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Key,
    FileText,
    Settings,
    Activity,
    Shield,
    Zap,
    Globe,
    Code,
    Database,
    Lock
} from 'lucide-react';
import AuthenticatedLayout from '@/layouts/auth-layout';

interface Props {
    apiVersion: string;
    apiDescription: string;
    auth: {
        user: any;
    };
}

const APIIndex: React.FC<Props> = ({ apiVersion, apiDescription, auth }) => {
    const [activeTab, setActiveTab] = useState('overview');

    const apiFeatures = [
        {
            icon: Key,
            title: 'API Token Management',
            description: 'Create, manage, and revoke API tokens with granular permissions',
            href: '/api/tokens',
            status: 'active'
        },
        {
            icon: FileText,
            title: 'API Documentation',
            description: 'Comprehensive API documentation with interactive examples',
            href: '/api/documentation',
            status: 'active'
        },
        {
            icon: Shield,
            title: 'Rate Limiting',
            description: 'Built-in rate limiting and throttling for API security',
            href: '/api/rate-limits',
            status: 'active'
        },
        {
            icon: Activity,
            title: 'API Analytics',
            description: 'Monitor API usage, performance, and error rates',
            href: '/api/analytics',
            status: 'coming-soon'
        },
        {
            icon: Settings,
            title: 'API Configuration',
            description: 'Configure API settings, versioning, and endpoints',
            href: '/api/settings',
            status: 'coming-soon'
        },
        {
            icon: Globe,
            title: 'Webhooks',
            description: 'Set up webhooks for real-time event notifications',
            href: '/api/webhooks',
            status: 'coming-soon'
        }
    ];

    const apiEndpoints = [
        { method: 'GET', endpoint: '/api/v1/employees', description: 'List all employees' },
        { method: 'POST', endpoint: '/api/v1/employees', description: 'Create new employee' },
        { method: 'GET', endpoint: '/api/v1/leaves', description: 'List leave requests' },
        { method: 'POST', endpoint: '/api/v1/leaves', description: 'Create leave request' },
        { method: 'GET', endpoint: '/api/v1/timesheets', description: 'List timesheets' },
        { method: 'GET', endpoint: '/api/v1/payrolls', description: 'List payroll records' }
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

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                            API Management
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {apiDescription} - Version {apiVersion}
                        </p>
                    </div>
                    <div className="flex space-x-2">
                        <Link href="/api/tokens">
                            <Button>
                                <Key className="w-4 h-4 mr-2" />
                                Manage Tokens
                            </Button>
                        </Link>
                        <Link href="/api/documentation">
                            <Button variant="outline">
                                <FileText className="w-4 h-4 mr-2" />
                                Documentation
                            </Button>
                        </Link>
                    </div>
                </div>
            }
        >
            <Head title="API Management" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                            <TabsTrigger value="security">Security</TabsTrigger>
                            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {apiFeatures.map((feature, index) => {
                                    const Icon = feature.icon;
                                    return (
                                        <Card key={index} className="hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="flex items-center justify-between">
                                                    <Icon className="w-8 h-8 text-blue-600" />
                                                    <Badge
                                                        variant={feature.status === 'active' ? 'default' : 'secondary'}
                                                    >
                                                        {feature.status === 'active' ? 'Active' : 'Coming Soon'}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-lg">{feature.title}</CardTitle>
                                                <CardDescription>{feature.description}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {feature.status === 'active' ? (
                                                    <Link href={feature.href}>
                                                        <Button className="w-full">
                                                            Access Feature
                                                        </Button>
                                                    </Link>
                                                ) : (
                                                    <Button className="w-full" disabled>
                                                        Coming Soon
                                                    </Button>
                                                )}
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>

                            <Alert>
                                <Zap className="h-4 w-4" />
                                <AlertDescription>
                                    The API module provides secure, RESTful endpoints for all system functionality.
                                    Use API tokens for authentication and enjoy built-in rate limiting and comprehensive documentation.
                                </AlertDescription>
                            </Alert>
                        </TabsContent>

                        <TabsContent value="endpoints" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Code className="w-5 h-5 mr-2" />
                                        Available API Endpoints
                                    </CardTitle>
                                    <CardDescription>
                                        Current API endpoints available in version {apiVersion}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {apiEndpoints.map((endpoint, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <Badge className={getMethodColor(endpoint.method)}>
                                                        {endpoint.method}
                                                    </Badge>
                                                    <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                                                        {endpoint.endpoint}
                                                    </code>
                                                </div>
                                                <span className="text-sm text-gray-600">
                                                    {endpoint.description}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4 pt-4 border-t">
                                        <Link href="/api/documentation">
                                            <Button variant="outline" className="w-full">
                                                <FileText className="w-4 h-4 mr-2" />
                                                View Complete Documentation
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Lock className="w-5 h-5 mr-2" />
                                            Authentication
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Token-based Authentication</span>
                                            <Badge variant="default">Active</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Token Expiration</span>
                                            <span className="text-sm text-gray-600">24 hours</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Refresh Token Expiration</span>
                                            <span className="text-sm text-gray-600">7 days</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center">
                                            <Shield className="w-5 h-5 mr-2" />
                                            Rate Limiting
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Rate Limiting</span>
                                            <Badge variant="default">Enabled</Badge>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Requests per Minute</span>
                                            <span className="text-sm text-gray-600">60</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Throttle Window</span>
                                            <span className="text-sm text-gray-600">1 minute</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="monitoring" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Activity className="w-5 h-5 mr-2" />
                                        API Monitoring
                                    </CardTitle>
                                    <CardDescription>
                                        Monitor API usage, performance, and health metrics
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Alert>
                                        <Database className="h-4 w-4" />
                                        <AlertDescription>
                                            API monitoring and analytics features are coming soon.
                                            This will include request tracking, error monitoring, and performance metrics.
                                        </AlertDescription>
                                    </Alert>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default APIIndex;
