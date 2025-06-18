import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Loader2, Upload, Link, X, Camera, RefreshCw, Palette, Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const AvatarUploader = ({ user, className, onAvatarUpdate }) => {
    const { toast } = useToast();
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(user?.avatar || null);
    const [activeTab, setActiveTab] = useState('upload');
    const [isHovering, setIsHovering] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [laravoltPreview, setLaravoltPreview] = useState(null);
    const [laravoltOptions, setLaravoltOptions] = useState({
        size: 200,
        background: '#3B82F6',
        foreground: '#FFFFFF',
        fontSize: 0.5
    });

    // Form for file upload
    const fileForm = useForm({
        avatar: null,
        _method: 'POST',
    });

    // Form for URL upload
    const urlForm = useForm({
        avatar_url: '',
        _method: 'POST',
    });

    // Form for Laravolt avatar
    const laravoltForm = useForm({
        size: 200,
        background: '#3B82F6',
        foreground: '#FFFFFF',
        fontSize: 0.5,
        _method: 'POST',
    });

    // Handle file selection
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast({
                variant: 'destructive',
                title: 'Invalid file type',
                description: 'Please select a valid image file (JPEG, PNG, GIF, WebP)',
            });
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File too large',
                description: 'Avatar image must be less than 5MB',
            });
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        // Set form data
        fileForm.setData('avatar', file);
    };

    // Handle file upload
    const handleFileUpload = (e) => {
        e.preventDefault();
        setIsLoading(true);

        fileForm.post(route('avatar.upload'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: (response) => {
                setIsLoading(false);
                toast({
                    title: 'Avatar updated',
                    description: 'Your avatar has been updated successfully',
                });
                if (onAvatarUpdate) onAvatarUpdate(response.avatar_url);
            },
            onError: (errors) => {
                setIsLoading(false);
                toast({
                    variant: 'destructive',
                    title: 'Upload failed',
                    description: errors.message || 'Failed to upload avatar',
                });
            },
        });
    };

    // Handle URL upload
    const handleUrlUpload = (e) => {
        e.preventDefault();
        setIsLoading(true);

        urlForm.post(route('avatar.setFromUrl'), {
            preserveScroll: true,
            onSuccess: (response) => {
                setIsLoading(false);
                setPreview(response.avatar_url);
                toast({
                    title: 'Avatar updated',
                    description: 'Your avatar has been updated successfully',
                });
                if (onAvatarUpdate) onAvatarUpdate(response.avatar_url);
                urlForm.reset();
            },
            onError: (errors) => {
                setIsLoading(false);
                toast({
                    variant: 'destructive',
                    title: 'Upload failed',
                    description: errors.message || errors.avatar_url || 'Failed to set avatar from URL',
                });
            },
        });
    };

    // Handle Laravolt avatar generation
    const handleGenerateLaravolt = async () => {
        setIsLoading(true);

        try {
            const response = await axios.post(route('avatar.generate.laravolt'), laravoltOptions);
            setLaravoltPreview(response.data.avatar_url);
            toast({
                title: 'Avatar generated',
                description: 'Laravolt avatar has been generated successfully',
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Generation failed',
                description: error.response?.data?.message || 'Failed to generate avatar',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle setting Laravolt avatar as primary
    const handleSetLaravoltAvatar = () => {
        if (!laravoltPreview) return;

        setIsLoading(true);

        laravoltForm.post(route('avatar.set.laravolt'), {
            preserveScroll: true,
            onSuccess: (response) => {
                setIsLoading(false);
                setPreview(response.avatar_url);
                toast({
                    title: 'Avatar updated',
                    description: 'Your Laravolt avatar has been set successfully',
                });
                if (onAvatarUpdate) onAvatarUpdate(response.avatar_url);
            },
            onError: (errors) => {
                setIsLoading(false);
                toast({
                    variant: 'destructive',
                    title: 'Update failed',
                    description: errors.message || 'Failed to set Laravolt avatar',
                });
            },
        });
    };

    // Handle Laravolt option changes
    const handleLaravoltOptionChange = (key, value) => {
        const newOptions = { ...laravoltOptions, [key]: value };
        setLaravoltOptions(newOptions);
        laravoltForm.setData(newOptions);
    };

    // Get base64 Laravolt avatar
    const handleGetLaravoltBase64 = async () => {
        try {
            const response = await axios.get(route('avatar.laravolt.base64'), {
                params: laravoltOptions
            });
            setLaravoltPreview(`data:image/png;base64,${response.data.base64}`);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to generate base64 avatar',
            });
        }
    };

    // Handle avatar removal
    const handleRemoveAvatar = () => {
        setIsLoading(true);

        axios.delete(route('avatar.remove'))
            .then(response => {
                setIsLoading(false);
                setPreview(null);
                toast({
                    title: 'Avatar removed',
                    description: 'Your avatar has been removed successfully',
                });
                if (onAvatarUpdate) onAvatarUpdate(null);
            })
            .catch(error => {
                setIsLoading(false);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: error.response?.data?.message || 'Failed to remove avatar',
                });
            });
    };

    // Handle drag and drop
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsHovering(true);
    };

    const handleDragLeave = () => {
        setIsHovering(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsHovering(false);

        const file = e.dataTransfer.files[0];
        if (!file) return;

        // Set file to input
        if (fileInputRef.current) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputRef.current.files = dataTransfer.files;

            // Trigger change event
            const event = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(event);
        }
    };

    // Generate initials for avatar fallback
    const getInitials = (name) => {
        if (!name) return '?';

        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();

        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <Card className={cn('w-full max-w-md mx-auto', className)}>
            <CardHeader>
                <CardTitle className="text-center">Update Avatar</CardTitle>
            </CardHeader>

            <CardContent>
                {/* Avatar Preview */}
                <div className="flex flex-col items-center mb-6">
                    <div className="relative">
                        <Avatar className="w-32 h-32 border-2 border-primary/20">
                            <AvatarImage src={preview} alt={user?.name || 'Avatar'} />
                            <AvatarFallback className="text-2xl bg-primary/10">
                                {isLoading ? (
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                ) : (
                                    getInitials(user?.name)
                                )}
                            </AvatarFallback>
                        </Avatar>

                        {preview && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                onClick={handleRemoveAvatar}
                                disabled={isLoading}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        )}
                    </div>

                    <p className="text-sm text-muted-foreground mt-2">
                        {user?.name || 'Your avatar'}
                    </p>
                </div>

                {/* Upload Options */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upload">Upload File</TabsTrigger>
                        <TabsTrigger value="url">From URL</TabsTrigger>
                        <TabsTrigger value="laravolt">Generate</TabsTrigger>
                    </TabsList>

                    {/* File Upload Tab */}
                    <TabsContent value="upload">
                        <form onSubmit={handleFileUpload}>
                            <div
                                className={cn(
                                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                                    isHovering ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
                                    fileForm.processing && 'opacity-50 pointer-events-none'
                                )}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="rounded-full bg-primary/10 p-3">
                                        {fileForm.processing ? (
                                            <Loader2 className="h-6 w-6 text-primary animate-spin" />
                                        ) : (
                                            <Upload className="h-6 w-6 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex flex-col space-y-1 text-center">
                                        <p className="text-sm font-medium">
                                            Click to upload or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            JPEG, PNG, GIF or WebP (max 5MB)
                                        </p>
                                    </div>
                                </div>

                                <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={fileForm.processing}
                                />
                            </div>

                            {fileForm.errors.avatar && (
                                <Alert variant="destructive" className="mt-2">
                                    <AlertDescription>{fileForm.errors.avatar}</AlertDescription>
                                </Alert>
                            )}

                            {fileForm.data.avatar && (
                                <div className="mt-4 flex justify-end">
                                    <Button
                                        type="submit"
                                        disabled={fileForm.processing || !fileForm.data.avatar}
                                    >
                                        {fileForm.processing ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>Upload Avatar</>
                                        )}
                                    </Button>
                                </div>
                            )}

                            {fileForm.processing && (
                                <Progress
                                    value={fileForm.progress?.percentage || 0}
                                    className="mt-2"
                                />
                            )}
                        </form>
                    </TabsContent>

                    {/* URL Upload Tab */}
                    <TabsContent value="url">
                        <form onSubmit={handleUrlUpload}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="avatar-url">Image URL</Label>
                                    <div className="flex space-x-2">
                                        <div className="relative flex-1">
                                            <Link className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="avatar-url"
                                                type="url"
                                                placeholder="https://example.com/avatar.jpg"
                                                className="pl-8"
                                                value={urlForm.data.avatar_url}
                                                onChange={(e) => urlForm.setData('avatar_url', e.target.value)}
                                                disabled={urlForm.processing}
                                            />
                                        </div>
                                        <Button
                                            type="submit"
                                            disabled={urlForm.processing || !urlForm.data.avatar_url}
                                        >
                                            {urlForm.processing ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <RefreshCw className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>

                                {urlForm.errors.avatar_url && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{urlForm.errors.avatar_url}</AlertDescription>
                                    </Alert>
                                )}

                                <p className="text-xs text-muted-foreground">
                                    Enter the URL of an image to use as your avatar. The image should be square and at least 200x200 pixels.
                                </p>
                            </div>
                        </form>
                    </TabsContent>

                    {/* Laravolt Avatar Generation Tab */}
                    <TabsContent value="laravolt">
                        <div className="space-y-4">
                            {/* Laravolt Preview */}
                            {laravoltPreview && (
                                <div className="flex justify-center mb-4">
                                    <div className="relative">
                                        <Avatar className="w-24 h-24 border-2 border-primary/20">
                                            <AvatarImage src={laravoltPreview} alt="Generated Avatar" />
                                            <AvatarFallback className="bg-primary/10">
                                                <Palette className="h-8 w-8 text-primary" />
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                </div>
                            )}

                            {/* Size Control */}
                            <div className="space-y-2">
                                <Label>Size: {laravoltOptions.size}px</Label>
                                <Slider
                                    value={[laravoltOptions.size]}
                                    onValueChange={([value]) => handleLaravoltOptionChange('size', value)}
                                    max={400}
                                    min={50}
                                    step={10}
                                    className="w-full"
                                />
                            </div>

                            {/* Background Color */}
                            <div className="space-y-2">
                                <Label htmlFor="bg-color">Background Color</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="bg-color"
                                        type="color"
                                        value={laravoltOptions.background}
                                        onChange={(e) => handleLaravoltOptionChange('background', e.target.value)}
                                        className="w-16 h-10 p-1 border rounded"
                                    />
                                    <Input
                                        type="text"
                                        value={laravoltOptions.background}
                                        onChange={(e) => handleLaravoltOptionChange('background', e.target.value)}
                                        placeholder="#3B82F6"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {/* Foreground Color */}
                            <div className="space-y-2">
                                <Label htmlFor="fg-color">Text Color</Label>
                                <div className="flex space-x-2">
                                    <Input
                                        id="fg-color"
                                        type="color"
                                        value={laravoltOptions.foreground}
                                        onChange={(e) => handleLaravoltOptionChange('foreground', e.target.value)}
                                        className="w-16 h-10 p-1 border rounded"
                                    />
                                    <Input
                                        type="text"
                                        value={laravoltOptions.foreground}
                                        onChange={(e) => handleLaravoltOptionChange('foreground', e.target.value)}
                                        placeholder="#FFFFFF"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            {/* Font Size */}
                            <div className="space-y-2">
                                <Label>Font Size: {Math.round(laravoltOptions.fontSize * 100)}%</Label>
                                <Slider
                                    value={[laravoltOptions.fontSize]}
                                    onValueChange={([value]) => handleLaravoltOptionChange('fontSize', value)}
                                    max={1}
                                    min={0.1}
                                    step={0.1}
                                    className="w-full"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGenerateLaravolt}
                                    disabled={isLoading}
                                    className="flex-1"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Palette className="mr-2 h-4 w-4" />
                                            Generate
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleGetLaravoltBase64}
                                    disabled={isLoading}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>

                            {laravoltPreview && (
                                <Button
                                    type="button"
                                    onClick={handleSetLaravoltAvatar}
                                    disabled={isLoading}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Setting Avatar...
                                        </>
                                    ) : (
                                        'Use This Avatar'
                                    )}
                                </Button>
                            )}

                            <p className="text-xs text-muted-foreground">
                                Generate a custom avatar using your initials with customizable colors and size.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter className="flex justify-between border-t pt-4 text-xs text-muted-foreground">
                <div>
                    <p>Supported formats: JPEG, PNG, GIF, WebP</p>
                    <p>Max size: 5MB</p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                        const tabs = ['upload', 'url', 'laravolt'];
                        const currentIndex = tabs.indexOf(activeTab);
                        const nextIndex = (currentIndex + 1) % tabs.length;
                        setActiveTab(tabs[nextIndex]);
                    }}
                >
                    {activeTab === 'upload' ? (
                        <Link className="h-4 w-4" />
                    ) : activeTab === 'url' ? (
                        <Palette className="h-4 w-4" />
                    ) : (
                        <Camera className="h-4 w-4" />
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default AvatarUploader;


