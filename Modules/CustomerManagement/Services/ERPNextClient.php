<?php

namespace Modules\CustomerManagement\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;

class ERPNextClient
{
    protected $client;
    protected $baseUrl;
    protected $apiKey;
    protected $apiSecret;

    public function __construct()
    {
        $this->baseUrl = config('services.erpnext.url');
        $this->apiKey = config('services.erpnext.api_key');
        $this->apiSecret = config('services.erpnext.api_secret');
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'timeout'  => 20, // seconds
            'headers' => [
                'Authorization' => 'token ' . $this->apiKey . ':' . $this->apiSecret,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
    }

    /**
     * Fetch all customers from ERPNext.
     */
    public function fetchAllCustomers(): array
    {
        $response = $this->client->get('/api/resource/Customer?limit_page_length=1000');
        $body = $response->getBody()->getContents();
        Log::info('ERPNext raw customer response', ['body' => $body]);
        $data = json_decode($body, true);
        $customers = [];
        if (isset($data['data']) && is_array($data['data'])) {
            foreach ($data['data'] as $item) {
                if (isset($item['name'])) {
                    $full = $this->fetchCustomerByName($item['name']);
                    if ($full) {
                        $customers[] = $full;
                    }
                }
            }
            return $customers;
        }
        if (isset($data['results']) && is_array($data['results'])) {
            foreach ($data['results'] as $item) {
                if (isset($item['name'])) {
                    $full = $this->fetchCustomerByName($item['name']);
                    if ($full) {
                        $customers[] = $full;
                    }
                }
            }
            return $customers;
        }
        if (is_array($data)) {
            foreach ($data as $item) {
                if (isset($item['name'])) {
                    $full = $this->fetchCustomerByName($item['name']);
                    if ($full) {
                        $customers[] = $full;
                    }
                }
            }
            return $customers;
        }
        return [];
    }

    /**
     * Fetch a single customer by name from ERPNext.
     */
    public function fetchCustomerByName(string $name): ?array
    {
        $filters = urlencode(json_encode([["name", "=", $name]]));
        $url = "/api/resource/Customer?filters=$filters";
        $response = $this->client->get($url);
        $data = json_decode($response->getBody()->getContents(), true);
        return $data['data'][0] ?? null;
    }

    /**
     * Create or update a customer in ERPNext from local data.
     */
    public function createOrUpdateCustomerInERPNext(array $customerData): array
    {
        $name = $customerData['company_name'] ?? $customerData['name'] ?? null;
        if (empty($name)) {
            throw new \InvalidArgumentException('company_name or name is required for ERPNext customer creation');
        }
        // Try to fetch existing customer
        $existing = $this->fetchCustomerByName($name);
        $payload = [
            'customer_name' => $customerData['company_name'] ?? $customerData['name'],
            'customer_group' => $customerData['customer_group'] ?? 'Commercial',
            'territory' => $customerData['territory'] ?? 'All Territories',
            'email_id' => $customerData['email'] ?? null,
            'mobile_no' => $customerData['phone'] ?? null,
            'tax_id' => $customerData['tax_number'] ?? null,
            'customer_address' => $customerData['address'] ?? null,
            'city' => $customerData['city'] ?? null,
            'state' => $customerData['state'] ?? null,
            'pincode' => $customerData['postal_code'] ?? null,
            'country' => $customerData['country'] ?? null,
            'credit_limit' => $customerData['credit_limit'] ?? null,
            'payment_terms' => $customerData['payment_terms'] ?? null,
            'notes' => $customerData['notes'] ?? null,
            'disabled' => isset($customerData['is_active']) ? !$customerData['is_active'] : 0,
        ];
        if ($existing && isset($existing['name'])) {
            // Update existing
            $response = $this->client->put('/api/resource/Customer/' . urlencode($existing['name']), [
                'json' => $payload,
            ]);
        } else {
            // Create new
            $response = $this->client->post('/api/resource/Customer', [
                'json' => $payload,
            ]);
        }
        $data = json_decode($response->getBody()->getContents(), true);
        return $data['data'] ?? $data;
    }

    /**
     * Map ERPNext customer fields to local fields.
     */
    public function mapToLocal(array $erpCustomer): array
    {
        return [
            'name' => $erpCustomer['customer_name'] ?? $erpCustomer['name'] ?? null,
            'company_name' => $erpCustomer['customer_name'] ?? $erpCustomer['name'] ?? null,
            'contact_person' => $erpCustomer['contact_person'] ?? null,
            'email' => $erpCustomer['email_id'] ?? $erpCustomer['email'] ?? null,
            'phone' => $erpCustomer['mobile_no'] ?? $erpCustomer['phone'] ?? null,
            'address' => $erpCustomer['customer_address'] ?? $erpCustomer['address_line1'] ?? $erpCustomer['address'] ?? null,
            'city' => $erpCustomer['city'] ?? null,
            'state' => $erpCustomer['state'] ?? null,
            'postal_code' => $erpCustomer['pincode'] ?? $erpCustomer['postal_code'] ?? null,
            'country' => $erpCustomer['country'] ?? null,
            'tax_number' => $erpCustomer['tax_id'] ?? $erpCustomer['vat'] ?? null,
            'credit_limit' => $erpCustomer['credit_limit'] ?? null,
            'payment_terms' => $erpCustomer['payment_terms'] ?? null,
            'notes' => $erpCustomer['notes'] ?? null,
            'is_active' => ($erpCustomer['disabled'] ?? 0) == 0,
        ];
    }
}
