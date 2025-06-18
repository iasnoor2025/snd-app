import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { EnhancedAvatar, AvatarGroup } from '@/components/ui/enhanced-avatar';
import { SmartAvatar, UserAvatar, TeamAvatar } from '@/components/ui/smart-avatar';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { avatarService } from '@/services/avatar-service';

const mockUsers = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    role: 'Admin',
    status: 'online' as const
  },
  {
    id: 2,
    name: 'Jane Smith',
    email: 'jane@example.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    role: 'Manager',
    status: 'away' as const
  },
  {
    id: 3,
    name: 'Robert Johnson',
    email: 'robert@example.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    role: 'Developer',
    status: 'offline' as const
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily@example.com',
    avatar: 'https://i.pravatar.cc/150?img=4',
    role: 'Designer',
    status: 'busy' as const
  },
  {
    id: 5,
    name: 'Michael Wilson',
    email: 'michael@example.com',
    avatar: 'https://i.pravatar.cc/150?img=5',
    role: 'Accountant',
    status: 'online' as const
  },
];

export function AvatarShowcase() {
  const [currentUser, setCurrentUser] = useState(mockUsers[0]);

  const handleAvatarUpload = async (file: File): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real app, you would upload to your server
    // For demo, we'll create a data URL
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
    });
  };

  const handleAvatarRemove = async (): Promise<void> => {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    // In a real app, you would call your API
  };

  const handleAvatarUpdate = (avatarUrl: string) => {
    setCurrentUser(prev => ({
      ...prev,
      avatar: avatarUrl
    }));
  };

  return (
    <div className="container mx-auto py-10 space-y-10">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Avatar Components</h1>
        <p className="text-muted-foreground">A showcase of various avatar components and their features</p>
      </div>

      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Avatars</TabsTrigger>
          <TabsTrigger value="enhanced">Enhanced Avatars</TabsTrigger>
          <TabsTrigger value="smart">Smart Avatars</TabsTrigger>
          <TabsTrigger value="upload">Avatar Upload</TabsTrigger>
        </TabsList>

        {/* Basic Avatars */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Avatars</CardTitle>
              <CardDescription>
                Simple avatar components from ShadCN UI using Radix UI primitives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar>
                    <AvatarImage src="https://i.pravatar.cc/150?img=1" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Default</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="https://i.pravatar.cc/150?img=2" alt="User" />
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Custom Size</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar>
                    <AvatarFallback>AB</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Fallback Only</span>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <Avatar className="bg-blue-500">
                    <AvatarFallback className="text-white">CD</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">Custom Color</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enhanced Avatars */}
        <TabsContent value="enhanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Avatars</CardTitle>
              <CardDescription>
                Extended avatar components with additional features like sizes and status indicators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Avatar Sizes</h3>
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar size="xs" src="https://i.pravatar.cc/150?img=1" fallback="XS" />
                    <span className="text-xs">XS</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar size="sm" src="https://i.pravatar.cc/150?img=2" fallback="SM" />
                    <span className="text-xs">SM</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar size="md" src="https://i.pravatar.cc/150?img=3" fallback="MD" />
                    <span className="text-xs">MD</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar size="lg" src="https://i.pravatar.cc/150?img=4" fallback="LG" />
                    <span className="text-xs">LG</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar size="xl" src="https://i.pravatar.cc/150?img=5" fallback="XL" />
                    <span className="text-xs">XL</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar size="2xl" src="https://i.pravatar.cc/150?img=6" fallback="2X" />
                    <span className="text-xs">2XL</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar size="3xl" src="https://i.pravatar.cc/150?img=7" fallback="3X" />
                    <span className="text-xs">3XL</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Status Indicators</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar
                      size="lg"
                      src="https://i.pravatar.cc/150?img=1"
                      fallback="ON"
                      showStatus
                      status="online"
                    />
                    <span className="text-sm">Online</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar
                      size="lg"
                      src="https://i.pravatar.cc/150?img=2"
                      fallback="OF"
                      showStatus
                      status="offline"
                    />
                    <span className="text-sm">Offline</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar
                      size="lg"
                      src="https://i.pravatar.cc/150?img=3"
                      fallback="AW"
                      showStatus
                      status="away"
                    />
                    <span className="text-sm">Away</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <EnhancedAvatar
                      size="lg"
                      src="https://i.pravatar.cc/150?img=4"
                      fallback="BS"
                      showStatus
                      status="busy"
                    />
                    <span className="text-sm">Busy</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Avatar Group</h3>
                <AvatarGroup
                  avatars={[
                    { src: "https://i.pravatar.cc/150?img=1", name: "John Doe" },
                    { src: "https://i.pravatar.cc/150?img=2", name: "Jane Smith" },
                    { src: "https://i.pravatar.cc/150?img=3", name: "Robert Johnson" },
                    { src: "https://i.pravatar.cc/150?img=4", name: "Emily Davis" },
                    { src: "https://i.pravatar.cc/150?img=5", name: "Michael Wilson" },
                  ]}
                  max={4}
                  size="md"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Smart Avatars */}
        <TabsContent value="smart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Smart Avatars</CardTitle>
              <CardDescription>
                Intelligent avatar components that integrate with the avatar service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div>
                <h3 className="text-lg font-medium mb-4">User Avatars</h3>
                <div className="flex flex-wrap gap-8">
                  {mockUsers.map((user) => (
                    <UserAvatar
                      key={user.id}
                      user={user}
                      showName
                      showEmail
                      showStatus
                      size="lg"
                    />
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Team Avatar</h3>
                <div className="space-y-4">
                  <TeamAvatar
                    members={mockUsers}
                    max={3}
                    size="lg"
                    onMemberClick={(member) => alert(`Clicked on ${member.name}`)}
                    onMoreClick={() => alert(`Clicked to see more members`)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-4">Smart Avatar with Badge</h3>
                <div className="flex flex-wrap gap-6">
                  <SmartAvatar
                    user={mockUsers[0]}
                    size="xl"
                    showBadge
                    badgeContent="5"
                    badgeVariant="destructive"
                  />
                  <SmartAvatar
                    user={mockUsers[1]}
                    size="xl"
                    showBadge
                    badgeContent="New"
                    badgeVariant="default"
                  />
                  <SmartAvatar
                    user={mockUsers[2]}
                    size="xl"
                    showBadge
                    badgeContent="✓"
                    badgeVariant="secondary"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Avatar Upload */}
        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Avatar Upload</CardTitle>
              <CardDescription>
                Component for uploading and managing user avatars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-6">
                <AvatarUpload
                  user={currentUser}
                  onUpload={handleAvatarUpload}
                  onRemove={handleAvatarRemove}
                  onUpdate={handleAvatarUpdate}
                />

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Click on the avatar to open the upload dialog</p>
                  <p className="text-sm font-medium">{currentUser.name}</p>
                  <p className="text-xs text-muted-foreground">{currentUser.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
