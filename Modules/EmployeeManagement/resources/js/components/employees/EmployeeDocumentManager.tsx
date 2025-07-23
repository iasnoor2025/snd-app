









import axios from 'axios';
import { format } from 'date-fns';
import { Calendar, Download, File, FileCheck, Plus, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Document } from '../../types/employee';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, Badge, Button, Card, CardContent, CardHeader, CardTitle, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, Input, Label, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Tabs, TabsContent, TabsList, TabsTrigger } from '@/Core/Components/ui';

axios.defaults.withCredentials = true;

interface DocumentCategory {
    id: string;
    name: string;
    description?: string;
}

interface EmployeeDocumentManagerProps {
    employeeId: number;
    initialDocuments?: Document[];
}

const DOCUMENT_CATEGORIES: DocumentCategory[] = [
    { id: 'identification', name: 'Identification' },
    { id: 'visa', name: 'Visa & Permits' },
    { id: 'licenses', name: 'Licenses & Certifications' },
    { id: 'medical', name: 'Medical Records' },
    { id: 'employment', name: 'Employment Documents' },
    { id: 'education', name: 'Education' },
    { id: 'other', name: 'Other Documents' },
];

// Add declaration merging for Document to include expiry_date?
declare module '../../types/employee' {
    interface Document {
        expiry_date?: string;
    }
}

async function ensureSanctumCsrf() {
    await axios.get('/sanctum/csrf-cookie');
}

export const EmployeeDocumentManager: React.FC<EmployeeDocumentManagerProps> = ({ employeeId, initialDocuments = [] }) => {
    const { t } = useTranslation('employee');
    const [documents, setDocuments] = useState<Document[]>(initialDocuments);
    const [loading, setLoading] = useState(!initialDocuments.length);
    const [currentUpload, setCurrentUpload] = useState<{
        file: File | null;
        name: string;
        type: string;
        expiryDate: string;
    }>({
        file: null,
        name: '',
        type: 'identification',
        expiryDate: '',
    });
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
    const [documentsByCategory, setDocumentsByCategory] = useState<Record<string, Document[]>>({});
    const [currentTab, setCurrentTab] = useState('all');
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

    useEffect(() => {
        if (!initialDocuments.length) {
            fetchDocuments();
        } else {
            organizeDocumentsByCategory(initialDocuments);
        }
    }, [employeeId, initialDocuments]);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            await ensureSanctumCsrf();
            const response = await axios.get(`/api/v1/employees/${employeeId}/documents`);
            setDocuments(response.data.data);
            organizeDocumentsByCategory(response.data.data);
        } catch (error) {
            console.error('Error fetching employee documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const organizeDocumentsByCategory = (docs: Document[]) => {
        const byCategory: Record<string, Document[]> = {
            all: [...docs],
        };

        DOCUMENT_CATEGORIES.forEach((category) => {
            byCategory[category.id] = docs.filter((doc) => doc.collection_name === category.id);
        });

        setDocumentsByCategory(byCategory);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setCurrentUpload({
                ...currentUpload,
                file,
                name: file.name.split('.')[0], // Default name from filename without extension
            });
        }
    };

    const handleUpload = async () => {
        if (!currentUpload.file || !currentUpload.name) return;

        setIsUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', currentUpload.file);
        formData.append('name', currentUpload.name);
        formData.append('type', currentUpload.type);

        if (currentUpload.expiryDate) {
            formData.append('expiry_date', currentUpload.expiryDate);
        }

        try {
            await ensureSanctumCsrf();
            const response = await axios.post(`/api/v1/employees/${employeeId}/documents`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
                    setUploadProgress(percentCompleted);
                },
            });

            // Add new document to state
            const newDocument = response.data.data;
            const updatedDocs = [...documents, newDocument];
            setDocuments(updatedDocs);
            organizeDocumentsByCategory(updatedDocs);

            // Reset form
            setCurrentUpload({
                file: null,
                name: '',
                type: 'identification',
                expiryDate: '',
            });

            setUploadDialogOpen(false);
        } catch (error) {
            console.error('Error uploading document:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const confirmDeleteDocument = (document: Document) => {
        setDocumentToDelete(document);
        setDeleteDialogOpen(true);
    };

    const handleDeleteDocument = async () => {
        if (!documentToDelete) return;

        try {
            await axios.delete(`/api/v1/employees/${employeeId}/documents/${documentToDelete.id}`);

            // Remove document from state
            const updatedDocs = documents.filter((doc) => doc.id !== documentToDelete.id);
            setDocuments(updatedDocs);
            organizeDocumentsByCategory(updatedDocs);
        } catch (error) {
            console.error('Error deleting document:', error);
        } finally {
            setDeleteDialogOpen(false);
            setDocumentToDelete(null);
        }
    };

    const handleVerifyDocument = async (documentId: number) => {
        try {
            const response = await axios.patch(`/api/v1/employees/${employeeId}/documents/${documentId}/verify`);

            // Update document in state
            const updatedDocs = documents.map((doc) => (doc.id === documentId ? response.data.data : doc));

            setDocuments(updatedDocs);
            organizeDocumentsByCategory(updatedDocs);
        } catch (error) {
            console.error('Error verifying document:', error);
        }
    };

    const renderDocumentIcon = (document: Document) => {
        const fileType = document.url.split('.').pop()?.toLowerCase();

        if (fileType === 'pdf') {
            return <File className="h-6 w-6 text-red-500" />;
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType || '')) {
            return <File className="h-6 w-6 text-blue-500" />;
        } else if (['doc', 'docx'].includes(fileType || '')) {
            return <File className="h-6 w-6 text-indigo-500" />;
        } else {
            return <File className="h-6 w-6 text-gray-500" />;
        }
    };

    const isDocumentExpired = (document: Document) => {
        if (!document.expiry_date) return false;

        const expiryDate = new Date(document.expiry_date);
        const today = new Date();

        return expiryDate < today;
    };

    const getExpiryStatusBadge = (document: Document) => {
        if (!document.expiry_date) return null;

        const expiryDate = new Date(document.expiry_date);
        const today = new Date();
        const monthDiff = (expiryDate.getFullYear() - today.getFullYear()) * 12 + (expiryDate.getMonth() - today.getMonth());

        if (expiryDate < today) {
            return (
                <Badge variant="destructive" className="ml-2">
                    Expired
                </Badge>
            );
        } else if (monthDiff <= 1) {
            return (
                <Badge variant="secondary" className="ml-2 border-yellow-300 bg-yellow-200 text-yellow-800">
                    {t('expiring_soon')}
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="ml-2 border-green-300 bg-green-100 text-green-800">
                    Valid
                </Badge>
            );
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle>{t('ttl_employee_documents')}</CardTitle>
                        <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="flex items-center gap-1">
                                    <Plus className="h-4 w-4" />
                                    {t('ttl_upload_document')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('ttl_upload_document')}</DialogTitle>
                                    <DialogDescription>
                                        Upload a new document for this employee. Supported formats include PDF, images, and Office documents.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="document-file">{t('lbl_document_file')}</Label>
                                        <Input id="document-file" type="file" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" />
                                    </div>

                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="document-name">{t('lbl_document_name')}</Label>
                                        <Input
                                            id="document-name"
                                            placeholder={t('ph_enter_document_name')}
                                            value={currentUpload.name}
                                            onChange={(e) => setCurrentUpload({ ...currentUpload, name: e.target.value })}
                                        />
                                    </div>

                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="document-type">{t('lbl_document_type')}</Label>
                                        <Select
                                            value={currentUpload.type}
                                            onValueChange={(value) => setCurrentUpload({ ...currentUpload, type: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={t('ph_select_document_type')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {DOCUMENT_CATEGORIES.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="grid w-full items-center gap-1.5">
                                        <Label htmlFor="expiry-date">Expiry Date (if applicable)</Label>
                                        <div className="relative">
                                            <Input
                                                id="expiry-date"
                                                type="date"
                                                value={currentUpload.expiryDate}
                                                onChange={(e) => setCurrentUpload({ ...currentUpload, expiryDate: e.target.value })}
                                            />
                                            <Calendar className="absolute top-2.5 right-3 h-4 w-4 text-gray-500" />
                                        </div>
                                    </div>

                                    {isUploading && (
                                        <div className="h-2.5 w-full rounded-full bg-gray-200">
                                            <div className="h-2.5 rounded-full bg-primary" style={{ width: `${uploadProgress}%` }}></div>
                                            <p className="mt-1 text-center text-xs">{uploadProgress}% uploaded</p>
                                        </div>
                                    )}
                                </div>

                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogClose>
                                    <Button onClick={handleUpload} disabled={!currentUpload.file || !currentUpload.name || isUploading}>
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent>
                    <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">{t('all_documents')}</TabsTrigger>
                            {DOCUMENT_CATEGORIES.map((category) => (
                                <TabsTrigger key={category.id} value={category.id} disabled={!documentsByCategory[category.id]?.length}>
                                    {category.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Tab content for each category */}
                        {Object.entries(documentsByCategory).map(([categoryId, docs]) => (
                            <TabsContent key={categoryId} value={categoryId} className="p-0">
                                {docs.length === 0 ? (
                                    <div className="rounded-md border py-10 text-center">
                                        <p className="text-gray-500">No documents in this category.</p>
                                    </div>
                                ) : (
                                    <div className="rounded-md border">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className="w-[50px]">Type</TableHead>
                                                    <TableHead>{t('lbl_document_name')}</TableHead>
                                                    <TableHead>{t('expiry_date')}</TableHead>
                                                    <TableHead>{t('th_uploaded_on')}</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {docs.map((document) => (
                                                    <TableRow key={document.id}>
                                                        <TableCell>
                                                            <div className="flex justify-center">{renderDocumentIcon(document)}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="font-medium">{document.name}</div>
                                                            <div className="text-sm text-gray-500">
                                                                {DOCUMENT_CATEGORIES.find((c) => c.id === document.collection_name)?.name ||
                                                                    document.collection_name}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            {document.expiry_date ? (
                                                                <div className="flex items-center">
                                                                    <span>{format(new Date(document.expiry_date), 'MMM d, yyyy')}</span>
                                                                    {getExpiryStatusBadge(document)}
                                                                </div>
                                                            ) : (
                                                                <span className="text-gray-500">{t('no_expiry')}</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{format(new Date(document.created_at), 'MMM d, yyyy')}</TableCell>
                                                        <TableCell className="text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(document.url, '_blank')}
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                    <span className="sr-only">Download</span>
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => handleVerifyDocument(document.id)}>
                                                                    <FileCheck className="h-4 w-4" />
                                                                    <span className="sr-only">Verify</span>
                                                                </Button>
                                                                <Button variant="ghost" size="icon" onClick={() => confirmDeleteDocument(document)}>
                                                                    <Trash className="h-4 w-4" />
                                                                    <span className="sr-only">Delete</span>
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('ttl_delete_document')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteDocument} className="bg-red-500 hover:bg-red-600">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default EmployeeDocumentManager;
