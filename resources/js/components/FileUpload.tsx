import React, { useRef } from 'react';
import { Button } from "@/Core";
import { Input } from "@/Core";
import { toast } from 'sonner';
import { Upload, File } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number; // in bytes
  disabled?: boolean;
  className?: string;
  buttonText?: string;
  showFileName?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSize = 10 * 1024 * 1024, // 10MB default
  disabled = false,
  className = "",
  buttonText = "Upload File",
  showFileName = true
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validate file size
    if (file.size > maxSize) {
      toast.error(`File size must be less than ${(maxSize / (1024 * 1024)).toFixed(1)}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = accept.split(',').map(type => {
      if (type.startsWith('.')) {
        // Convert extension to MIME type
        const ext = type.toLowerCase();
        switch (ext) {
          case '.pdf': return 'application/pdf';
          case '.jpg':
          case '.jpeg': return 'image/jpeg';
          case '.png': return 'image/png';
          case '.gif': return 'image/gif';
          case '.doc': return 'application/msword';
          case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          default: return type;
        }
      }
      return type.trim();
    });

    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast.error('Please upload a file with the allowed format');
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled}
        className="flex items-center gap-2"
      >
        <Upload className="h-4 w-4" />
        {buttonText}
      </Button>

      {showFileName && selectedFile && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <File className="h-4 w-4" />
          <span className="truncate max-w-[200px]" title={selectedFile.name}>
            {selectedFile.name}
          </span>
          <span className="text-xs">
            ({formatFileSize(selectedFile.size)})
          </span>
        </div>
      )}
    </div>
  );
};

export default FileUpload; 
