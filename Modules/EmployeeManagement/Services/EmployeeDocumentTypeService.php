<?php

namespace Modules\EmployeeManagement\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class EmployeeDocumentTypeService
{
    /**
     * Document type validation rules
     */
    private array $documentRules = [
        'iqama' => [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120', // 5MB max
            'metadata' => [
                'document_number' => 'required|string|min:10|max:10',
                'issue_date' => 'required|date|before:tomorrow',
                'expiry_date' => 'required|date|after:issue_date',
                'issuing_authority' => 'required|string|max:255',
            ]
        ],
        'passport' => [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'metadata' => [
                'document_number' => 'required|string|min:6|max:15',
                'issue_date' => 'required|date|before:tomorrow',
                'expiry_date' => 'required|date|after:issue_date',
                'issuing_authority' => 'required|string|max:255',
                'nationality' => 'required|string|max:100',
            ]
        ],
        'contract' => [
            'file' => 'required|file|mimes:pdf|max:10240', // 10MB max for contracts
            'metadata' => [
                'contract_type' => 'required|string|in:permanent,temporary,project-based',
                'start_date' => 'required|date',
                'end_date' => 'required_if:contract_type,temporary,project-based|date|after:start_date',
                'position' => 'required|string|max:255',
                'department' => 'required|string|max:255',
            ]
        ],
        'medical' => [
            'file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
            'metadata' => [
                'document_type' => 'required|string|in:insurance-card,medical-report,vaccination-record',
                'issue_date' => 'required|date|before:tomorrow',
                'expiry_date' => 'nullable|date|after:issue_date',
                'provider' => 'required|string|max:255',
                'policy_number' => 'required_if:document_type,insurance-card|string|max:50',
            ]
        ]
    ];

    /**
     * Validate document based on its type
     */
    public function validateDocument(string $documentType, UploadedFile $file, array $metadata): void
    {
        if (!isset($this->documentRules[$documentType])) {
            throw ValidationException::withMessages([
                'document_type' => ['Invalid document type']
            ]);
        }

        // Validate file
        Validator::make(['file' => $file], [
            'file' => $this->documentRules[$documentType]['file']
        ])->validate();

        // Validate metadata
        Validator::make($metadata, $this->documentRules[$documentType]['metadata'])->validate();
    }

    /**
     * Process Iqama document
     */
    public function processIqama(UploadedFile $file, array $metadata): array
    {
        $this->validateDocument('iqama', $file, $metadata);
        return array_merge($metadata, [
            'document_type' => 'iqama',
            'status' => 'pending',
        ]);
    }

    /**
     * Process Passport document
     */
    public function processPassport(UploadedFile $file, array $metadata): array
    {
        $this->validateDocument('passport', $file, $metadata);
        return array_merge($metadata, [
            'document_type' => 'passport',
            'status' => 'pending',
        ]);
    }

    /**
     * Process Contract document
     */
    public function processContract(UploadedFile $file, array $metadata): array
    {
        $this->validateDocument('contract', $file, $metadata);
        return array_merge($metadata, [
            'document_type' => 'contract',
            'status' => 'pending',
        ]);
    }

    /**
     * Process Medical document
     */
    public function processMedical(UploadedFile $file, array $metadata): array
    {
        $this->validateDocument('medical', $file, $metadata);
        return array_merge($metadata, [
            'document_type' => 'medical',
            'status' => 'pending',
        ]);
    }

    /**
     * Get validation rules for a document type
     */
    public function getValidationRules(string $documentType): array
    {
        return $this->documentRules[$documentType] ?? [];
    }
} 