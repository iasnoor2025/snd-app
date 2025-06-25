import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ProjectToastService } from '../services/ProjectToastService';
import axios from 'axios';

interface Document {
    id: number;
    name: string;
    description: string;
    category: string;
    file_type: string;
    version: number;
    uploaded_by: {
        name: string;
    };
    formatted_file_size: string;
    created_at: string;
    is_shared: boolean;
}

const DOCUMENT_CATEGORIES = [
    'contract',
    'proposal',
    'report',
    'specification',
    'other'
];

export default function ProjectDocuments() {
    const { projectId } = useParams<{ projectId: string }>();
    const [documents, setDocuments] = useState<Record<string, Document[]>>({});
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadData, setUploadData] = useState({
        name: '',
        description: '',
        category: 'other',
        is_shared: false
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadDocuments();
    }, [projectId]);

    const loadDocuments = async () => {
        try {
            const documentsByCategory: Record<string, Document[]> = {};
            
            for (const category of DOCUMENT_CATEGORIES) {
                const response = await axios.get(`/api/projects/${projectId}/documents/${category}`);
                documentsByCategory[category] = response.data.data;
            }
            
            setDocuments(documentsByCategory);
        } catch (error) {
            toast.error('Failed to load documents');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadData(prev => ({
                ...prev,
                name: file.name
            }));
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            toast.error('Please select a file');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('file', selectedFile);
        Object.entries(uploadData).forEach(([key, value]) => {
            formData.append(key, value.toString());
        });

        try {
            await axios.post(`/api/projects/${projectId}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            ProjectToastService.documentUploaded(uploadData.name, 'Project');
            await loadDocuments();
            
            // Reset form
            setSelectedFile(null);
            setUploadData({
                name: '',
                description: '',
                category: 'other',
                is_shared: false
            });
            
            // Reset file input
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
            
        } catch (error) {
            toast.error('Failed to upload document');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (document: Document) => {
        try {
            await axios.delete(`/api/documents/${document.id}`);
            ProjectToastService.documentDeleted(document.name);
            await loadDocuments();
        } catch (error) {
            toast.error('Failed to delete document');
        }
    };

    const handleShare = async (document: Document, userIds: number[]) => {
        try {
            await axios.post(`/api/documents/${document.id}/share`, {
                user_ids: userIds
            });
            ProjectToastService.documentShared(document.name, 'team members');
            await loadDocuments();
        } catch (error) {
            toast.error('Failed to share document');
        }
    };

    return (
        <div className="container mx-auto py-6">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4">
                        <div>
                            <Label htmlFor="file">File</Label>
                            <Input
                                id="file"
                                type="file"
                                onChange={handleFileChange}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={uploadData.name}
                                onChange={(e) => setUploadData(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={uploadData.description}
                                onChange={(e) => setUploadData(prev => ({
                                    ...prev,
                                    description: e.target.value
                                }))}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={uploadData.category}
                                onValueChange={(value) => setUploadData(prev => ({
                                    ...prev,
                                    category: value
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DOCUMENT_CATEGORIES.map(category => (
                                        <SelectItem key={category} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleUpload} disabled={loading}>
                            {loading ? 'Uploading...' : 'Upload Document'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue={DOCUMENT_CATEGORIES[0]}>
                <TabsList>
                    {DOCUMENT_CATEGORIES.map(category => (
                        <TabsTrigger key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {DOCUMENT_CATEGORIES.map(category => (
                    <TabsContent key={category} value={category}>
                        <Card>
                            <CardHeader>
                                <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)} Documents</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Size</TableHead>
                                            <TableHead>Version</TableHead>
                                            <TableHead>Uploaded By</TableHead>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documents[category]?.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell>{doc.name}</TableCell>
                                                <TableCell>{doc.description}</TableCell>
                                                <TableCell>{doc.formatted_file_size}</TableCell>
                                                <TableCell>v{doc.version}</TableCell>
                                                <TableCell>{doc.uploaded_by.name}</TableCell>
                                                <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleDelete(doc)}
                                                        >
                                                            Delete
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleShare(doc, [])} // Add user selection UI
                                                        >
                                                            Share
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
} 