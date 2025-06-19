import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '../../layouts/AuthenticatedLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import AvatarUploader from '../../components/Avatar/AvatarUploader';
import { SmartAvatar, UserAvatar, TeamAvatar } from '../../components/ui/smart-avatar';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import {
    User,
    Settings,
    Camera,
    Palette,
    Globe,
    Shield,
    Users,
    Star,
    Heart,
    Zap
} from 'lucide-react';

const AvatarPage = ({ auth }) => {
    const { toast } = useToast();
    const [currentUser, setCurrentUser] = useState(auth.user);

    // Mock team data for demonstration
    const teamMembers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null, role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null, role: 'Manager' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', avatar: null, role: 'Developer' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', avatar: null, role: 'Designer' },
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', avatar: null, role: 'Developer' },
    ];

    const handleAvatarUpdate = (newAvatarUrl) => {
        setCurrentUser(prev => ({
            ...prev,
            avatar: newAvatarUrl
        }));

        toast({
            title: 'Avatar Updated',
            description: 'Your avatar has been successfully updated.',
        });
    };

    const getInitials = (name) => {
        if (!name) return '?';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        Avatar Management
                    </h2>
                    <Badge variant="secondary" className="flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        Profile Settings
                    </Badge>
                </div>
            }
        >
            <Head title="Avatar Management" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <Tabs defaultValue="upload" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="upload" className="flex items-center gap-2">
                                        <Camera className="h-4 w-4" />
                                        Upload
                                    </TabsTrigger>
                                    <TabsTrigger value="examples" className="flex items-center gap-2">
                                        <Palette className="h-4 w-4" />
                                        Examples
                                    </TabsTrigger>
                                    <TabsTrigger value="team" className="flex items-center gap-2">
                                        <Users className="h-4 w-4" />
                                        Team
                                    </TabsTrigger>
                                    <TabsTrigger value="settings" className="flex items-center gap-2">
                                        <Settings className="h-4 w-4" />
                                        Settings
                                    </TabsTrigger>
                                </TabsList>

                                {/* Upload Tab */}
                                <TabsContent value="upload" className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Avatar Uploader */}
                                        <div>
                                            <AvatarUploader
                                                user={currentUser}
                                                onAvatarUpdate={handleAvatarUpdate}
                                            />
                                        </div>

                                        {/* Current Avatar Info */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    Current Avatar
                                                </CardTitle>
                                                <CardDescription>
                                                    Your current avatar information and fallback options
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center space-x-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                                                        <AvatarFallback className="text-lg">
                                                            {getInitials(currentUser.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{currentUser.name}</p>
                                                        <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                                                        <Badge variant={currentUser.avatar ? 'default' : 'secondary'} className="mt-1">
                                                            {currentUser.avatar ? 'Custom Avatar' : 'Using Initials'}
                                                        </Badge>
                                                    </div>
                                                </div>

                                                <Separator />

                                                <div className="space-y-2">
                                                    <h4 className="text-sm font-medium">Fallback Options</h4>
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarImage
                                                                src={`https://www.gravatar.com/avatar/${btoa(currentUser.email.toLowerCase())}?s=80&d=mp`}
                                                                alt="Gravatar"
                                                            />
                                                            <AvatarFallback className="text-xs">
                                                                {getInitials(currentUser.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm text-muted-foreground">Gravatar</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                                                {getInitials(currentUser.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm text-muted-foreground">Initials</span>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* Examples Tab */}
                                <TabsContent value="examples" className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {/* Size Variants */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Size Variants</CardTitle>
                                                <CardDescription>Different avatar sizes</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="xs" />
                                                    <span className="text-sm">Extra Small</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="sm" />
                                                    <span className="text-sm">Small</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="md" />
                                                    <span className="text-sm">Medium</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="lg" />
                                                    <span className="text-sm">Large</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="xl" />
                                                    <span className="text-sm">Extra Large</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Status Indicators */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Status Indicators</CardTitle>
                                                <CardDescription>Avatar with status badges</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="md" status="online" />
                                                    <span className="text-sm">Online</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="md" status="offline" />
                                                    <span className="text-sm">Offline</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="md" status="away" />
                                                    <span className="text-sm">Away</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="md" status="busy" />
                                                    <span className="text-sm">Busy</span>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* With Badges */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Custom Badges</CardTitle>
                                                <CardDescription>Avatar with custom badges</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar
                                                        user={currentUser}
                                                        size="md"
                                                        badge={<Star className="h-3 w-3 text-yellow-500" />}
                                                    />
                                                    <span className="text-sm">Star Member</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar
                                                        user={currentUser}
                                                        size="md"
                                                        badge={<Shield className="h-3 w-3 text-blue-500" />}
                                                    />
                                                    <span className="text-sm">Admin</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar
                                                        user={currentUser}
                                                        size="md"
                                                        badge={<Heart className="h-3 w-3 text-red-500" />}
                                                    />
                                                    <span className="text-sm">VIP</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar
                                                        user={currentUser}
                                                        size="md"
                                                        badge={<Zap className="h-3 w-3 text-purple-500" />}
                                                    />
                                                    <span className="text-sm">Pro</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>

                                {/* Team Tab */}
                                <TabsContent value="team" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Users className="h-5 w-5" />
                                                Team Members
                                            </CardTitle>
                                            <CardDescription>
                                                Avatar examples with team member data
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-4">
                                                {teamMembers.map((member) => (
                                                    <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                                                        <div className="flex items-center space-x-3">
                                                            <UserAvatar
                                                                user={member}
                                                                size="md"
                                                                showName={false}
                                                                showEmail={false}
                                                            />
                                                            <div>
                                                                <p className="font-medium">{member.name}</p>
                                                                <p className="text-sm text-muted-foreground">{member.email}</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline">{member.role}</Badge>
                                                    </div>
                                                ))}
                                            </div>

                                            <Separator className="my-6" />

                                            <div>
                                                <h4 className="text-sm font-medium mb-3">Team Avatar Group</h4>
                                                <TeamAvatar
                                                    members={teamMembers}
                                                    maxVisible={4}
                                                    size="md"
                                                    onMemberClick={(member) => {
                                                        toast({
                                                            title: 'Member Clicked',
                                                            description: `You clicked on ${member.name}`,
                                                        });
                                                    }}
                                                    onOverflowClick={(hiddenCount) => {
                                                        toast({
                                                            title: 'More Members',
                                                            description: `${hiddenCount} more members in this team`,
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Settings Tab */}
                                <TabsContent value="settings" className="space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2">
                                                <Settings className="h-5 w-5" />
                                                Avatar Settings
                                            </CardTitle>
                                            <CardDescription>
                                                Configure avatar preferences and fallback options
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-medium">Use Gravatar</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Automatically use Gravatar if no custom avatar is set
                                                        </p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Enable
                                                    </Button>
                                                </div>

                                                <Separator />

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-medium">Auto-generate Colors</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Generate unique colors for avatar backgrounds
                                                        </p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Configure
                                                    </Button>
                                                </div>

                                                <Separator />

                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="text-sm font-medium">Image Optimization</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            Automatically optimize uploaded images
                                                        </p>
                                                    </div>
                                                    <Button variant="outline" size="sm">
                                                        Settings
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default AvatarPage;



