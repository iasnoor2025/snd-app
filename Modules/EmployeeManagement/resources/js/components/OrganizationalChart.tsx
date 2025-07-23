import { Avatar, AvatarFallback, AvatarImage } from '@/../../Modules/Core/resources/js/Components/ui/avatar';
import { Button } from '@/../../Modules/Core/resources/js/Components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/../../Modules/Core/resources/js/Components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/../../Modules/Core/resources/js/Components/ui/dialog';
import { useEffect, useRef, useState } from 'react';
import { Tree } from 'react-d3-tree';
import { toast } from 'sonner';

interface OrgNode {
    id: number;
    name: string;
    type: string;
    manager: {
        id: number;
        name: string;
        title: string;
        avatar: string;
    } | null;
    totalEmployees: number;
    metadata: any;
    children?: OrgNode[];
}

interface OrganizationalChartProps {
    initialData?: OrgNode;
}

export function OrganizationalChart({ initialData }: OrganizationalChartProps) {
    const [data, setData] = useState<OrgNode | null>(initialData || null);
    const [selectedNode, setSelectedNode] = useState<OrgNode | null>(null);
    const [showNodeDialog, setShowNodeDialog] = useState(false);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!initialData) {
            fetchOrgData();
        }
    }, [initialData]);

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);

        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    const fetchOrgData = async () => {
        try {
            const response = await fetch('/api/organization/chart');
            const result = await response.json();
            setData(result.data);
        } catch (error) {
            toast.error('Failed to load organizational chart');
        }
    };

    const renderCustomNode = ({ nodeDatum }: { nodeDatum: any }) => {
        const node = nodeDatum as OrgNode;
        return (
            <g>
                <circle r={30} fill="#ffffff" stroke="#000000" strokeWidth={1} />
                <foreignObject x={-100} y={-20} width={200} height={100}>
                    <div className="flex flex-col items-center text-center">
                        <div className="font-medium">{node.name}</div>
                        <div className="text-sm text-gray-500">{node.type}</div>
                        {node.manager && (
                            <div className="mt-1 flex items-center">
                                <Avatar className="h-6 w-6">
                                    <AvatarImage src={node.manager.avatar} alt={node.manager.name} />
                                    <AvatarFallback>
                                        {node.manager.name
                                            .split(' ')
                                            .map((n) => n[0])
                                            .join('')}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="ml-1 text-xs">{node.manager.name}</span>
                            </div>
                        )}
                        <div className="text-xs text-gray-400">{node.totalEmployees} employees</div>
                    </div>
                </foreignObject>
            </g>
        );
    };

    const handleNodeClick = (nodeDatum: any) => {
        setSelectedNode(nodeDatum);
        setShowNodeDialog(true);
    };

    return (
        <Card className="h-[800px] w-full">
            <CardHeader>
                <CardTitle>Organizational Chart</CardTitle>
                <CardDescription>View and manage the organizational structure</CardDescription>
            </CardHeader>
            <CardContent>
                <div ref={containerRef} className="h-[700px] w-full">
                    {data && dimensions.width > 0 && (
                        <Tree
                            data={data}
                            orientation="vertical"
                            renderCustomNodeElement={renderCustomNode}
                            onNodeClick={handleNodeClick}
                            dimensions={dimensions}
                            translate={{ x: dimensions.width / 2, y: 50 }}
                            separation={{ siblings: 2, nonSiblings: 2.5 }}
                            zoom={0.8}
                            enableLegacyTransitions={true}
                            pathFunc="step"
                        />
                    )}
                </div>
            </CardContent>

            <Dialog open={showNodeDialog} onOpenChange={setShowNodeDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Unit Details</DialogTitle>
                        <DialogDescription>View details and manage this organizational unit</DialogDescription>
                    </DialogHeader>

                    {selectedNode && (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium">{selectedNode.name}</h3>
                                <p className="text-sm text-gray-500">{selectedNode.type}</p>
                            </div>

                            {selectedNode.manager && (
                                <div>
                                    <h4 className="mb-2 text-sm font-medium">Manager</h4>
                                    <div className="flex items-center">
                                        <Avatar>
                                            <AvatarImage src={selectedNode.manager.avatar} alt={selectedNode.manager.name} />
                                            <AvatarFallback>
                                                {selectedNode.manager.name
                                                    .split(' ')
                                                    .map((n) => n[0])
                                                    .join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="ml-3">
                                            <div className="font-medium">{selectedNode.manager.name}</div>
                                            <div className="text-sm text-gray-500">{selectedNode.manager.title}</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <h4 className="mb-2 text-sm font-medium">Statistics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-sm text-gray-500">Total Employees</div>
                                        <div className="text-lg font-medium">{selectedNode.totalEmployees}</div>
                                    </div>
                                    <div className="rounded-lg bg-gray-50 p-3">
                                        <div className="text-sm text-gray-500">Direct Reports</div>
                                        <div className="text-lg font-medium">{selectedNode.children?.length || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={() => setShowNodeDialog(false)}>Close</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
