import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from "@/Core";
import { Button } from "@/Core";
import { Input } from "@/Core";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/Core";
import { useForm, useFieldArray, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, X, Upload, Trash2, Eye, EyeOff } from 'lucide-react';

const certificationSchema = z.object({
  driving_license: z.object({
    number: z.string().optional(),
    expiry_date: z.string().optional(),
    cost: z.number().min(0, 'Cost must be a positive number').optional(),
  }).optional(),
  operator_license: z.object({
    number: z.string().optional(),
    expiry_date: z.string().optional(),
    cost: z.number().min(0, 'Cost must be a positive number').optional(),
  }).optional(),
  tuv_certification: z.object({
    number: z.string().optional(),
    expiry_date: z.string().optional(),
    cost: z.number().min(0, 'Cost must be a positive number').optional(),
  }).optional(),
  spsp_license: z.object({
    number: z.string().optional(),
    expiry_date: z.string().optional(),
    cost: z.number().min(0, 'Cost must be a positive number').optional(),
  }).optional(),
  custom_certifications: z.array(z.object({
    name: z.string().optional(),
    issuing_organization: z.string().optional(),
    issue_date: z.string().optional(),
    expiry_date: z.string().optional(),
    credential_id: z.string().optional(),
    credential_url: z.string().url('Must be a valid URL').optional(),
    cost: z.number().min(0, 'Cost must be a positive number').optional(),
  })).optional()
})

type CertificationFormValues = z.infer<typeof certificationSchema>

interface CertificationsTabProps {
  form: UseFormReturn<any>
  files: Record<string, File | null>
  setFiles: React.Dispatch<React.SetStateAction<Record<string, File | null>>>
  onTotalCostChange: (cost: number) => void;
}

interface Certification {
  name: string;
  cost: number;
  expiry_date: string;
}

export default function CertificationsTab({ form, files, setFiles, onTotalCostChange }: CertificationsTabProps) {
  const { t } = useTranslation('employee');

  const [showDrivingLicense, setShowDrivingLicense] = useState(false);
  const [showOperatorLicense, setShowOperatorLicense] = useState(false);
  const [showTuvCertification, setShowTuvCertification] = useState(false);
  const [showSpspLicense, setShowSpspLicense] = useState(false);
  const [showCustomCertifications, setShowCustomCertifications] = useState(false);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "custom_certifications"
  })

  const handleFileChange = (field: string, file: File | null) => {
    setFiles((prev: Record<string, File | null>) => ({
      ...prev,
      [field]: file
    }));
  };

  const renderStandardCertification = (name: string, prefix: 'driving_license' | 'operator_license' | 'tuv_certification' | 'spsp_license') => (
    <div className="space-y-4 p-4 border rounded-lg">
      <h3 className="text-lg font-medium">{name}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name={`${prefix}.number` as const}
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('lbl_license_number')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={`Enter ${name} number`} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.expiry_date` as const}
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>{t('expiry_date')}</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`${prefix}.cost` as const}
          render={({ field }: any) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={e => {
                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                    field.onChange(value);
                  }}
                  value={field.value || 0}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>{t('lbl_document_file')}</FormLabel>
          <div className="flex items-center space-x-2">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileChange(prefix, e.target.files?.[0] || null)}
            />
            {files[prefix] && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleFileChange(prefix, null)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </FormItem>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Certifications</CardTitle>
      </CardHeader>
      <CardContent>
        <Form>
          <div className="space-y-6">
            {/* Standard Certifications Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t('standard_certifications')}</h3>

              {/* Driving License */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowDrivingLicense(!showDrivingLicense)}
                >
                  <span>{t('driving_license')}</span>
                  {showDrivingLicense ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>{t('hide_details')}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>{t('show_details')}</span>
                    </>
                  )}
                </Button>
                {showDrivingLicense && renderStandardCertification('Driving License', 'driving_license')}
              </div>

              {/* Operator License */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowOperatorLicense(!showOperatorLicense)}
                >
                  <span>{t('lbl_operator_license')}</span>
                  {showOperatorLicense ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>{t('hide_details')}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>{t('show_details')}</span>
                    </>
                  )}
                </Button>
                {showOperatorLicense && renderStandardCertification('Operator License', 'operator_license')}
              </div>

              {/* TUV Certification */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowTuvCertification(!showTuvCertification)}
                >
                  <span>TUV Certification</span>
                  {showTuvCertification ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>{t('hide_details')}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>{t('show_details')}</span>
                    </>
                  )}
                </Button>
                {showTuvCertification && renderStandardCertification('TUV Certification', 'tuv_certification')}
              </div>

              {/* SPSP License */}
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full flex items-center justify-between"
                  onClick={() => setShowSpspLicense(!showSpspLicense)}
                >
                  <span>SPSP License</span>
                  {showSpspLicense ? (
                    <>
                      <EyeOff className="h-4 w-4" />
                      <span>{t('hide_details')}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4" />
                      <span>{t('show_details')}</span>
                    </>
                  )}
                </Button>
                {showSpspLicense && renderStandardCertification('SPSP License', 'spsp_license')}
              </div>
            </div>

            {/* Custom Certifications Section */}
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-between"
                onClick={() => setShowCustomCertifications(!showCustomCertifications)}
              >
                <span>{t('additional_certifications')}</span>
                {showCustomCertifications ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>{t('hide_details')}</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>{t('show_details')}</span>
                  </>
                )}
              </Button>

              {showCustomCertifications && (
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="space-y-4 p-4 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <h4 className="text-md font-medium">Certification {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name={`custom_certifications.${index}.name`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>{t('lbl_certification_name')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter certification name" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`custom_certifications.${index}.issuing_organization`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>{t('lbl_issuing_organization')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter organization name" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`custom_certifications.${index}.issue_date`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>{t('lbl_issue_date')}</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`custom_certifications.${index}.expiry_date`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>{t('expiry_date')}</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`custom_certifications.${index}.credential_id`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>{t('lbl_credential_id')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter credential ID" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`custom_certifications.${index}.credential_url`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>{t('lbl_credential_url')}</FormLabel>
                              <FormControl>
                                <Input {...field} placeholder="Enter credential URL" />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`custom_certifications.${index}.cost`}
                          render={({ field }: any) => (
                            <FormItem>
                              <FormLabel>Cost</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={e => {
                                    const value = e.target.value === '' ? 0 : Number(e.target.value);
                                    field.onChange(value);
                                  }}
                                  value={field.value || 0}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({
                      name: '',
                      issuing_organization: '',
                      issue_date: '',
                      expiry_date: '',
                      credential_id: '',
                      credential_url: '',
                      cost: 0,
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Certification
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Form>
      </CardContent>
    </Card>
  );
}



















