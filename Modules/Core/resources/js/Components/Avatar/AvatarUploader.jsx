import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from '../ui';
import { Label } from "@/Core";
import { toast } from 'sonner';
import { Camera, Upload, X, Crop, RotateCw } from 'lucide-react';

const AvatarUploader = ({ user, onAvatarUpdate }) => {
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should be less than 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleUpload = async () => {
        if (!preview) return;

        setIsUploading(true);
        try {
            // Simulate upload delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // In a real implementation, you would upload to your server here
            // const formData = new FormData();
            // formData.append('avatar', fileInputRef.current.files[0]);
            // const response = await fetch('/api/avatar', { method: 'POST', body: formData });
            // const data = await response.json();

            // For now, just pass the preview URL
            onAvatarUpdate(preview);
            toast.success('Avatar uploaded successfully');
            setPreview(null);
        } catch (error) {
            toast.error('Failed to upload avatar');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    };

    const handleClear = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Upload Avatar
                </CardTitle>
                <CardDescription>
                    Choose an image file to set as your profile picture
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Upload Area */}
                <div className="space-y-2">
                    <Label htmlFor="avatar">Select Image</Label>
                    <Input
                        ref={fileInputRef}
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="cursor-pointer"
                    />
                    <p className="text-sm text-muted-foreground">
                        Supported formats: JPG, PNG, GIF (max. 5MB)
                    </p>
                </div>

                {/* Preview Area */}
                {preview && (
                    <div className="space-y-4">
                        <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-lg border">
                            <img
                                src={preview}
                                alt="Avatar preview"
                                className="h-full w-full object-cover"
                            />
                            <button
                                onClick={handleClear}
                                className="absolute right-2 top-2 rounded-full bg-gray-900/50 p-1 text-white hover:bg-gray-900/75"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Image Controls */}
                        <div className="flex items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => toast.info('Crop feature coming soon')}
                            >
                                <Crop className="h-4 w-4" />
                                Crop
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => toast.info('Rotate feature coming soon')}
                            >
                                <RotateCw className="h-4 w-4" />
                                Rotate
                            </Button>
                        </div>

                        {/* Upload Button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={handleUpload}
                                disabled={isUploading}
                                className="flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                {isUploading ? 'Uploading...' : 'Upload Avatar'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Guidelines */}
                <div className="rounded-lg border p-4 text-sm text-muted-foreground">
                    <h4 className="font-medium text-foreground mb-2">Upload Guidelines:</h4>
                    <ul className="list-disc list-inside space-y-1">
                        <li>Use a square image for best results</li>
                        <li>Keep the file size under 5MB</li>
                        <li>Use high-resolution images for better quality</li>
                        <li>Avoid using copyrighted images</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
};

export default AvatarUploader;
