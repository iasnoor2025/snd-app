import { FC, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Upload, X } from 'lucide-react';
import { ControllerRenderProps } from 'react-hook-form';

interface FileUploadProps {
  field: ControllerRenderProps<any, any>
  name: string;
  onFileSelect: (file: File) => void;
}

export const FileUpload: FC<FileUploadProps> = ({ field, name, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const { t } = useTranslation('employee');

    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    field.onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        className="flex-1"
        <Upload className="mr-2 h-4 w-4" />
        {selectedFile ? selectedFile.name : 'Upload File'}
      </Button>
      {selectedFile && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={handleRemoveFile}
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}; 
















