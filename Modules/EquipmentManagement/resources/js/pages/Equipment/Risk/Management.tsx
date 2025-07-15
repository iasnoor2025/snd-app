import {
    AppLayout,
    Badge,
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    formatCurrency,
    formatPercentage,
    Input,
    Label,
    Progress,
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
import { Head } from '@inertiajs/react';
import axios from 'axios';
import {
    Activity,
    AlertCircle,
    AlertTriangle,
    Archive,
    ArrowDown,
    ArrowRight,
    BarChart3,
    Brain,
    CheckCircle,
    CheckSquare,
    Clock,
    DollarSign,
    Download,
    Edit,
    Eye,
    FileText,
    Gauge,
    HelpCircle,
    Lightbulb,
    Network,
    PieChart as PieChartIcon,
    Plus,
    RefreshCw,
    Search,
    Shield,
    ShieldCheck,
    Target,
    Thermometer,
    Trash2,
    TrendingDown,
    TrendingUp,
    Upload,
    UserPlus,
    XCircle,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Scatter,
    ScatterChart,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { toast } from 'sonner';

interface RiskFactor {
    id: string;
    name: string;
    category: 'operational' | 'financial' | 'safety' | 'environmental' | 'compliance' | 'technical';
    severity: 'low' | 'medium' | 'high' | 'critical';
    probability: number; // 0-100
    impact: number; // 0-100
    riskScore: number;
    description: string;
    affectedEquipment: string[];
    lastAssessment: string;
    nextReview: string;
    status: 'active' | 'mitigated' | 'monitoring' | 'closed';
    trend: 'increasing' | 'stable' | 'decreasing';
    mitigationStrategies: MitigationStrategy[];
}

interface MitigationStrategy {
    id: string;
    title: string;
    description: string;
    type: 'preventive' | 'corrective' | 'detective' | 'compensating';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    cost: number;
    timeline: string;
    effectiveness: number; // 0-100
    implementation: {
        status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
        progress: number;
        assignedTo: string;
        startDate: string;
        targetDate: string;
        actualDate?: string;
    };
    kpis: {
        metric: string;
        target: number;
        current: number;
        unit: string;
    }[];
}

interface RiskAssessment {
    id: string;
    equipmentId: number;
    equipmentName: string;
    assessmentDate: string;
    assessor: string;
    overallRiskScore: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    factors: RiskFactor[];
    recommendations: string[];
    nextAssessmentDue: string;
    complianceStatus: {
        regulatory: boolean;
        safety: boolean;
        environmental: boolean;
        insurance: boolean;
    };
}

interface RiskMetrics {
    totalRisks: number;
    criticalRisks: number;
    highRisks: number;
    mediumRisks: number;
    lowRisks: number;
    mitigatedRisks: number;
    averageRiskScore: number;
    riskTrend: 'improving' | 'stable' | 'deteriorating';
    complianceRate: number;
    incidentRate: number;
    costOfRisk: number;
    riskReductionSavings: number;
}

interface AssignmentHistory {
    id: string;
    itemId: string;
    itemType: 'risk' | 'assessment' | 'strategy' | 'compliance';
    itemName: string;
    assignedTo: string;
    assignedBy: string;
    assignedDate: string;
    dueDate?: string;
    completedDate?: string;
    status: 'assigned' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    notes?: string;
}

interface RiskDocument {
    id: string;
    name: string;
    type: 'policy' | 'procedure' | 'assessment' | 'report' | 'certificate' | 'training' | 'other';
    category: 'operational' | 'financial' | 'safety' | 'environmental' | 'compliance' | 'technical';
    uploadDate: string;
    uploadedBy: string;
    fileSize: string;
    fileType: string;
    description?: string;
    relatedRisks: string[];
    expiryDate?: string;
    status: 'active' | 'expired' | 'archived';
    downloadUrl: string;
}

interface Props {
    riskAssessments: RiskAssessment[];
    riskFactors: RiskFactor[];
    mitigationStrategies: MitigationStrategy[];
    riskMetrics: RiskMetrics;
    assignmentHistory?: AssignmentHistory[];
    riskDocuments?: RiskDocument[];
}

const RiskManagement: React.FC<Props> = ({
    riskAssessments = [],
    riskFactors = [],
    mitigationStrategies = [],
    riskMetrics,
    assignmentHistory = [],
    riskDocuments = [],
}) => {
    const [selectedRisk, setSelectedRisk] = useState<RiskFactor | null>(null);
    const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessment | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [filterSeverity, setFilterSeverity] = useState<string>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list' | 'matrix'>('grid');
    const [showMitigated, setShowMitigated] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | undefined>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Event handlers
    const handleViewRiskDetails = (riskId: string) => {
        const risk = mockRiskFactors.find((r) => r.id === riskId);
        setSelectedRisk(risk || null);
        console.log('Viewing risk details for:', riskId);
    };

    const handleEditRisk = (riskId: string) => {
        console.log('Editing risk:', riskId);
        // Add edit logic here
    };

    const handleViewAssessmentDetails = (assessmentId: string) => {
        const assessment = mockRiskAssessments.find((a) => a.id === assessmentId);
        setSelectedAssessment(assessment || null);
        console.log('Viewing assessment details for:', assessmentId);
    };

    const handleUpdateAssessment = (assessmentId: string) => {
        console.log('Updating assessment:', assessmentId);
        // Add update logic here
    };

    const handleViewStrategyDetails = (strategyId: string) => {
        console.log('Viewing strategy details for:', strategyId);
        // Add view logic here
    };

    const handleEditStrategy = (strategyId: string) => {
        console.log('Editing strategy:', strategyId);
        // Add edit logic here
    };

    const handleCreateNewRisk = async () => {
        try {
            await axios.post('/api/equipment/risk', {
                /* risk data */
            });
            toast.success('Risk created successfully');
        } catch (error) {
            toast.error('Failed to create risk');
        }
    };

    const handleCreateNewAssessment = async () => {
        try {
            await axios.post('/api/equipment/risk/assessment', {
                /* assessment data */
            });
            toast.success('Assessment created successfully');
        } catch (error) {
            toast.error('Failed to create assessment');
        }
    };

    const handleCreateNewStrategy = async () => {
        try {
            await axios.post('/api/equipment/risk/strategy', {
                /* strategy data */
            });
            toast.success('Strategy created successfully');
        } catch (error) {
            toast.error('Failed to create strategy');
        }
    };

    const handleExportReport = async () => {
        try {
            const response = await axios.get('/api/equipment/risk/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'risk_report.pdf');
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) link.parentNode.removeChild(link);
            toast.success('Risk report exported');
        } catch (error) {
            toast.error('Failed to export risk report');
        }
    };

    const handleResolveIssue = async (issueIndex: number) => {
        try {
            await axios.post(`/api/equipment/risk/resolve`, { issueIndex });
            toast.success('Compliance issue resolved');
        } catch (error) {
            toast.error('Failed to resolve compliance issue');
        }
    };

    const handleCreateNewComplianceCheck = async () => {
        try {
            await axios.post('/api/equipment/risk/compliance', {
                /* compliance data */
            });
            toast.success('Compliance check created');
        } catch (error) {
            toast.error('Failed to create compliance check');
        }
    };

    const handleAssignTask = async (itemId: string, itemType: string, assignee: string) => {
        try {
            await axios.post('/api/equipment/risk/assign', { itemId, itemType, assignee });
            toast.success('Task assigned successfully');
        } catch (error) {
            toast.error('Failed to assign task');
        }
    };

    const handleViewAssignmentHistory = async (itemId?: string) => {
        try {
            await axios.get(`/api/equipment/risk/assignment-history`, { params: { itemId } });
            toast.success('Assignment history loaded');
        } catch (error) {
            toast.error('Failed to load assignment history');
        }
    };

    const handleUploadDocument = async () => {
        try {
            if (!fileInputRef.current || !fileInputRef.current.files || !fileInputRef.current.files[0]) {
                return toast.error('No file selected');
            }
            const file = fileInputRef.current.files[0];
            const formData = new FormData();
            formData.append('document', file);
            await axios.post('/api/equipment/risk/document/upload', formData);
            toast.success('Document uploaded');
        } catch (error) {
            toast.error('Failed to upload document');
        }
    };

    const handleDownloadDocument = async (documentId: string) => {
        try {
            const response = await axios.get(`/api/equipment/risk/document/${documentId}/download`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'document.pdf');
            document.body.appendChild(link);
            link.click();
            if (link.parentNode) link.parentNode.removeChild(link);
            toast.success('Document downloaded');
        } catch (error) {
            toast.error('Failed to download document');
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        try {
            await axios.delete(`/api/equipment/risk/document/${documentId}`);
            toast.success('Document deleted');
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    // Mock data
    const mockRiskFactors: RiskFactor[] = [
        {
            id: '1',
            name: 'Equipment Aging',
            category: 'operational',
            severity: 'high',
            probability: 85,
            impact: 75,
            riskScore: (85 * 75) / 100,
            description: 'Increased failure rates due to equipment aging beyond optimal service life',
            affectedEquipment: ['Excavator CAT-320', 'Bulldozer CAT-D8', 'Crane Liebherr-LTM'],
            lastAssessment: '2024-01-15',
            nextReview: '2024-04-15',
            status: 'active',
            trend: 'increasing',
            mitigationStrategies: [],
        },
        {
            id: '2',
            name: 'Operator Safety Compliance',
            category: 'safety',
            severity: 'critical',
            probability: 45,
            impact: 95,
            riskScore: (45 * 95) / 100,
            description: 'Risk of safety incidents due to inadequate operator training or non-compliance',
            affectedEquipment: ['All Heavy Equipment'],
            lastAssessment: '2024-01-20',
            nextReview: '2024-03-20',
            status: 'active',
            trend: 'stable',
            mitigationStrategies: [],
        },
        {
            id: '3',
            name: 'Environmental Impact',
            category: 'environmental',
            severity: 'medium',
            probability: 60,
            impact: 70,
            riskScore: (60 * 70) / 100,
            description: 'Potential environmental violations due to emissions or fluid leaks',
            affectedEquipment: ['Diesel Equipment'],
            lastAssessment: '2024-01-10',
            nextReview: '2024-07-10',
            status: 'monitoring',
            trend: 'decreasing',
            mitigationStrategies: [],
        },
        {
            id: '4',
            name: 'Cybersecurity Threats',
            category: 'technical',
            severity: 'high',
            probability: 35,
            impact: 85,
            riskScore: (35 * 85) / 100,
            description: 'Risk of cyber attacks on connected equipment and IoT systems',
            affectedEquipment: ['Smart Equipment', 'IoT Sensors'],
            lastAssessment: '2024-01-25',
            nextReview: '2024-02-25',
            status: 'active',
            trend: 'increasing',
            mitigationStrategies: [],
        },
        {
            id: '5',
            name: 'Supply Chain Disruption',
            category: 'operational',
            severity: 'medium',
            probability: 55,
            impact: 60,
            riskScore: (55 * 60) / 100,
            description: 'Risk of parts shortage affecting maintenance and operations',
            affectedEquipment: ['All Equipment'],
            lastAssessment: '2024-01-12',
            nextReview: '2024-04-12',
            status: 'monitoring',
            trend: 'stable',
            mitigationStrategies: [],
        },
        {
            id: '6',
            name: 'Financial Exposure',
            category: 'financial',
            severity: 'high',
            probability: 40,
            impact: 80,
            riskScore: (40 * 80) / 100,
            description: 'Risk of significant financial losses due to equipment downtime',
            affectedEquipment: ['High-Value Equipment'],
            lastAssessment: '2024-01-18',
            nextReview: '2024-03-18',
            status: 'active',
            trend: 'stable',
            mitigationStrategies: [],
        },
    ];

    const mockMitigationStrategies: MitigationStrategy[] = [
        {
            id: '1',
            title: 'Predictive Maintenance Program',
            description: 'Implement IoT sensors and AI analytics for predictive maintenance',
            type: 'preventive',
            priority: 'high',
            cost: 150000,
            timeline: '6 months',
            effectiveness: 85,
            implementation: {
                status: 'in_progress',
                progress: 65,
                assignedTo: 'Maintenance Team',
                startDate: '2024-01-01',
                targetDate: '2024-06-30',
            },
            kpis: [
                { metric: 'Unplanned Downtime', target: 5, current: 12, unit: '%' },
                { metric: 'Maintenance Cost', target: 15, current: 8, unit: '% reduction' },
            ],
        },
        {
            id: '2',
            title: 'Enhanced Safety Training',
            description: 'Comprehensive safety training program with VR simulations',
            type: 'preventive',
            priority: 'urgent',
            cost: 75000,
            timeline: '3 months',
            effectiveness: 90,
            implementation: {
                status: 'planned',
                progress: 0,
                assignedTo: 'HR & Safety Team',
                startDate: '2024-02-01',
                targetDate: '2024-04-30',
            },
            kpis: [
                { metric: 'Safety Incidents', target: 0, current: 3, unit: 'incidents/month' },
                { metric: 'Compliance Score', target: 95, current: 78, unit: '%' },
            ],
        },
        {
            id: '3',
            title: 'Environmental Monitoring System',
            description: 'Real-time monitoring of emissions and environmental impact',
            type: 'detective',
            priority: 'medium',
            cost: 45000,
            timeline: '4 months',
            effectiveness: 75,
            implementation: {
                status: 'completed',
                progress: 100,
                assignedTo: 'Environmental Team',
                startDate: '2023-10-01',
                targetDate: '2024-01-31',
                actualDate: '2024-01-28',
            },
            kpis: [
                { metric: 'Environmental Violations', target: 0, current: 1, unit: 'violations/year' },
                { metric: 'Emission Reduction', target: 20, current: 15, unit: '%' },
            ],
        },
        {
            id: '4',
            title: 'Cybersecurity Framework',
            description: 'Implement comprehensive cybersecurity measures for connected equipment',
            type: 'preventive',
            priority: 'high',
            cost: 120000,
            timeline: '8 months',
            effectiveness: 80,
            implementation: {
                status: 'in_progress',
                progress: 30,
                assignedTo: 'IT Security Team',
                startDate: '2024-01-15',
                targetDate: '2024-09-15',
            },
            kpis: [
                { metric: 'Security Incidents', target: 0, current: 2, unit: 'incidents/quarter' },
                { metric: 'System Vulnerability', target: 5, current: 15, unit: 'critical vulnerabilities' },
            ],
        },
    ];

    const mockRiskMetrics: RiskMetrics = {
        totalRisks: 24,
        criticalRisks: 3,
        highRisks: 8,
        mediumRisks: 9,
        lowRisks: 4,
        mitigatedRisks: 12,
        averageRiskScore: 42.5,
        riskTrend: 'improving',
        complianceRate: 87.5,
        incidentRate: 2.3,
        costOfRisk: 485000,
        riskReductionSavings: 125000,
    };

    const mockRiskAssessments: RiskAssessment[] = [
        {
            id: '1',
            equipmentId: 1,
            equipmentName: 'Excavator CAT-320',
            assessmentDate: '2024-01-15',
            assessor: 'John Smith',
            overallRiskScore: 65,
            riskLevel: 'high',
            factors: mockRiskFactors.slice(0, 3),
            recommendations: ['Implement predictive maintenance', 'Enhance operator training', 'Upgrade safety systems'],
            nextAssessmentDue: '2024-04-15',
            complianceStatus: {
                regulatory: true,
                safety: false,
                environmental: true,
                insurance: true,
            },
        },
        {
            id: '2',
            equipmentId: 2,
            equipmentName: 'Bulldozer CAT-D8',
            assessmentDate: '2024-01-20',
            assessor: 'Sarah Johnson',
            overallRiskScore: 45,
            riskLevel: 'medium',
            factors: mockRiskFactors.slice(1, 4),
            recommendations: ['Regular safety audits', 'Environmental monitoring', 'Cybersecurity assessment'],
            nextAssessmentDue: '2024-04-20',
            complianceStatus: {
                regulatory: true,
                safety: true,
                environmental: false,
                insurance: true,
            },
        },
    ];

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'text-red-700 bg-red-100 border-red-200';
            case 'high':
                return 'text-orange-700 bg-orange-100 border-orange-200';
            case 'medium':
                return 'text-yellow-700 bg-yellow-100 border-yellow-200';
            case 'low':
                return 'text-green-700 bg-green-100 border-green-200';
            default:
                return 'text-gray-700 bg-gray-100 border-gray-200';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'operational':
                return <Activity className="h-4 w-4" />;
            case 'financial':
                return <DollarSign className="h-4 w-4" />;
            case 'safety':
                return <Shield className="h-4 w-4" />;
            case 'environmental':
                return <Thermometer className="h-4 w-4" />;
            case 'compliance':
                return <FileText className="h-4 w-4" />;
            case 'technical':
                return <Network className="h-4 w-4" />;
            default:
                return <AlertTriangle className="h-4 w-4" />;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <AlertCircle className="h-4 w-4 text-red-500" />;
            case 'mitigated':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'monitoring':
                return <Eye className="h-4 w-4 text-blue-500" />;
            case 'closed':
                return <XCircle className="h-4 w-4 text-gray-500" />;
            default:
                return <HelpCircle className="h-4 w-4 text-gray-500" />;
        }
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case 'increasing':
                return <TrendingUp className="h-4 w-4 text-red-500" />;
            case 'decreasing':
                return <TrendingDown className="h-4 w-4 text-green-500" />;
            case 'stable':
                return <ArrowRight className="h-4 w-4 text-blue-500" />;
            default:
                return <ArrowRight className="h-4 w-4 text-gray-500" />;
        }
    };

    const getRiskLevelColor = (level: string) => {
        switch (level) {
            case 'critical':
                return 'bg-red-500';
            case 'high':
                return 'bg-orange-500';
            case 'medium':
                return 'bg-yellow-500';
            case 'low':
                return 'bg-green-500';
            default:
                return 'bg-gray-500';
        }
    };

    // Chart colors
    const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

    // Risk matrix data
    const riskMatrixData = [
        { probability: 90, impact: 90, risk: 'Equipment Aging', severity: 'critical' },
        { probability: 45, impact: 95, risk: 'Safety Compliance', severity: 'critical' },
        { probability: 35, impact: 85, risk: 'Cybersecurity', severity: 'high' },
        { probability: 40, impact: 80, risk: 'Financial Exposure', severity: 'high' },
        { probability: 60, impact: 70, risk: 'Environmental', severity: 'medium' },
        { probability: 55, impact: 60, risk: 'Supply Chain', severity: 'medium' },
    ];

    // Mock Assignment History Data
    const mockAssignmentHistory: AssignmentHistory[] = [
        {
            id: 'ah1',
            itemId: '1',
            itemType: 'risk',
            itemName: 'Equipment Aging Risk Assessment',
            assignedTo: 'John Smith',
            assignedBy: 'Sarah Johnson',
            assignedDate: '2024-01-15',
            dueDate: '2024-02-15',
            status: 'in_progress',
            priority: 'high',
            notes: 'Focus on critical equipment over 10 years old',
        },
        {
            id: 'ah2',
            itemId: 'ra1',
            itemType: 'assessment',
            itemName: 'CAT-320 Excavator Risk Assessment',
            assignedTo: 'Mike Wilson',
            assignedBy: 'Sarah Johnson',
            assignedDate: '2024-01-10',
            dueDate: '2024-01-25',
            completedDate: '2024-01-23',
            status: 'completed',
            priority: 'medium',
            notes: 'Completed ahead of schedule',
        },
        {
            id: 'ah3',
            itemId: 'ms1',
            itemType: 'strategy',
            itemName: 'Preventive Maintenance Program Implementation',
            assignedTo: 'Lisa Chen',
            assignedBy: 'David Brown',
            assignedDate: '2024-01-20',
            dueDate: '2024-03-20',
            status: 'assigned',
            priority: 'urgent',
            notes: 'Critical for reducing equipment failure rates',
        },
        {
            id: 'ah4',
            itemId: 'comp1',
            itemType: 'compliance',
            itemName: 'Safety Training Compliance Review',
            assignedTo: 'Robert Davis',
            assignedBy: 'Sarah Johnson',
            assignedDate: '2024-01-05',
            dueDate: '2024-01-20',
            status: 'overdue',
            priority: 'high',
            notes: 'Requires immediate attention',
        },
        {
            id: 'ah5',
            itemId: '2',
            itemType: 'risk',
            itemName: 'Operator Safety Compliance Audit',
            assignedTo: 'Emma Thompson',
            assignedBy: 'David Brown',
            assignedDate: '2024-01-25',
            dueDate: '2024-02-25',
            status: 'assigned',
            priority: 'medium',
            notes: 'Include all heavy equipment operators',
        },
    ];

    // Mock Documents Data
    const mockRiskDocuments: RiskDocument[] = [
        {
            id: 'doc1',
            name: 'Equipment Safety Policy 2024',
            type: 'policy',
            category: 'safety',
            uploadDate: '2024-01-01',
            uploadedBy: 'Sarah Johnson',
            fileSize: '2.5 MB',
            fileType: 'PDF',
            description: 'Updated safety policies for all equipment operations',
            relatedRisks: ['1', '2'],
            expiryDate: '2024-12-31',
            status: 'active',
            downloadUrl: '/documents/safety-policy-2024.pdf',
        },
        {
            id: 'doc2',
            name: 'Risk Assessment Procedure Manual',
            type: 'procedure',
            category: 'operational',
            uploadDate: '2024-01-15',
            uploadedBy: 'Mike Wilson',
            fileSize: '5.2 MB',
            fileType: 'PDF',
            description: 'Step-by-step procedures for conducting risk assessments',
            relatedRisks: ['1', '3', '4'],
            status: 'active',
            downloadUrl: '/documents/risk-assessment-manual.pdf',
        },
        {
            id: 'doc3',
            name: 'Environmental Compliance Certificate',
            type: 'certificate',
            category: 'environmental',
            uploadDate: '2023-12-01',
            uploadedBy: 'Lisa Chen',
            fileSize: '1.1 MB',
            fileType: 'PDF',
            description: 'Environmental compliance certification for 2023',
            relatedRisks: ['3'],
            expiryDate: '2024-11-30',
            status: 'active',
            downloadUrl: '/documents/env-compliance-cert.pdf',
        },
        {
            id: 'doc4',
            name: 'Equipment Maintenance Training Materials',
            type: 'training',
            category: 'technical',
            uploadDate: '2024-01-20',
            uploadedBy: 'Robert Davis',
            fileSize: '15.7 MB',
            fileType: 'ZIP',
            description: 'Training materials for equipment maintenance procedures',
            relatedRisks: ['1', '4'],
            status: 'active',
            downloadUrl: '/documents/maintenance-training.zip',
        },
        {
            id: 'doc5',
            name: 'Financial Risk Assessment Report Q4 2023',
            type: 'report',
            category: 'financial',
            uploadDate: '2023-12-31',
            uploadedBy: 'Emma Thompson',
            fileSize: '3.8 MB',
            fileType: 'PDF',
            description: 'Quarterly financial risk assessment report',
            relatedRisks: ['5'],
            status: 'archived',
            downloadUrl: '/documents/financial-risk-q4-2023.pdf',
        },
    ];

    return (
        <AppLayout>
            <Head title="Risk Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                            <Shield className="h-8 w-8 text-red-600" />
                            Risk Management
                        </h1>
                        <p className="text-muted-foreground">Comprehensive risk assessment and mitigation strategies</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={handleExportReport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export Report
                        </Button>
                        <Button variant="outline" onClick={handleCreateNewAssessment}>
                            <Plus className="mr-2 h-4 w-4" />
                            New Assessment
                        </Button>
                        <Button onClick={handleExportReport}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Data
                        </Button>
                    </div>
                </div>

                {/* Risk Metrics Cards */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Risks</p>
                                    <p className="text-2xl font-bold">{mockRiskMetrics.totalRisks}</p>
                                </div>
                                <AlertTriangle className="h-8 w-8 text-orange-600" />
                            </div>
                            <div className="mt-2 flex items-center text-sm">
                                <div className="flex gap-2">
                                    <span className="text-red-600">{mockRiskMetrics.criticalRisks} Critical</span>
                                    <span className="text-orange-600">{mockRiskMetrics.highRisks} High</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Risk Score</p>
                                    <p className="text-2xl font-bold">{mockRiskMetrics.averageRiskScore}</p>
                                </div>
                                <Gauge className="h-8 w-8 text-blue-600" />
                            </div>
                            <div className="mt-2 flex items-center text-sm">
                                <TrendingDown className="mr-1 h-3 w-3 text-green-500" />
                                <span className="text-green-500">Improving trend</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Compliance Rate</p>
                                    <p className="text-2xl font-bold">{formatPercentage(mockRiskMetrics.complianceRate)}</p>
                                </div>
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <div className="mt-2">
                                <Progress value={mockRiskMetrics.complianceRate} className="h-2" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Cost of Risk</p>
                                    <p className="text-2xl font-bold">{formatCurrency(mockRiskMetrics.costOfRisk)}</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-purple-600" />
                            </div>
                            <div className="mt-2 flex items-center text-sm">
                                <ArrowDown className="mr-1 h-3 w-3 text-green-500" />
                                <span className="text-green-500">{formatCurrency(mockRiskMetrics.riskReductionSavings)} saved</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-7">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="assessment">Risk Assessment</TabsTrigger>
                        <TabsTrigger value="mitigation">Mitigation</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        <TabsTrigger value="analytics">Analytics</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Risk Distribution */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <PieChartIcon className="h-5 w-5" />
                                        Risk Distribution by Severity
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Critical', value: mockRiskMetrics.criticalRisks, color: '#ef4444' },
                                                    { name: 'High', value: mockRiskMetrics.highRisks, color: '#f97316' },
                                                    { name: 'Medium', value: mockRiskMetrics.mediumRisks, color: '#eab308' },
                                                    { name: 'Low', value: mockRiskMetrics.lowRisks, color: '#22c55e' },
                                                ]}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({ name, value }) => `${name}: ${value}`}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {[
                                                    { name: 'Critical', value: mockRiskMetrics.criticalRisks, color: '#ef4444' },
                                                    { name: 'High', value: mockRiskMetrics.highRisks, color: '#f97316' },
                                                    { name: 'Medium', value: mockRiskMetrics.mediumRisks, color: '#eab308' },
                                                    { name: 'Low', value: mockRiskMetrics.lowRisks, color: '#22c55e' },
                                                ].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Target className="h-5 w-5" />
                                        Risk Matrix
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <ScatterChart data={riskMatrixData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                type="number"
                                                dataKey="probability"
                                                name="Probability"
                                                domain={[0, 100]}
                                                label={{ value: 'Probability (%)', position: 'insideBottom', offset: -10 }}
                                            />
                                            <YAxis
                                                type="number"
                                                dataKey="impact"
                                                name="Impact"
                                                domain={[0, 100]}
                                                label={{ value: 'Impact (%)', angle: -90, position: 'insideLeft' }}
                                            />
                                            <Tooltip
                                                cursor={{ strokeDasharray: '3 3' }}
                                                content={({ active, payload }) => {
                                                    if (active && payload && payload.length) {
                                                        const data = payload[0].payload;
                                                        return (
                                                            <div className="rounded border bg-white p-3 shadow">
                                                                <p className="font-medium">{data.risk}</p>
                                                                <p>Probability: {data.probability}%</p>
                                                                <p>Impact: {data.impact}%</p>
                                                                <p>
                                                                    Severity:{' '}
                                                                    <span className={`capitalize ${getSeverityColor(data.severity)}`}>
                                                                        {data.severity}
                                                                    </span>
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                    return null;
                                                }}
                                            />
                                            <Scatter
                                                dataKey="impact"
                                                fill={(entry) => {
                                                    const severity = entry.severity;
                                                    switch (severity) {
                                                        case 'critical':
                                                            return '#ef4444';
                                                        case 'high':
                                                            return '#f97316';
                                                        case 'medium':
                                                            return '#eab308';
                                                        case 'low':
                                                            return '#22c55e';
                                                        default:
                                                            return '#6b7280';
                                                    }
                                                }}
                                            />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Risk Trends */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5" />
                                    Risk Trends Over Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart
                                        data={[
                                            { month: 'Jan', critical: 5, high: 12, medium: 8, low: 3 },
                                            { month: 'Feb', critical: 4, high: 11, medium: 9, low: 4 },
                                            { month: 'Mar', critical: 3, high: 10, medium: 10, low: 5 },
                                            { month: 'Apr', critical: 3, high: 9, medium: 9, low: 4 },
                                            { month: 'May', critical: 2, high: 8, medium: 8, low: 6 },
                                            { month: 'Jun', critical: 3, high: 8, medium: 9, low: 4 },
                                        ]}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="month" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} name="Critical" />
                                        <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} name="High" />
                                        <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} name="Medium" />
                                        <Line type="monotone" dataKey="low" stroke="#22c55e" strokeWidth={2} name="Low" />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Top Risks */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Top Risk Factors
                                    </CardTitle>
                                    <Button onClick={handleCreateNewRisk}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Risk
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockRiskFactors.slice(0, 5).map((risk) => (
                                        <div key={risk.id} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                {getCategoryIcon(risk.category)}
                                                <div>
                                                    <div className="font-medium">{risk.name}</div>
                                                    <div className="text-sm text-muted-foreground">{risk.description}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Badge className={getSeverityColor(risk.severity)}>{risk.severity}</Badge>
                                                <div className="text-right">
                                                    <div className="font-bold">{risk.riskScore.toFixed(1)}</div>
                                                    <div className="text-sm text-muted-foreground">Risk Score</div>
                                                </div>
                                                {getTrendIcon(risk.trend)}
                                                {getStatusIcon(risk.status)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="assessment" className="space-y-6">
                        {/* Assessment Filters */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Assessments</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-6 flex gap-4">
                                    <div className="flex-1">
                                        <Label htmlFor="search">Search Equipment</Label>
                                        <div className="relative">
                                            <Search className="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
                                            <Input id="search" placeholder="Search by equipment name..." className="pl-10" />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Categories" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Categories</SelectItem>
                                                <SelectItem value="operational">Operational</SelectItem>
                                                <SelectItem value="financial">Financial</SelectItem>
                                                <SelectItem value="safety">Safety</SelectItem>
                                                <SelectItem value="environmental">Environmental</SelectItem>
                                                <SelectItem value="compliance">Compliance</SelectItem>
                                                <SelectItem value="technical">Technical</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label htmlFor="severity">Severity</Label>
                                        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="All Severities" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Severities</SelectItem>
                                                <SelectItem value="critical">Critical</SelectItem>
                                                <SelectItem value="high">High</SelectItem>
                                                <SelectItem value="medium">Medium</SelectItem>
                                                <SelectItem value="low">Low</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Assessment List */}
                                <div className="space-y-4">
                                    {mockRiskAssessments.map((assessment) => (
                                        <div key={assessment.id} className="rounded-lg border p-4">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{assessment.equipmentName}</h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        Assessed by {assessment.assessor} on {assessment.assessmentDate}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={getSeverityColor(assessment.riskLevel)}>{assessment.riskLevel} Risk</Badge>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold">{assessment.overallRiskScore}</div>
                                                        <div className="text-sm text-muted-foreground">Risk Score</div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <div>
                                                    <h4 className="mb-2 font-medium">Compliance Status</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="flex items-center gap-2">
                                                            {assessment.complianceStatus.regulatory ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className="text-sm">Regulatory</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {assessment.complianceStatus.safety ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className="text-sm">Safety</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {assessment.complianceStatus.environmental ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className="text-sm">Environmental</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {assessment.complianceStatus.insurance ? (
                                                                <CheckCircle className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                <XCircle className="h-4 w-4 text-red-500" />
                                                            )}
                                                            <span className="text-sm">Insurance</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="mb-2 font-medium">Key Recommendations</h4>
                                                    <ul className="space-y-1 text-sm">
                                                        {assessment.recommendations.map((rec, index) => (
                                                            <li key={index} className="flex items-center gap-2">
                                                                <ArrowRight className="h-3 w-3 text-blue-500" />
                                                                {rec}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between border-t pt-4">
                                                <div className="text-sm text-muted-foreground">
                                                    Next assessment due: {assessment.nextAssessmentDue}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleViewAssessmentDetails(assessment.id)}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Button>
                                                    <Button variant="outline" size="sm" onClick={() => handleUpdateAssessment(assessment.id)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Update
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="mitigation" className="space-y-6">
                        {/* Mitigation Strategies */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Shield className="h-5 w-5" />
                                        Mitigation Strategies
                                    </CardTitle>
                                    <Button onClick={handleCreateNewStrategy}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Strategy
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {mockMitigationStrategies.map((strategy) => (
                                        <div key={strategy.id} className="rounded-lg border p-4">
                                            <div className="mb-4 flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold">{strategy.title}</h3>
                                                    <p className="mb-2 text-sm text-muted-foreground">{strategy.description}</p>
                                                    <div className="flex gap-2">
                                                        <Badge variant="outline">{strategy.type}</Badge>
                                                        <Badge
                                                            className={
                                                                strategy.priority === 'urgent'
                                                                    ? 'bg-red-100 text-red-700'
                                                                    : strategy.priority === 'high'
                                                                      ? 'bg-orange-100 text-orange-700'
                                                                      : strategy.priority === 'medium'
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-green-100 text-green-700'
                                                            }
                                                        >
                                                            {strategy.priority} Priority
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-lg font-bold">{formatCurrency(strategy.cost)}</div>
                                                    <div className="text-sm text-muted-foreground">Investment</div>
                                                </div>
                                            </div>

                                            <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                                <div>
                                                    <h4 className="mb-2 font-medium">Implementation Progress</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Progress</span>
                                                            <span>{strategy.implementation.progress}%</span>
                                                        </div>
                                                        <Progress value={strategy.implementation.progress} className="h-2" />
                                                        <div className="text-sm text-muted-foreground">
                                                            Status:{' '}
                                                            <span className="capitalize">{strategy.implementation.status.replace('_', ' ')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="mb-2 font-medium">Timeline</h4>
                                                    <div className="space-y-1 text-sm">
                                                        <div>Duration: {strategy.timeline}</div>
                                                        <div>Start: {strategy.implementation.startDate}</div>
                                                        <div>Target: {strategy.implementation.targetDate}</div>
                                                        {strategy.implementation.actualDate && (
                                                            <div>Completed: {strategy.implementation.actualDate}</div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="mb-2 font-medium">Effectiveness</h4>
                                                    <div className="space-y-2">
                                                        <div className="flex justify-between text-sm">
                                                            <span>Expected</span>
                                                            <span>{strategy.effectiveness}%</span>
                                                        </div>
                                                        <Progress value={strategy.effectiveness} className="h-2" />
                                                        <div className="text-sm text-muted-foreground">
                                                            Assigned to: {strategy.implementation.assignedTo}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="mb-2 font-medium">Key Performance Indicators</h4>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                                    {strategy.kpis.map((kpi, index) => (
                                                        <div key={index} className="rounded border p-3">
                                                            <div className="text-sm font-medium">{kpi.metric}</div>
                                                            <div className="mt-1 flex items-center justify-between">
                                                                <span className="text-lg font-bold">
                                                                    {kpi.current}
                                                                    {kpi.unit}
                                                                </span>
                                                                <span className="text-sm text-muted-foreground">
                                                                    Target: {kpi.target}
                                                                    {kpi.unit}
                                                                </span>
                                                            </div>
                                                            <Progress
                                                                value={
                                                                    kpi.unit === '%'
                                                                        ? (kpi.current / kpi.target) * 100
                                                                        : kpi.unit.includes('reduction')
                                                                          ? (kpi.current / kpi.target) * 100
                                                                          : Math.max(0, 100 - (kpi.current / kpi.target) * 100)
                                                                }
                                                                className="mt-2 h-1"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="flex justify-end gap-2 border-t pt-4">
                                                <Button variant="outline" size="sm" onClick={() => handleViewStrategyDetails(strategy.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => handleEditStrategy(strategy.id)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit Strategy
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-6">
                        {/* Compliance Dashboard */}
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Regulatory Compliance</p>
                                            <p className="text-2xl font-bold">92%</p>
                                        </div>
                                        <FileText className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <Progress value={92} className="mt-2 h-2" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Safety Compliance</p>
                                            <p className="text-2xl font-bold">78%</p>
                                        </div>
                                        <Shield className="h-8 w-8 text-green-600" />
                                    </div>
                                    <Progress value={78} className="mt-2 h-2" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Environmental</p>
                                            <p className="text-2xl font-bold">85%</p>
                                        </div>
                                        <Thermometer className="h-8 w-8 text-green-600" />
                                    </div>
                                    <Progress value={85} className="mt-2 h-2" />
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Insurance</p>
                                            <p className="text-2xl font-bold">96%</p>
                                        </div>
                                        <ShieldCheck className="h-8 w-8 text-blue-600" />
                                    </div>
                                    <Progress value={96} className="mt-2 h-2" />
                                </CardContent>
                            </Card>
                        </div>

                        {/* Compliance Issues */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <AlertTriangle className="h-5 w-5" />
                                        Compliance Issues
                                    </CardTitle>
                                    <Button onClick={handleCreateNewComplianceCheck}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        New Compliance Check
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        {
                                            type: 'Safety',
                                            issue: 'Operator certification expired for 3 equipment units',
                                            severity: 'high',
                                            dueDate: '2024-02-15',
                                            equipment: ['Excavator CAT-320', 'Bulldozer CAT-D8'],
                                        },
                                        {
                                            type: 'Environmental',
                                            issue: 'Emission testing overdue for diesel equipment',
                                            severity: 'medium',
                                            dueDate: '2024-03-01',
                                            equipment: ['Bulldozer CAT-D8'],
                                        },
                                        {
                                            type: 'Regulatory',
                                            issue: 'Annual inspection pending for lifting equipment',
                                            severity: 'medium',
                                            dueDate: '2024-02-28',
                                            equipment: ['Crane Liebherr-LTM'],
                                        },
                                    ].map((issue, index) => (
                                        <div key={index} className="flex items-center justify-between rounded-lg border p-4">
                                            <div className="flex items-center gap-3">
                                                <AlertTriangle
                                                    className={`h-5 w-5 ${
                                                        issue.severity === 'high'
                                                            ? 'text-red-500'
                                                            : issue.severity === 'medium'
                                                              ? 'text-yellow-500'
                                                              : 'text-blue-500'
                                                    }`}
                                                />
                                                <div>
                                                    <div className="font-medium">{issue.issue}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        Type: {issue.type} | Due: {issue.dueDate}
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">Equipment: {issue.equipment.join(', ')}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                                                <Button variant="outline" size="sm" onClick={() => handleResolveIssue(index)}>
                                                    <CheckSquare className="mr-2 h-4 w-4" />
                                                    Resolve
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics" className="space-y-6">
                        {/* Risk Analytics */}
                        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <BarChart3 className="h-5 w-5" />
                                        Risk by Category
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart
                                            data={[
                                                { category: 'Operational', risks: 8, mitigated: 3 },
                                                { category: 'Safety', risks: 6, mitigated: 2 },
                                                { category: 'Financial', risks: 4, mitigated: 2 },
                                                { category: 'Environmental', risks: 3, mitigated: 2 },
                                                { category: 'Technical', risks: 2, mitigated: 1 },
                                                { category: 'Compliance', risks: 1, mitigated: 1 },
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="category" />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar dataKey="risks" fill="#ef4444" name="Total Risks" />
                                            <Bar dataKey="mitigated" fill="#22c55e" name="Mitigated" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5" />
                                        Risk Score Distribution
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart
                                            data={[
                                                { score: '0-20', count: 4 },
                                                { score: '21-40', count: 9 },
                                                { score: '41-60', count: 6 },
                                                { score: '61-80', count: 4 },
                                                { score: '81-100', count: 1 },
                                            ]}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="score" />
                                            <YAxis />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Predictive Analytics */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5" />
                                    Predictive Risk Analytics
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Risk Predictions</h3>
                                        <div className="space-y-3">
                                            {[
                                                { risk: 'Equipment Failure', probability: 78, timeframe: '30 days' },
                                                { risk: 'Safety Incident', probability: 23, timeframe: '90 days' },
                                                { risk: 'Compliance Violation', probability: 45, timeframe: '60 days' },
                                            ].map((prediction, index) => (
                                                <div key={index} className="rounded border p-3">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="font-medium">{prediction.risk}</span>
                                                        <span className="text-sm text-muted-foreground">{prediction.timeframe}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <Progress value={prediction.probability} className="mr-2 flex-1" />
                                                        <span className="text-sm font-medium">{prediction.probability}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold">AI Recommendations</h3>
                                        <div className="space-y-3">
                                            {[
                                                'Increase maintenance frequency for aging equipment',
                                                'Implement additional safety training programs',
                                                'Review environmental monitoring protocols',
                                                'Update cybersecurity measures for IoT devices',
                                            ].map((recommendation, index) => (
                                                <div key={index} className="flex items-start gap-2 rounded border p-3">
                                                    <Lightbulb className="mt-0.5 h-4 w-4 text-yellow-500" />
                                                    <span className="text-sm">{recommendation}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold">Cost Impact Analysis</h3>
                                        <div className="space-y-3">
                                            {[
                                                { scenario: 'No Action', cost: 485000, probability: 85 },
                                                { scenario: 'Partial Mitigation', cost: 325000, probability: 45 },
                                                { scenario: 'Full Mitigation', cost: 125000, probability: 15 },
                                            ].map((scenario, index) => (
                                                <div key={index} className="rounded border p-3">
                                                    <div className="mb-2 flex items-center justify-between">
                                                        <span className="font-medium">{scenario.scenario}</span>
                                                        <span className="text-sm font-bold">{formatCurrency(scenario.cost)}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-muted-foreground">Risk Probability</span>
                                                        <span className="text-sm">{scenario.probability}%</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* History Tab */}
                    <TabsContent value="history" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Assignment History
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockAssignmentHistory.map((assignment) => (
                                        <div key={assignment.id} className="space-y-3 rounded-lg border p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="font-medium">{assignment.itemName}</h4>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>Type: {assignment.itemType}</span>
                                                        <span>Assigned to: {assignment.assignedTo}</span>
                                                        <span>By: {assignment.assignedBy}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={`${
                                                            assignment.priority === 'urgent'
                                                                ? 'border-red-200 bg-red-100 text-red-700'
                                                                : assignment.priority === 'high'
                                                                  ? 'border-orange-200 bg-orange-100 text-orange-700'
                                                                  : assignment.priority === 'medium'
                                                                    ? 'border-yellow-200 bg-yellow-100 text-yellow-700'
                                                                    : 'border-green-200 bg-green-100 text-green-700'
                                                        }`}
                                                    >
                                                        {assignment.priority}
                                                    </Badge>
                                                    <Badge
                                                        className={`${
                                                            assignment.status === 'completed'
                                                                ? 'border-green-200 bg-green-100 text-green-700'
                                                                : assignment.status === 'in_progress'
                                                                  ? 'border-blue-200 bg-blue-100 text-blue-700'
                                                                  : assignment.status === 'overdue'
                                                                    ? 'border-red-200 bg-red-100 text-red-700'
                                                                    : 'border-gray-200 bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {assignment.status.replace('_', ' ')}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Assigned:</span>
                                                    <div className="font-medium">{assignment.assignedDate}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Due:</span>
                                                    <div className="font-medium">{assignment.dueDate}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Completed:</span>
                                                    <div className="font-medium">{assignment.completedDate || 'N/A'}</div>
                                                </div>
                                            </div>
                                            {assignment.notes && (
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Notes:</span>
                                                    <div className="mt-1 rounded bg-gray-50 p-2 text-gray-700">{assignment.notes}</div>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleViewAssignmentHistory(assignment.id)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Details
                                                </Button>
                                                {assignment.status !== 'completed' && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleAssignTask(assignment.itemId, assignment.itemType)}
                                                    >
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Reassign
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText className="h-5 w-5" />
                                        Risk Documents
                                    </CardTitle>
                                    <Button onClick={() => handleUploadDocument()}>
                                        <Upload className="mr-2 h-4 w-4" />
                                        Upload Document
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockRiskDocuments.map((document) => (
                                        <div key={document.id} className="space-y-3 rounded-lg border p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="space-y-1">
                                                    <h4 className="flex items-center gap-2 font-medium">
                                                        {document.fileType === 'PDF' ? (
                                                            <FileText className="h-4 w-4" />
                                                        ) : document.fileType === 'ZIP' ? (
                                                            <Archive className="h-4 w-4" />
                                                        ) : (
                                                            <FileText className="h-4 w-4" />
                                                        )}
                                                        {document.name}
                                                    </h4>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>Type: {document.type}</span>
                                                        <span>Category: {document.category}</span>
                                                        <span>Size: {document.fileSize}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        className={`${
                                                            document.status === 'active'
                                                                ? 'border-green-200 bg-green-100 text-green-700'
                                                                : 'border-gray-200 bg-gray-100 text-gray-700'
                                                        }`}
                                                    >
                                                        {document.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="text-sm text-muted-foreground">{document.description}</div>
                                            <div className="grid grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <span className="text-muted-foreground">Uploaded:</span>
                                                    <div className="font-medium">{document.uploadDate}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">By:</span>
                                                    <div className="font-medium">{document.uploadedBy}</div>
                                                </div>
                                                <div>
                                                    <span className="text-muted-foreground">Expires:</span>
                                                    <div className="font-medium">{document.expiryDate || 'N/A'}</div>
                                                </div>
                                            </div>
                                            {document.relatedRisks && document.relatedRisks.length > 0 && (
                                                <div className="text-sm">
                                                    <span className="text-muted-foreground">Related Risks:</span>
                                                    <div className="mt-1 flex flex-wrap gap-1">
                                                        {document.relatedRisks.map((riskId) => (
                                                            <Badge key={riskId} variant="outline" className="text-xs">
                                                                Risk #{riskId}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            <div className="flex gap-2">
                                                <Button variant="outline" size="sm" onClick={() => handleDownloadDocument(document.id)}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download
                                                </Button>
                                                <Button variant="outline" size="sm">
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    Preview
                                                </Button>
                                                {document.status === 'active' && (
                                                    <Button variant="outline" size="sm" onClick={() => handleDeleteDocument(document.id)}>
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
};

export default RiskManagement;
