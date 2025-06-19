import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { cn } from "../../lib/utils";
import { SmartAvatar } from "./smart-avatar";
import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { Badge } from "./badge";
import { Camera, Upload, X, RotateCcw, Crop } from "lucide-react";
import { type UserAvatarData } from "@/services/avatar-service";

interface AvatarUploadProps {
  user: UserAvatarData;
  onUpload?: (file: File) => Promise<string>;
  onRemove?: () => Promise<void>;
  onUpdate?: (avatarUrl: string) => void;
  maxSize?: number; // in MB
  allowedTypes?: string[];
  showRemoveButton?: boolean;
  showUrlInput?: boolean;
  className?: string;
  disabled?: boolean;
}

export function AvatarUpload({
  user,
  onUpload,
  onRemove,
  onUpdate,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  showRemoveButton = true,
  showUrlInput = true,
  className,
  disabled = false
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!allowedTypes.includes(file.type)) {
      return `File type not supported. Allowed types: ${allowedTypes.join(', ')}`;
    }

    if (file.size > maxSize * 1024 * 1024) {
      return `File size too large. Maximum size: ${maxSize}MB`;
    }

    return null;
  }, [allowedTypes, maxSize]);

  const handleFileSelect = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    setUploadError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleUpload = useCallback(async () => {
    if (!fileInputRef.current?.files?.[0] || !onUpload) return;

    const file = fileInputRef.current.files[0];
    setIsUploading(true);
    setUploadError(null);

    try {
      const avatarUrl = await onUpload(file);
      onUpdate?.(avatarUrl);
      setPreviewUrl(null);
      setIsDialogOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  }, [onUpload, onUpdate]);

  const handleUrlSubmit = useCallback(async () => {
    if (!urlInput.trim()) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Validate URL by trying to load the image
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = urlInput;
      });

      onUpdate?.(urlInput);
      setUrlInput('');
      setIsDialogOpen(false);
    } catch (error) {
      setUploadError('Invalid image URL or image could not be loaded');
    } finally {
      setIsUploading(false);
    }
  }, [urlInput, onUpdate]);

  const handleRemove = useCallback(async () => {
    if (!onRemove) return;

    setIsUploading(true);
    try {
      await onRemove();
      onUpdate?.('');
      setIsDialogOpen(false);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Remove failed');
    } finally {
      setIsUploading(false);
    }
  }, [onRemove, onUpdate]);

  const clearPreview = useCallback(() => {
    setPreviewUrl(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className={cn("relative", className)}>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <div className="relative group cursor-pointer">
            <SmartAvatar
              user={user}
              size="xl"
              className="transition-opacity group-hover:opacity-80"
            />
            {!disabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                <Camera className="h-6 w-6 text-white" />
              </div>
            )}
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Avatar</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Avatar Preview */}
            <div className="flex justify-center">
              <SmartAvatar
                user={{
                  ...user,
                  avatar: previewUrl || user.avatar
                }}
                size="2xl"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Upload Image</Label>
              <div
                className={cn(
                  "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-colors",
                  "hover:border-muted-foreground/50 cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => !disabled && fileInputRef.current?.click()}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop an image here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Max {maxSize}MB • {allowedTypes.map(type => type.split('/')[1]).join(', ')}
                </p>
              </div>
              <Input
                ref={fileInputRef}
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
              />
            </div>

            {/* URL Input */}
            {showUrlInput && (
              <div className="space-y-2">
                <Label>Or enter image URL</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/avatar.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    disabled={disabled || isUploading}
                  />
                  <Button
                    onClick={handleUrlSubmit}
                    disabled={!urlInput.trim() || disabled || isUploading}
                    size="sm"
                  >
                    Set
                  </Button>
                </div>
              </div>
            )}

            {/* Error Display */}
            {uploadError && (
              <Badge variant="destructive" className="w-full justify-center">
                {uploadError}
              </Badge>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4">
              {previewUrl && (
                <>
                  <Button
                    onClick={clearPreview}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Button
                    onClick={handleUpload}
                    size="sm"
                    className="flex-1"
                    disabled={isUploading || !onUpload}
                  >
                    {isUploading ? 'Uploading...' : 'Upload'}
                  </Button>
                </>
              )}

              {showRemoveButton && user.avatar && !previewUrl && (
                <Button
                  onClick={handleRemove}
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  disabled={isUploading || !onRemove}
                >
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { AvatarUploadProps };






















