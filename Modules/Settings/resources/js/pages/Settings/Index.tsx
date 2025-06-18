import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
// Placeholder types
type PageProps = any;
type Setting = any;
// Minimal placeholder AppLayout component
const AppLayout = ({ children }: { children: React.ReactNode }) => <div className="app-layout-placeholder">{children}</div>;
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
// Minimal placeholder Tabs API
const Tabs = ({ value, onValueChange, children }: any) => <div>{children}</div>;
Tabs.List = ({ children }: any) => <div>{children}</div>;
Tabs.Trigger = ({ value, children }: any) => <button>{children}</button>;
import { Building2, Bell, FileText, Settings, ChevronRight } from 'lucide-react';

interface SettingsGroup {
  [key: string]: Setting[];
}

interface Props extends PageProps {
  settings: SettingsGroup;
}

const SettingsIndex = (props: any) => {
  const { auth, settings, ...rest } = props;
  const groupNames = Object.keys(settings);
  const [activeTab, setActiveTab] = useState(groupNames[0] || '');

  const renderSettingValue = (setting: Setting) => {
    if (setting.type === 'boolean') {
      return setting.value ? 'Yes' : 'No';
    } else if (setting.type === 'array' || setting.type === 'json') {
      return JSON.stringify(setting.value);
    }
    return setting.value;
  };

  const settingsCategories = [
    {
      title: 'Company Settings',
      description: 'Manage company information, logo, and contact details',
      icon: <Building2 className="h-8 w-8" />,
      href: route('settings.company'),
      color: 'bg-blue-500',
    },
    {
      title: 'Notifications',
      description: 'Configure notification preferences and delivery methods',
      icon: <Bell className="h-8 w-8" />,
      href: route('settings.notifications'),
      color: 'bg-green-500',
    },
    {
      title: 'Reports',
      description: 'Set up report generation, formatting, and distribution',
      icon: <FileText className="h-8 w-8" />,
      href: route('settings.reports'),
      color: 'bg-purple-500',
    },
    {
      title: 'System Settings',
      description: 'Advanced system configuration and technical settings',
      icon: <Settings className="h-8 w-8" />,
      href: '#system-settings',
      color: 'bg-gray-500',
    },
  ];

  return (
    <AppLayout>
      <Head title="Settings" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Header */}
            <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 bg-white border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    <p className="mt-2 text-gray-600">Manage your system configuration and preferences</p>
                  </div>
                  <Link href={route('settings.create')}>
                    <Button>Add Setting</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Settings Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {settingsCategories.map((category, index) => (
                <Link
                  key={index}
                  href={category.href}
                  className="group block"
                >
                  <Card className="h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${category.color} text-white`}>
                          {category.icon}
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {category.description}
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* System Settings Table */}
            <div id="system-settings" className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
              <div className="p-6 bg-white border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">System Settings</h2>

              {groupNames.length > 0 ? (
                <>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <Tabs.List>
                      {groupNames.map((name) => (
                        <Tabs.Trigger key={name} value={name}>
                          {name.charAt(0).toUpperCase() + name.slice(1)}
                        </Tabs.Trigger>
                      ))}
                    </Tabs.List>
                  </Tabs>

                  <div className="mt-6">
                    <Card>
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Value
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {settings[activeTab]?.map((setting: any, idx: number) => (
                            <tr key={setting.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {setting.display_name || setting.key}
                                </div>
                                {setting.description && (
                                  <div className="text-sm text-gray-500">{setting.description}</div>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {renderSettingValue(setting)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                  {setting.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <Link
                                  href={route('settings.edit', setting.id)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-3"
                                >
                                  Edit
                                </Link>
                                <Link
                                  href={route('settings.show', setting.id)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  View
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </Card>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No settings found.</p>
                  <Link href={route('settings.create')} className="mt-4 inline-block">
                    <Button>Create First Setting</Button>
                  </Link>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default SettingsIndex;
