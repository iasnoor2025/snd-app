import { Camera, Globe, Heart, Palette, Settings, Shield, Star, User, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import AvatarUploader from '@/Core/Components/Avatar/AvatarUploader';
import { Avatar, AvatarFallback, AvatarImage, Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator, SmartAvatar, Tabs, TabsContent, TabsList, TabsTrigger } from '@/Core/Components/ui';
import AppLayout from '../../layouts/AppLayout';

interface UserType {
    id: number;
    name: string;
    email: string;
    avatar: string | null;
    role?: string;
}

interface AvatarPageProps {
    auth: {
        user: UserType;
    };
}

const AvatarPage: React.FC<AvatarPageProps> = ({ auth }) => {
    const [currentUser, setCurrentUser] = useState<UserType>(auth.user);

    // Mock team data for demonstration
    const teamMembers: UserType[] = [
        { id: 1, name: 'John Doe', email: 'john@example.com', avatar: null, role: 'Admin' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', avatar: null, role: 'Manager' },
        { id: 3, name: 'Bob Johnson', email: 'bob@example.com', avatar: null, role: 'Developer' },
        { id: 4, name: 'Alice Brown', email: 'alice@example.com', avatar: null, role: 'Designer' },
        { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', avatar: null, role: 'Developer' },
    ];

    const handleAvatarUpdate = (newAvatarUrl: string | null) => {
        setCurrentUser((prev) => ({
            ...prev,
            avatar: newAvatarUrl,
        }));
        toast.success('Avatar updated successfully');
    };

    const getInitials = (name: string | null | undefined) => {
        if (!name) return '?';
        const names = name.trim().split(' ');
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const breadcrumbs = [
        { title: 'Profile', href: route('profile.index') },
        { title: 'Avatar', href: route('profile.avatar') },
    ];

    return (
        <AppLayout title="Avatar Management" breadcrumbs={breadcrumbs}>
            <div className="py-6">
                <div className="mx-auto max-w-7xl space-y-6">
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
                                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                                        {/* Avatar Uploader */}
                                        <div>
                                            <AvatarUploader user={currentUser} onAvatarUpdate={handleAvatarUpdate} />
                                        </div>

                                        {/* Current Avatar Info */}
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <User className="h-5 w-5" />
                                                    Current Avatar
                                                </CardTitle>
                                                <CardDescription>Your current avatar information and fallback options</CardDescription>
                                            </CardHeader>
                                            <CardContent className="space-y-4">
                                                <div className="flex items-center space-x-4">
                                                    <Avatar className="h-16 w-16">
                                                        <AvatarImage src={currentUser.avatar || undefined} alt={currentUser.name} />
                                                        <AvatarFallback className="text-lg">{getInitials(currentUser.name)}</AvatarFallback>
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
                                                            <AvatarFallback className="text-xs">{getInitials(currentUser.name)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm text-muted-foreground">Gravatar</span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
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
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                                                    <SmartAvatar user={currentUser} size="md" badge={<Star className="h-3 w-3 text-yellow-500" />} />
                                                    <span className="text-sm">Star Member</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="md" badge={<Shield className="h-3 w-3 text-blue-500" />} />
                                                    <span className="text-sm">Admin</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="md" badge={<Heart className="h-3 w-3 text-red-500" />} />
                                                    <span className="text-sm">VIP</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <SmartAvatar user={currentUser} size="md" badge={<Zap className="h-3 w-3 text-amber-500" />} />
                                                    <span className="text-sm">Premium</span>
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
                                            <CardDescription>View and manage team member avatars</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                {teamMembers.map((member) => (
                                                    <div key={member.id} className="flex items-center space-x-4">
                                                        <SmartAvatar user={member} size="lg" status={member.id === 1 ? 'online' : undefined} />
                                                        <div>
                                                            <p className="font-medium">{member.name}</p>
                                                            <p className="text-sm text-muted-foreground">{member.role}</p>
                                                        </div>
                                                    </div>
                                                ))}
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
                                            <CardDescription>Configure your avatar preferences and defaults</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-4">
                                                <h4 className="font-medium">Default Fallback</h4>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <Button variant="outline" className="justify-start">
                                                        <Globe className="mr-2 h-4 w-4" />
                                                        Use Gravatar
                                                    </Button>
                                                    <Button variant="outline" className="justify-start">
                                                        <User className="mr-2 h-4 w-4" />
                                                        Use Initials
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="space-y-4">
                                                <h4 className="font-medium">Privacy Settings</h4>
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                    <Button variant="outline" className="justify-start">
                                                        <Shield className="mr-2 h-4 w-4" />
                                                        Make Avatar Public
                                                    </Button>
                                                    <Button variant="outline" className="justify-start">
                                                        <Users className="mr-2 h-4 w-4" />
                                                        Team Only
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
        </AppLayout>
    );
};

export default AvatarPage;
