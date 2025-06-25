<?php

namespace Modules\EmployeeManagement\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Storage;
use Modules\EmployeeManagement\Models\Employee;
use Modules\EmployeeManagement\Models\EmployeeDocument;
use Modules\Core\Services\NotificationService;
use Modules\EmployeeManagement\Events\DocumentExpiryWarning;
use Modules\EmployeeManagement\Events\DocumentExpired;
use Modules\EmployeeManagement\Events\DocumentRenewalRequired;

class DocumentValidationService
{
    protected NotificationService $notificationService;
    
    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Validate a document upload
     */
    public function validateDocument(array $document): array
    {
        $validationRules = $this->getValidationRules($document['type']);
        
        $validationResult = [
            'is_valid' => true,
            'errors' => [],
            'warnings' => [],
        ];

        // Validate file type
        if (!in_array($document['mime_type'], $validationRules['allowed_types'])) {
            $validationResult['is_valid'] = false;
            $validationResult['errors'][] = "Invalid file type. Allowed types: " . implode(', ', $validationRules['allowed_types']);
        }

        // Validate file size
        if ($document['size'] > $validationRules['max_size']) {
            $validationResult['is_valid'] = false;
            $validationResult['errors'][] = "File size exceeds maximum allowed size of {$validationRules['max_size']} bytes";
        }

        // Validate expiry date if required
        if ($validationRules['requires_expiry'] && empty($document['expiry_date'])) {
            $validationResult['is_valid'] = false;
            $validationResult['errors'][] = "Expiry date is required for this document type";
        }

        // Additional document-specific validations
        $this->performDocumentSpecificValidations($document, $validationRules, $validationResult);

        return $validationResult;
    }

    /**
     * Get validation rules for a document type
     */
    protected function getValidationRules(string $documentType): array
    {
        $commonRules = [
            'allowed_types' => ['application/pdf', 'image/jpeg', 'image/png'],
            'max_size' => 10 * 1024 * 1024, // 10MB
        ];

        $typeSpecificRules = [
            'passport' => [
                'requires_expiry' => true,
                'expiry_warning_days' => 90,
                'required_fields' => ['passport_number', 'issuing_country', 'issue_date'],
                'validation_rules' => [
                    'passport_number' => 'required|string|min:6',
                    'issuing_country' => 'required|string',
                    'issue_date' => 'required|date|before:today',
                ],
            ],
            'iqama' => [
                'requires_expiry' => true,
                'expiry_warning_days' => 60,
                'required_fields' => ['iqama_number', 'issue_date'],
                'validation_rules' => [
                    'iqama_number' => 'required|string|min:10',
                    'issue_date' => 'required|date|before:today',
                ],
            ],
            'contract' => [
                'requires_expiry' => true,
                'expiry_warning_days' => 30,
                'required_fields' => ['contract_type', 'start_date', 'end_date'],
                'validation_rules' => [
                    'contract_type' => 'required|string',
                    'start_date' => 'required|date',
                    'end_date' => 'required|date|after:start_date',
                ],
            ],
            'medical' => [
                'requires_expiry' => true,
                'expiry_warning_days' => 30,
                'required_fields' => ['medical_type', 'issue_date'],
                'validation_rules' => [
                    'medical_type' => 'required|string',
                    'issue_date' => 'required|date|before:today',
                ],
            ],
        ];

        return array_merge($commonRules, $typeSpecificRules[$documentType] ?? []);
    }

    /**
     * Perform document-specific validations
     */
    protected function performDocumentSpecificValidations(array $document, array $rules, array &$validationResult): void
    {
        if (!isset($rules['required_fields'])) {
            return;
        }

        foreach ($rules['required_fields'] as $field) {
            if (!isset($document[$field]) || empty($document[$field])) {
                $validationResult['is_valid'] = false;
                $validationResult['errors'][] = "Required field '{$field}' is missing";
            }
        }

        if (isset($rules['validation_rules'])) {
            foreach ($rules['validation_rules'] as $field => $rule) {
                // Here you would implement the actual validation logic for each rule
                // This is a simplified example
                if (isset($document[$field])) {
                    $this->validateField($field, $document[$field], $rule, $validationResult);
                }
            }
        }
    }

    /**
     * Check for documents nearing expiry
     */
    public function checkExpiringDocuments(): Collection
    {
        $expiringDocuments = collect();
        
        $documentTypes = ['passport', 'iqama', 'contract', 'medical'];
        
        foreach ($documentTypes as $type) {
            $rules = $this->getValidationRules($type);
            $warningDays = $rules['expiry_warning_days'] ?? 30;
            
            $documents = EmployeeDocument::where('type', $type)
                ->where('expiry_date', '<=', Carbon::now()->addDays($warningDays))
                ->where('expiry_date', '>', Carbon::now())
                ->with('employee')
                ->get();
                
            foreach ($documents as $document) {
                event(new DocumentExpiryWarning($document));
                $expiringDocuments->push($document);
            }
        }
        
        return $expiringDocuments;
    }

    /**
     * Initiate document renewal process
     */
    public function initiateRenewalProcess(EmployeeDocument $document): void
    {
        $daysUntilExpiry = Carbon::now()->diffInDays($document->expiry_date, false);
        
        if ($daysUntilExpiry <= 0) {
            event(new DocumentExpired($document));
        } else {
            event(new DocumentRenewalRequired($document));
        }
        
        $document->update(['renewal_status' => 'pending']);
        
        // Notify relevant parties
        $this->notificationService->sendNotification(
            $document->employee->user,
            'Document Renewal Required',
            "Your {$document->type} is due for renewal. Please submit the updated document."
        );
        
        // Notify HR
        $this->notificationService->sendNotificationToRole(
            'hr_manager',
            'Document Renewal Required',
            "Document renewal required for employee {$document->employee->name} - {$document->type}"
        );
    }

    /**
     * Process bulk document upload
     */
    public function processBulkUpload(array $documents): array
    {
        $results = [
            'successful' => [],
            'failed' => [],
        ];
        
        foreach ($documents as $document) {
            $validation = $this->validateDocument($document);
            
            if ($validation['is_valid']) {
                try {
                    $this->storeDocument($document);
                    $results['successful'][] = $document['name'];
                } catch (\Exception $e) {
                    $results['failed'][] = [
                        'name' => $document['name'],
                        'error' => $e->getMessage(),
                    ];
                }
            } else {
                $results['failed'][] = [
                    'name' => $document['name'],
                    'errors' => $validation['errors'],
                ];
            }
        }
        
        return $results;
    }

    /**
     * Store a validated document
     */
    protected function storeDocument(array $documentData): EmployeeDocument
    {
        $path = Storage::disk('secure')->put(
            "employee_documents/{$documentData['employee_id']}/{$documentData['type']}",
            $documentData['file']
        );
        
        return EmployeeDocument::create([
            'employee_id' => $documentData['employee_id'],
            'type' => $documentData['type'],
            'file_path' => $path,
            'expiry_date' => $documentData['expiry_date'] ?? null,
            'metadata' => array_filter($documentData, function ($key) {
                return !in_array($key, ['file', 'employee_id', 'type', 'expiry_date']);
            }, ARRAY_FILTER_USE_KEY),
        ]);
    }

    /**
     * Validate a specific field
     */
    protected function validateField(string $field, $value, string $rules, array &$validationResult): void
    {
        $rulesParts = explode('|', $rules);
        
        foreach ($rulesParts as $rule) {
            if ($rule === 'required' && empty($value)) {
                $validationResult['is_valid'] = false;
                $validationResult['errors'][] = "Field '{$field}' is required";
            }
            
            if (strpos($rule, 'min:') === 0) {
                $minLength = substr($rule, 4);
                if (strlen($value) < $minLength) {
                    $validationResult['is_valid'] = false;
                    $validationResult['errors'][] = "Field '{$field}' must be at least {$minLength} characters long";
                }
            }
            
            if ($rule === 'date') {
                try {
                    Carbon::parse($value);
                } catch (\Exception $e) {
                    $validationResult['is_valid'] = false;
                    $validationResult['errors'][] = "Field '{$field}' must be a valid date";
                }
            }
            
            if ($rule === 'before:today' && Carbon::parse($value)->isAfter(Carbon::today())) {
                $validationResult['is_valid'] = false;
                $validationResult['errors'][] = "Field '{$field}' must be a date before today";
            }
            
            if (strpos($rule, 'after:') === 0) {
                $otherField = substr($rule, 6);
                if (isset($document[$otherField]) && Carbon::parse($value)->isBefore(Carbon::parse($document[$otherField]))) {
                    $validationResult['is_valid'] = false;
                    $validationResult['errors'][] = "Field '{$field}' must be a date after {$otherField}";
                }
            }
        }
    }
} 