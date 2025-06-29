import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@/Core';
import { toast } from 'sonner';

export default function ProjectDocuments({ projectId, currentUser }: { projectId: number, currentUser: { id: number, name: string } }) {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [versionFile, setVersionFile] = useState<File | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const fetchDocuments = async () => {
    const { data } = await axios.get(`/api/projects/${projectId}/documents`);
    setDocuments(data);
  };

  useEffect(() => { fetchDocuments(); }, [projectId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name) return toast.error('Name and file required');
    setUploading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('file', file);
    try {
      await axios.post(`/api/projects/${projectId}/documents`, formData);
      toast.success('Document uploaded');
      setFile(null); setName('');
      fetchDocuments();
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (docId: number) => {
    window.location.href = `/api/projects/${projectId}/documents/${docId}/download`;
  };

  const handleVersionUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!versionFile || !selectedDoc) return toast.error('Select a document and file');
    const formData = new FormData();
    formData.append('file', versionFile);
    try {
      await axios.post(`/api/projects/${projectId}/documents/${selectedDoc.id}/version`, formData);
      toast.success('New version uploaded');
      setVersionFile(null); setSelectedDoc(null);
      fetchDocuments();
    } catch {
      toast.error('Version upload failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="flex gap-2 mb-6">
          <Input type="text" placeholder="Document name" value={name} onChange={e => setName(e.target.value)} required />
          <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required />
          <Button type="submit" disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
        </form>
        <div className="space-y-4">
          {documents.map((doc: any) => (
            <Card key={doc.id} className="p-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{doc.name}</div>
                  <div className="text-xs text-gray-500">Uploaded by: {doc.user?.name || 'User'} | Version: {doc.version}</div>
                  <div className="flex gap-2 mt-1">
                    <Button size="sm" variant="outline" onClick={() => handleDownload(doc.id)}>Download</Button>
                    <Button size="sm" variant="secondary" onClick={() => setSelectedDoc(doc)}>Upload New Version</Button>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">History:</div>
                  <ul className="text-xs">
                    {doc.versions?.map((ver: any) => (
                      <li key={ver.id}>
                        v{ver.version} by {ver.user?.name || 'User'}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {selectedDoc && (
          <form onSubmit={handleVersionUpload} className="flex gap-2 mt-6">
            <Label>Upload new version for: {selectedDoc.name}</Label>
            <Input type="file" onChange={e => setVersionFile(e.target.files?.[0] || null)} required />
            <Button type="submit">Upload Version</Button>
            <Button type="button" variant="secondary" onClick={() => { setSelectedDoc(null); setVersionFile(null); }}>Cancel</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
