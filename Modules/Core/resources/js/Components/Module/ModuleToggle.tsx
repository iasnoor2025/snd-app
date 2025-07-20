import React, { useState } from 'react';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { RefreshCw } from 'lucide-react';

interface ModuleToggleProps {
    moduleName: string;
    displayName: string;
    isEnabled: boolean;
    onToggle: (moduleName: string, enabled: boolean) => Promise<void>;
    onRefresh: () => Promise<void>;
}

export const ModuleToggle: React.FC<ModuleToggleProps> = ({
    moduleName,
    displayName,
    isEnabled,
    onToggle,
    onRefresh
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleToggle = async (enabled: boolean) => {
        setIsLoading(true);
        try {
            await onToggle(moduleName, enabled);
        } catch (error) {
            console.error('Failed to toggle module:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await onRefresh();
        } catch (error) {
            console.error('Failed to refresh modules:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center space-x-3">
                <Switch
                    id={`module-${moduleName}`}
                    checked={isEnabled}
                    onCheckedChange={handleToggle}
                    disabled={isLoading}
                />
                <Label htmlFor={`module-${moduleName}`} className="font-medium">
                    {displayName}
                </Label>
            </div>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-2"
            >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
        </div>
    );
};
