import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Head, Link, router } from '@inertiajs/react';
import { PageProps } from '@/Core/types';
import { AppLayout } from '@/Core';
import { Button } from "@/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/Core";
import { ArrowLeft } from 'lucide-react';
import { useToast } from "@/Core";
import { usePermission } from "@/Core";

// Import tab components
import PersonalInfoTab from './tabs/PersonalInfoTab';
import EmploymentDetailsTab from './tabs/EmploymentDetailsTab';
import SalaryInfoTab from './tabs/SalaryInfoTab';
import DocumentsTab from './tabs/DocumentsTab';
import CertificationsTab from './tabs/CertificationsTab';

// Define types for form data
interface PersonalInfoData {
  first_name: string;
  last_name: string;
  email: string;
  nationality: string;
  phone?: string;
  address?: string;
  city?: string;
  date_of_birth?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

interface EmploymentDetailsData {
  position_id: number | null;
  department: string;
  employment_status: string;
  hire_date: string;
  termination_date: string | null;
}

interface SalaryInfoData {
  hourly_rate: number;
  basic_salary: number;
  food_allowance?: number;
  housing_allowance?: number;
  transport_allowance?: number;
  absent_deduction_rate?: number;
  advance_payment?: number;
  overtime_rate_multiplier?: number;
  overtime_fixed_rate?: number;
  other_allowance?: number;
  mobile_allowance?: number;
  bank_name?: string;
  bank_account_number?: string;
  bank_iban?: string;
}

interface DocumentsData {
  passport_number?: string;
  passport_expiry?: string;
  iqama_number?: string;
  iqama_expiry?: string;
  iqama_cost?: number;
}

interface CertificationData {
  name: string;
  issuing_organization: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
}

interface CertificationsData {
  certifications: CertificationData[];
}

interface Props extends PageProps {
  positions: Array<{
    id: number;
    name: string;
    description: string | null;
    is_active: boolean;
  }>
}

export default function EmployeeCreate({ auth, positions }: Props) {
  const { t } = useTranslation('employee');

  const { toast } = useToast();
  const { hasPermission } = usePermission();
  const [activeTab, setActiveTab] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personal: {},
    employment: {},
    salary: {},
    documents: {},
    certifications: {},
  });

  // Load draft data on component mount
  React.useEffect(() => {
    const draftKey = `employee_draft_${auth.user.id}`;
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(prev => ({
          ...prev,
          ...draftData
        }));
        
        toast.success({
          title: "Draft Loaded",
          description: "Your previously saved draft has been loaded",
          duration: 3000,
        });
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem(draftKey);
      }
    }
  }, [auth.user.id, toast]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSaveDraft = async (tab: string, data: any) => {
    try {
      setIsSubmitting(true);
      setFormData(prev => ({
        ...prev,
        [tab]: data
      }));

      // Save draft to localStorage for persistence
      const draftKey = `employee_draft_${auth.user.id}`;
      const currentDraft = JSON.parse(localStorage.getItem(draftKey) || '{}');
      const updatedDraft = {
        ...currentDraft,
        [tab]: data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(updatedDraft));

      toast.success({
        title: "Success",
        description: `Draft saved for ${tab} tab`,
        duration: 3000,
      })
    } catch (error) {
      toast.error({
        title: "Error",
        description: "Failed to save draft",
        duration: 3000,
      })
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate that all required tabs have data
      const requiredTabs = ['personal', 'employment', 'salary'];
      const missingTabs = requiredTabs.filter(tab => !formData[tab] || Object.keys(formData[tab]).length === 0);
      
      if (missingTabs.length > 0) {
        toast.error({
          title: "Incomplete Form",
          description: `Please complete the following sections: ${missingTabs.join(', ')}`,
          duration: 5000,
        });
        return;
      }

      // Flatten the form data for submission
      const submissionData = {
        ...formData.personal,
        ...formData.employment,
        ...formData.salary,
        ...formData.documents,
        certifications: formData.certifications?.certifications || []
      };

      await router.post(route('employees.store'), submissionData, {
        onSuccess: () => {
          // Clear the draft from localStorage
          const draftKey = `employee_draft_${auth.user.id}`;
          localStorage.removeItem(draftKey);
          
          toast.success({
            title: "Success",
            description: "Employee created successfully",
            duration: 3000,
          });
          router.visit(route('employees.index'));
        },
        onError: (errors) => {
          console.error('Submission errors:', errors);
          toast.error({
            title: "Validation Error",
            description: "Please check the form for errors and try again",
            duration: 5000,
          });
        }
      });
    } catch (error) {
      console.error('Submission error:', error);
      toast.error({
        title: "Error",
        description: "An error occurred while submitting the form",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout title={t('ttl_create_employee')} requiredPermission="employees.create">
      <Head title={t('ttl_create_employee')} />

      <div className="flex h-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-bold">{t('ttl_create_employee')}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href={route('employees.index')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {t('btn_back_to_employees')}
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="personal">{t('personal_info')}</TabsTrigger>
                <TabsTrigger value="employment">Employment</TabsTrigger>
                <TabsTrigger value="salary">Salary</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="certifications">Certifications</TabsTrigger>
              </TabsList>

              <TabsContent value="personal">
                <PersonalInfoTab
                  data={formData.personal}
                  onSaveDraft={(data: PersonalInfoData) => handleSaveDraft('personal', data)}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="employment">
                <EmploymentDetailsTab
                  data={formData.employment}
                  positions={positions}
                  onSaveDraft={(data: EmploymentDetailsData) => handleSaveDraft('employment', data)}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="salary">
                <SalaryInfoTab
                  data={formData.salary}
                  onSaveDraft={(data: SalaryInfoData) => handleSaveDraft('salary', data)}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="documents">
                <DocumentsTab
                  data={formData.documents}
                  onSaveDraft={(data: DocumentsData) => handleSaveDraft('documents', data)}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>

              <TabsContent value="certifications">
                <CertificationsTab
                  data={formData.certifications}
                  onSaveDraft={(data: CertificationsData) => handleSaveDraft('certifications', data)}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
















