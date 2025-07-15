import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// ShadCN UI Components
import {
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Core';
import { toast } from 'sonner';

// Icons
import { Download, Eye, File, FileSpreadsheet, FileText, Image, Trash2, Upload } from 'lucide-react';

interface Document {
    id: number;
    name: string;
    file_name: string;
    mime_type: string;
    size: number;
    url: string;
    custom_properties: {
        original_filename: string;
        uploaded_by: number | null;
        uploaded_at: string;
    };
    created_at: string;
}

interface DocumentsCardProps {
    rentalId: number;
    documents: Document[];
    canUpload?: boolean;
    canDelete?: boolean;
    className?: string;
}

export default function DocumentsCard({ rentalId, documents = [], canUpload = false, canDelete = false, className = '' }: DocumentsCardProps) {
    const { t } = useTranslation('rental');

    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        rental_id: rentalId,
        document: null as File | null,
        document_type: 'invoice', // default type
    });

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) {
            return <Image className="h-4 w-4 text-blue-500" />;
        } else if (mimeType === 'application/pdf') {
            return <FileText className="h-4 w-4 text-red-500" />;
        } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
            return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
        } else {
            return <File className="h-4 w-4 text-gray-500" />;
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setData('document', e.target.files[0]);
        }
    };

    const handleUpload = () => {
        post(route('rentals.documents.store', rentalId), {
            onSuccess: () => {
                toast.success('Document uploaded successfully');
                setIsUploadDialogOpen(false);
                reset();
            },
            onError: (errors) => {
                toast.error('Failed to upload document');
                console.error(errors);
            },
        });
    };

    const confirmDelete = (document: Document) => {
        setDocumentToDelete(document);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (!documentToDelete) return;

        post(route('rentals.documents.destroy', [rentalId, documentToDelete.id]), {
            method: 'delete',
            onSuccess: () => {
                toast.success('Document deleted successfully');
                setIsDeleteDialogOpen(false);
                setDocumentToDelete(null);
            },
            onError: (errors) => {
                toast.error('Failed to delete document');
                console.error(errors);
            },
        });
    };

    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Documents</CardTitle>
                        <CardDescription>{t('attachments_and_files_for_this_rental')}</CardDescription>
                    </div>
                    {canUpload && (
                        <Button variant="outline" size="sm" onClick={() => setIsUploadDialogOpen(true)}>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {documents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                        <p className="mb-2 text-muted-foreground">{t('no_documents_uploaded_yet')}</p>
                        {canUpload && (
                            <Button variant="default" size="sm" onClick={() => setIsUploadDialogOpen(true)} className="mt-2">
                                <Upload className="mr-2 h-4 w-4" />
                                {t('ttl_upload_document')}
                            </Button>
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Uploaded</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {documents.map((document) => (
                                <TableRow key={document.id}>
                                    <TableCell>
                                        <div className="flex items-center space-x-2">
                                            {getFileIcon(document.mime_type)}
                                            <span className="font-medium">{document.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{formatFileSize(document.size)}</TableCell>
                                    <TableCell>{document.created_at ? format(new Date(document.created_at), 'MMM d, yyyy') : 'N/A'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end space-x-2">
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                <a href={document.url} target="_blank" rel="noopener noreferrer">
                                                    <Eye className="h-4 w-4" />
                                                    <span className="sr-only">View</span>
                                                </a>
                                            </Button>
                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                <a href={`${document.url}?download=1`}>
                                                    <Download className="h-4 w-4" />
                                                    <span className="sr-only">Download</span>
                                                </a>
                                            </Button>
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                    onClick={() => confirmDelete(document)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete</span>
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </CardContent>

            {/* Upload Dialog */}
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_upload_document')}</DialogTitle>
                        <DialogDescription>Attach a document to this rental</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="document">Document</Label>
                            <Input id="document" type="file" onChange={handleFileChange} required />
                            {errors.document && <p className="mt-1 text-xs text-red-500">{errors.document}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleUpload} disabled={processing || !data.document}>
                            {processing ? 'Uploading...' : 'Upload'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('ttl_confirm_deletion')}</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this document? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={processing}>
                            {processing ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
