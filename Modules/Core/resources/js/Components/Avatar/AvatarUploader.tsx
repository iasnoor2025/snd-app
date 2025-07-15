import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Upload, Camera, User } from 'lucide-react';
import { Input } from '../../ui/input';
import { Label } from "@/Core";

interface AvatarUploaderProps {
  user: {
    id?: number;
    name: string;
    email: string;
    avatar?: string;
  };
  onAvatarUpdate?: (avatarUrl: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ user, onAvatarUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const getInitials = (name: string) => {
    if (!name) return '?';
    const names = name.trim().split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);

    // Simulate upload
    setIsUploading(true);
    setTimeout(() => {
      setIsUploading(false);
      if (onAvatarUpdate) {
        onAvatarUpdate(previewUrl || '');
      }
    }, 2000);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(null);
    if (onAvatarUpdate) {
      onAvatarUpdate('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Avatar Upload
        </CardTitle>
        <CardDescription>
          Upload a new avatar image. Supported formats: JPG, PNG, GIF (max 2MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage
              src={previewUrl || user.avatar}
              alt={user.name}
            />
            <AvatarFallback className="text-2xl">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex flex-col items-center space-y-2">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {isUploading ? 'Uploading...' : 'Upload New'}
              </Button>

              {(previewUrl || user.avatar) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                >
                  Remove
                </Button>
              )}
            </div>

            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            <p className="text-xs text-muted-foreground text-center">
              Click "Upload New" to select an image from your device
            </p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Use a square image for best results</li>
            <li>Recommended size: 400x400 pixels or larger</li>
            <li>Maximum file size: 2MB</li>
            <li>Supported formats: JPG, PNG, GIF</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default AvatarUploader;
