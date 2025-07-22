import { Button, Input } from '@/Core';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    accept?: string;
    maxSize?: number;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept = '', maxSize }) => {
    const { t } = useTranslation('common');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (maxSize && file.size > maxSize) {
                setError(t('upload_error'));
                setSelectedFile(null);
                return;
            }
            setSelectedFile(file);
            setError(null);
            onFileSelect(file);
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="flex items-center gap-2">
            <Input type="file" ref={fileInputRef} onChange={handleFileChange} accept={accept} className="hidden" />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="flex-1">
                {selectedFile ? selectedFile.name : t('btn_upload')}
            </Button>
            {selectedFile && (
                <Button type="button" variant="ghost" size="icon" onClick={handleRemoveFile}>
                    ×
                </Button>
            )}
            {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
        </div>
    );
};

export default FileUpload;
