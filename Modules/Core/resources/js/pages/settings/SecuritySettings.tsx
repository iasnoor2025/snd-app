import PageHeader from '@/Core/Components/page-header';
import ApiKeySettings from '@/Core/Components/settings/ApiKeySettings';
import { DeviceSessions } from '@/Core/Components/settings/DeviceSessions';
import MfaSettings from '@/Core/Components/settings/MfaSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../Components/ui/tabs';

interface SecuritySettingsProps {
    mfa_enabled: boolean;
    api_keys: Array<{
        id: string;
        name: string;
        last_used_at: string | null;
        created_at: string;
    }>;
}

export default function SecuritySettings({ mfa_enabled, api_keys }: SecuritySettingsProps) {
    return (
        <div className="space-y-6">
            <PageHeader title="Security Settings" description="Manage your account's security settings and API access" />

            <Tabs defaultValue="2fa" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="2fa">Two-Factor Authentication</TabsTrigger>
                    <TabsTrigger value="api-keys">API Keys</TabsTrigger>
                </TabsList>

                <TabsContent value="2fa" className="space-y-6">
                    <MfaSettings isEnabled={mfa_enabled} />
                </TabsContent>

                <TabsContent value="api-keys" className="space-y-6">
                    <ApiKeySettings initialKeys={api_keys} />
                </TabsContent>
            </Tabs>

            <DeviceSessions />
        </div>
    );
}
