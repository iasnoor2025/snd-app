import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from '../ui/dialog';
import { FileText, Image as ImageIcon, Upload, File as FileIcon } from 'lucide-react';
import DashboardWidgetCard from './DashboardWidgetCard';
import { formatDateMedium } from '../../utils/dateFormatter';
import { formatDateTime, formatDateShort } from '../../utils/dateFormatter';

interface FileItem {
  id: string;
  name: string;
  uploader: string;
  date: string;
  type?: 'pdf' | 'image' | 'doc' | 'other';
  url?: string;
}

interface FilesWidgetProps {
  files: FileItem[];
  className?: string;
  onRemove: () => void;
}

const typeMap = {
  pdf: <FileText className="h-4 w-4 text-red-500" />,
  image: <ImageIcon className="h-4 w-4 text-blue-500" />,
  doc: <FileText className="h-4 w-4 text-green-500" />,
  other: <FileIcon className="h-4 w-4 text-gray-400" />,
};

const FilesWidget: React.FC<FilesWidgetProps> = ({ files, className = '', onRemove }) => {
  const [open, setOpen] = useState(false);
  return (
    <DashboardWidgetCard title="Files" summary={files.length === 0 ? 'No files uploaded' : `Total: ${files.length}`} onRemove={onRemove} className={className}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <button className="ml-2 p-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/80" title="Upload File">
            <Upload className="h-4 w-4" />
          </button>
        </DialogTrigger>
        <DialogContent>
          <DialogTitle>Upload File</DialogTitle>
          <DialogDescription>File upload form coming soon...</DialogDescription>
        </DialogContent>
      </Dialog>
      {/*
      <CardContent>
        <ul className="space-y-2">
          {files.length === 0 ? (
            <li className="text-muted-foreground text-sm">No files uploaded.</li>
          ) : (
            files.map((file) => (
              <li key={file.id} className="flex items-center gap-2 text-sm border-b last:border-b-0 pb-2">
                {file.type === 'image' && file.url ? (
                  <img src={file.url} alt={file.name} className="h-6 w-6 rounded object-cover" />
                ) : (
                  typeMap[file.type || 'other']
                )}
                <span className="font-medium">{file.name}</span>
                <span className="text-xs text-muted-foreground ml-auto">{file.uploader} • {formatDateMedium(file.date)}</span>
              </li>
            ))
          )}
        </ul>
      </CardContent>
      */}
    </DashboardWidgetCard>
  );
};

export default FilesWidget;
export type { FilesWidgetProps, FileItem };
