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
            'timeout'  => 10, // seconds
            'headers' => [
                'Authorization' => 'token ' . $this->apiKey . ':' . $this->apiSecret,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
        ]);
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
        $filters = urlencode(json_encode([["item_group", "=", "Equipment"]]));
        $url = "/api/resource/Item?filters=$filters&limit_page_length=1000";
        $response = $this->client->get($url);
        $body = $response->getBody()->getContents();
        Log::info('ERPNext raw equipment response', ['body' => $body]);
        $data = json_decode($body, true);
        $items = [];
        if (isset($data['data']) && is_array($data['data'])) {
            foreach ($data['data'] as $item) {
                if (isset($item['name'])) {
                    $full = $this->getItemByName($item['name']);
                    if ($full) {
                        $items[] = $full;
                    }
                }
            }
            return $items;
        }
        if (is_array($data)) {
            foreach ($data as $item) {
                if (isset($item['name'])) {
                    $full = $this->getItemByName($item['name']);
                    if ($full) {
                        $items[] = $full;
                    }
                }
            }
            return $items;
        }
        return [];
    }

    /**
     * Fetch a single item by name from ERPNext.
     */
    public function getItemByName(string $name): ?array
    {
        $filters = urlencode(json_encode([["name", "=", $name]]));
        $url = "/api/resource/Item?filters=$filters";
        $response = $this->client->get($url);
        $data = json_decode($response->getBody()->getContents(), true);
        return $data['data'][0] ?? null;
    }
}
