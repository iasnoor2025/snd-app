import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useForm } from '@inertiajs/react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Link, Palette, Trash2, Loader2 } from 'lucide-react';

const CustomerAvatarUploader = ({ customer, onAvatarUpdate }) => {
    const [preview, setPreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [laravoltPreview, setLaravoltPreview] = useState(null);
    const [generatingLaravolt, setGeneratingLaravolt] = useState(false);
    const [settingLaravolt, setSettingLaravolt] = useState(false);
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    // Laravolt options state
    const [laravoltOptions, setLaravoltOptions] = useState({
        size: 200,
        background: '#3B82F6',
        foreground: '#FFFFFF',
        fontSize: 0.5
    });

    const { data: urlData, setData: setUrlData, post: postUrl, processing: urlProcessing, reset: resetUrl } = useForm({
        avatar_url: ''
    });

    const { data: laravoltData, setData: setLaravoltData, reset: resetLaravolt } = useForm({
        size: 200,
        background: '#3B82F6',
        foreground: '#FFFFFF',
        fontSize: 0.5
    });

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
        }
    };

    const handleFileUpload = async (file) => {
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setUploading(true);
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').getAttribute('content'));

        try {
            const response = await axios.post(`/customers/${customer.id}/avatar/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                toast.success('Avatar uploaded successfully!');
                onAvatarUpdate?.(response.data.avatar);
                setPreview(null);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload avatar');
            setPreview(null);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleUrlSubmit = (e) => {
        e.preventDefault();
        postUrl(`/customers/${customer.id}/avatar/url`, {
            onSuccess: (response) => {
                toast.success('Avatar updated successfully!');
                onAvatarUpdate?.(response.props?.avatar);
                resetUrl();
            },
            onError: (errors) => {
                const errorMessage = errors.avatar_url || errors.message || 'Failed to update avatar';
                toast.error(errorMessage);
            }
        });
    };

    const handleRemoveAvatar = async () => {
        try {
            const response = await axios.delete(`/customers/${customer.id}/avatar`, {
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            });

            if (response.data.success) {
                toast.success('Avatar removed successfully!');
                onAvatarUpdate?.(null);
            }
        } catch (error) {
            console.error('Remove error:', error);
            toast.error(error.response?.data?.message || 'Failed to remove avatar');
        }
    };

    // Laravolt avatar methods
    const handleGenerateLaravolt = async () => {
        if (!customer.name) {
            toast.error('Customer name is required to generate avatar');
            return;
        }

        setGeneratingLaravolt(true);
        try {
            const response = await axios.post(`/customers/${customer.id}/avatar/laravolt/generate`, {
                name: customer.name,
                size: laravoltOptions.size,
                background: laravoltOptions.background,
                foreground: laravoltOptions.foreground,
                fontSize: laravoltOptions.fontSize,
                _token: document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            });

            if (response.data.success) {
                setLaravoltPreview(response.data.avatar);
                toast.success('Avatar generated successfully!');
            }
        } catch (error) {
            console.error('Generation error:', error);
            toast.error(error.response?.data?.message || 'Failed to generate avatar');
        } finally {
            setGeneratingLaravolt(false);
        }
    };

    const handleSetLaravoltAvatar = async () => {
        if (!laravoltPreview) {
            toast.error('Please generate an avatar first');
            return;
        }

        setSettingLaravolt(true);
        try {
            const response = await axios.post(`/customers/${customer.id}/avatar/laravolt/set`, {
                avatar: laravoltPreview,
                _token: document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            });

            if (response.data.success) {
                toast.success('Avatar set successfully!');
                onAvatarUpdate?.(response.data.avatar);
                setLaravoltPreview(null);
            }
        } catch (error) {
            console.error('Set avatar error:', error);
            toast.error(error.response?.data?.message || 'Failed to set avatar');
        } finally {
            setSettingLaravolt(false);
        }
    };

    const handleLaravoltOptionChange = (key, value) => {
        setLaravoltOptions(prev => ({ ...prev, [key]: value }));
        setLaravoltData(key, value);
    };

    const clearLaravoltPreview = () => {
        setLaravoltPreview(null);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.avatar_url} />
                        <AvatarFallback>{customer.name?.charAt(0) || 'C'}</AvatarFallback>
                    </Avatar>
                    Customer Avatar
                </CardTitle>
                <CardDescription>
                    Upload, set from URL, or generate an avatar for {customer.name}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="upload" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="upload" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload
                        </TabsTrigger>
                        <TabsTrigger value="url" className="flex items-center gap-2">
                            <Link className="h-4 w-4" />
                            URL
                        </TabsTrigger>
                        <TabsTrigger value="generate" className="flex items-center gap-2">
                            <Palette className="h-4 w-4" />
                            Generate
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            {preview ? (
                                <div className="space-y-4">
                                    <Avatar className="h-24 w-24 mx-auto">
                                        <AvatarImage src={preview} />
                                        <AvatarFallback>Preview</AvatarFallback>
                                    </Avatar>
                                    <p className="text-sm text-gray-600">Ready to upload</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Upload className="h-12 w-12 mx-auto text-gray-400" />
                                    <div>
                                        <p className="text-lg font-medium">Drop your image here</p>
                                        <p className="text-sm text-gray-600">or click to browse</p>
                                    </div>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={uploading}
                            />
                        </div>

                        {uploading && (
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Uploading avatar...
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="url" className="space-y-4">
                        <form onSubmit={handleUrlSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="avatar_url">Avatar URL</Label>
                                <Input
                                    id="avatar_url"
                                    type="url"
                                    placeholder="https://example.com/avatar.jpg"
                                    value={urlData.avatar_url}
                                    onChange={(e) => setUrlData('avatar_url', e.target.value)}
                                    disabled={urlProcessing}
                                />
                            </div>
                            <Button type="submit" disabled={urlProcessing || !urlData.avatar_url}>
                                {urlProcessing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Setting Avatar...
                                    </>
                                ) : (
                                    'Set Avatar from URL'
                                )}
                            </Button>
                        </form>
                    </TabsContent>

                    <TabsContent value="generate" className="space-y-6">
                        {laravoltPreview && (
                            <div className="flex flex-col items-center space-y-4 p-4 border rounded-lg bg-gray-50">
                                <Avatar className="h-24 w-24">
                                    <AvatarImage src={laravoltPreview} />
                                    <AvatarFallback>Generated</AvatarFallback>
                                </Avatar>
                                <div className="flex gap-2">
                                    <Button
                                        onClick={handleSetLaravoltAvatar}
                                        disabled={settingLaravolt}
                                        size="sm"
                                    >
                                        {settingLaravolt ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Setting...
                                            </>
                                        ) : (
                                            'Set as Avatar'
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={clearLaravoltPreview}
                                        size="sm"
                                    >
                                        Clear
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label>Size: {laravoltOptions.size}px</Label>
                                <Slider
                                    value={[laravoltOptions.size]}
                                    onValueChange={(value) => handleLaravoltOptionChange('size', value[0])}
                                    max={400}
                                    min={50}
                                    step={10}
                                    className="w-full"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="background">Background Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="background"
                                            type="color"
                                            value={laravoltOptions.background}
                                            onChange={(e) => handleLaravoltOptionChange('background', e.target.value)}
                                            className="w-12 h-10 border rounded cursor-pointer"
                                        />
                                        <Input
                                            value={laravoltOptions.background}
                                            onChange={(e) => handleLaravoltOptionChange('background', e.target.value)}
                                            placeholder="#3B82F6"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="foreground">Text Color</Label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            id="foreground"
                                            type="color"
                                            value={laravoltOptions.foreground}
                                            onChange={(e) => handleLaravoltOptionChange('foreground', e.target.value)}
                                            className="w-12 h-10 border rounded cursor-pointer"
                                        />
                                        <Input
                                            value={laravoltOptions.foreground}
                                            onChange={(e) => handleLaravoltOptionChange('foreground', e.target.value)}
                                            placeholder="#FFFFFF"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Font Size: {Math.round(laravoltOptions.fontSize * 100)}%</Label>
                                <Slider
                                    value={[laravoltOptions.fontSize]}
                                    onValueChange={(value) => handleLaravoltOptionChange('fontSize', value[0])}
                                    max={1}
                                    min={0.1}
                                    step={0.05}
                                    className="w-full"
                                />
                            </div>

                            <Button
                                onClick={handleGenerateLaravolt}
                                disabled={generatingLaravolt || !customer.name}
                                className="w-full"
                            >
                                {generatingLaravolt ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Generating Avatar...
                                    </>
                                ) : (
                                    <>
                                        <Palette className="h-4 w-4 mr-2" />
                                        Generate Avatar
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>

                {customer.avatar_url && (
                    <div className="mt-6 pt-6 border-t">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={customer.avatar_url} />
                                    <AvatarFallback>{customer.name?.charAt(0) || 'C'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium">Current Avatar</p>
                                    <p className="text-xs text-gray-600">Click remove to delete</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveAvatar}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default CustomerAvatarUploader;


