<?php

namespace Modules\RentalManagement\Services;

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
            'timeout'  => 60, // Increased timeout to 60 seconds
            'connect_timeout' => 30, // Connection timeout
            'headers' => [
                'Authorization' => 'token ' . $this->apiKey . ':' . $this->apiSecret,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
    }

    /**
     * Get the HTTP client for debugging purposes.
     */
    public function getClient(): Client
    {
        return $this->client;
    }

    public function getOrCreateCustomer(array $customerData): array
    {
        $name = $customerData['customer_name'] ?? null;
        if (empty($name)) {
            throw new \InvalidArgumentException('customer_name is required for ERPNext customer creation');
        }
        $filters = urlencode(json_encode([["name", "=", $name]]));
        $url = "/api/resource/Customer?filters=$filters";
        try {
            $response = $this->client->get($url);
            $data = json_decode($response->getBody()->getContents(), true);
            if (!empty($data['data'])) {
                return $data['data'][0];
            }
        } catch (\Exception $e) {
            Log::warning('ERPNext get customer failed: ' . $e->getMessage());
        }
        // Not found, create
        $payload = [
            'customer_name' => $name,
            'customer_group' => $customerData['customer_group'] ?? 'Commercial',
            'territory' => $customerData['territory'] ?? 'All Territories',
        ];
        Log::info('Creating ERPNext customer', $payload);
        $response = $this->client->post('/api/resource/Customer', [
            'json' => $payload,
        ]);
        $data = json_decode($response->getBody()->getContents(), true);
        return $data['data'] ?? $data;
    }

    public function createSalesInvoice(array $payload): array
    {
        $response = $this->client->post('/api/resource/Sales Invoice', [
            'json' => $payload,
        ]);
        $data = json_decode($response->getBody()->getContents(), true);
        return $data['data'] ?? $data;
    }

    public function getInvoice($invoiceId): array
    {
        $response = $this->client->get('/api/resource/Sales Invoice/' . $invoiceId);
        $data = json_decode($response->getBody()->getContents(), true);
        return $data['data'] ?? $data;
    }

    public function findInvoiceByAmendedFrom($oldInvoiceId): ?array
    {
        $filters = urlencode(json_encode([["amended_from", "=", $oldInvoiceId]]));
        $url = "/api/resource/Sales Invoice?filters=$filters";
        try {
            $response = $this->client->get($url);
            $data = json_decode($response->getBody()->getContents(), true);
            if (!empty($data['data'])) {
                // Return the latest amended invoice
                return $data['data'][0];
            }
        } catch (\Exception $e) {
            Log::warning('ERPNext find amended invoice failed: ' . $e->getMessage());
        }
        return null;
    }

    public function getOrCreateItem(array $itemData): array
    {
        $itemCode = $itemData['item_code'];
        $filters = urlencode(json_encode([["item_code", "=", $itemCode]]));
        $url = "/api/resource/Item?filters=$filters";
        try {
            Log::info('ERPNext: Checking for item', ['item_code' => $itemCode]);
            $response = $this->client->get($url);
            $data = json_decode($response->getBody()->getContents(), true);
            if (!empty($data['data'])) {
                Log::info('ERPNext: Item found', ['item_code' => $itemCode]);
                return $data['data'][0];
            }
        } catch (\Exception $e) {
            Log::warning('ERPNext get item failed: ' . $e->getMessage());
        }
        // Not found, create
        $payload = [
            'item_code' => $itemCode,
            'item_name' => $itemData['item_name'],
            'item_group' => $itemData['item_group'] ?? 'Equipment',
            'stock_uom' => $itemData['stock_uom'] ?? 'Nos',
            'description' => $itemData['description'] ?? $itemData['item_name'],
        ];
        Log::info('ERPNext: Creating item', $payload);
        $response = $this->client->post('/api/resource/Item', [
            'json' => $payload,
        ]);
        $data = json_decode($response->getBody()->getContents(), true);
        Log::info('ERPNext: Item created', ['item_code' => $itemCode, 'response' => $data]);
        return $data['data'] ?? $data;
    }

    /**
     * Fetch all equipment items from ERPNext (item_group = 'Equipment').
     */
    public function fetchAllEquipmentItems(): array
    {
        try {
            $filters = urlencode(json_encode([["item_group", "=", "Equipment"]]));
            $url = "/api/resource/Item?filters=$filters&limit_page_length=1000&fields=[\"name\",\"item_code\",\"item_name\",\"description\",\"item_group\",\"stock_uom\",\"disabled\",\"standard_rate\",\"last_purchase_rate\",\"valuation_rate\",\"stock_qty\",\"model\",\"serial_no\",\"manufacturer\"]";

            Log::info('ERPNext: Fetching equipment items', [
                'url' => $url,
                'filters' => [["item_group", "=", "Equipment"]]
            ]);

            $response = $this->client->get($url);
            $body = $response->getBody()->getContents();

            Log::info('ERPNext: Raw equipment response received', [
                'status_code' => $response->getStatusCode(),
                'body_length' => strlen($body)
            ]);

            $data = json_decode($body, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('ERPNext: Failed to parse JSON response', [
                    'json_error' => json_last_error_msg(),
                    'body' => substr($body, 0, 500) // Log first 500 chars
                ]);
                return [];
            }

            $items = [];

            if (isset($data['data']) && is_array($data['data'])) {
                Log::info('ERPNext: Processing data array', [
                    'item_count' => count($data['data'])
                ]);

                // Use the data directly without fetching individual items
                $items = $data['data'];
            } elseif (is_array($data)) {
                Log::info('ERPNext: Processing direct array', [
                    'item_count' => count($data)
                ]);

                $items = $data;
            } else {
                Log::warning('ERPNext: Unexpected response format', [
                    'data_type' => gettype($data),
                    'data_keys' => is_array($data) ? array_keys($data) : 'not_array'
                ]);
            }

            Log::info('ERPNext: Equipment fetch completed', [
                'total_items_found' => count($items)
            ]);

            return $items;

        } catch (\Exception $e) {
            Log::error('ERPNext: Failed to fetch equipment items', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [];
        }
    }

    /**
     * Fetch a single item by name from ERPNext.
     */
    public function getItemByName(string $name): ?array
    {
        try {
            $filters = urlencode(json_encode([["name", "=", $name]]));
            $url = "/api/resource/Item?filters=$filters";

            Log::info('ERPNext: Fetching item by name', [
                'item_name' => $name,
                'url' => $url
            ]);

            $response = $this->client->get($url);
            $body = $response->getBody()->getContents();

            Log::info('ERPNext: Item by name response received', [
                'item_name' => $name,
                'status_code' => $response->getStatusCode(),
                'body_length' => strlen($body)
            ]);

            $data = json_decode($body, true);

            if (json_last_error() !== JSON_ERROR_NONE) {
                Log::error('ERPNext: Failed to parse JSON response for item', [
                    'item_name' => $name,
                    'json_error' => json_last_error_msg(),
                    'body' => substr($body, 0, 500)
                ]);
                return null;
            }

            $item = $data['data'][0] ?? null;

            if ($item) {
                Log::info('ERPNext: Item found', [
                    'item_name' => $name,
                    'item_code' => $item['item_code'] ?? 'unknown'
                ]);
            } else {
                Log::warning('ERPNext: Item not found', [
                    'item_name' => $name
                ]);
            }

            return $item;

        } catch (\Exception $e) {
            Log::error('ERPNext: Failed to fetch item by name', [
                'item_name' => $name,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }

    /**
     * Test ERPNext connection and return status.
     */
    public function testConnection(): array
    {
        try {
            Log::info('ERPNext: Testing connection');

            // Test with a simple API call
            $response = $this->client->get('/api/resource/Item?limit_page_length=1');
            $statusCode = $response->getStatusCode();
            $body = $response->getBody()->getContents();

            $data = json_decode($body, true);
            $jsonError = json_last_error();

            $result = [
                'success' => $statusCode === 200 && $jsonError === JSON_ERROR_NONE,
                'status_code' => $statusCode,
                'json_error' => $jsonError !== JSON_ERROR_NONE ? json_last_error_msg() : null,
                'response_length' => strlen($body),
                'has_data' => isset($data['data']),
                'data_count' => isset($data['data']) ? count($data['data']) : 0,
                'sample_response' => substr($body, 0, 200)
            ];

            Log::info('ERPNext: Connection test completed', $result);

            return $result;

        } catch (\Exception $e) {
            Log::error('ERPNext: Connection test failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'status_code' => null,
                'json_error' => null,
                'response_length' => 0,
                'has_data' => false,
                'data_count' => 0,
                'sample_response' => null
            ];
        }
    }
}
