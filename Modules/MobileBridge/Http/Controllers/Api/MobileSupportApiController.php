<?php

namespace Modules\MobileBridge\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Routing\Controller;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class MobileSupportApiController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Get frequently asked questions
     */
    public function getFaqs(Request $request): JsonResponse
    {
        try {
            $category = $request->get('category');
            $search = $request->get('search');
            $limit = $request->get('limit', 20);

            // Get FAQs from cache (in production, this would be from database)
            $faqsKey = 'mobile_faqs';
            $faqs = Cache::get($faqsKey, $this->getDefaultFaqs());

            // Filter by category if specified
            if ($category) {
                $faqs = array_filter($faqs, function($faq) use ($category) {
                    return $faq['category'] === $category;
                });
            }

            // Search in questions and answers
            if ($search) {
                $searchTerm = strtolower($search);
                $faqs = array_filter($faqs, function($faq) use ($searchTerm) {
                    return strpos(strtolower($faq['question']), $searchTerm) !== false ||
                           strpos(strtolower($faq['answer']), $searchTerm) !== false ||
                           in_array($searchTerm, array_map('strtolower', $faq['tags']));
                });
            }

            // Sort by popularity (view count) and then by order
            usort($faqs, function($a, $b) {
                if ($a['view_count'] === $b['view_count']) {
                    return $a['order'] - $b['order'];
                }
                return $b['view_count'] - $a['view_count'];
            });

            // Limit results
            $faqs = array_slice($faqs, 0, $limit);

            // Get categories for filtering
            $categories = $this->getFaqCategories();

            return response()->json([
                'success' => true,
                'faqs' => array_values($faqs),
                'categories' => $categories,
                'total' => count($faqs)
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get FAQs: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get FAQs'
            ], 500);
        }
    }

    /**
     * Get specific FAQ details and increment view count
     */
    public function getFaq(Request $request, int $faqId): JsonResponse
    {
        try {
            $faqsKey = 'mobile_faqs';
            $faqs = Cache::get($faqsKey, $this->getDefaultFaqs());

            $faq = collect($faqs)->firstWhere('id', $faqId);

            if (!$faq) {
                return response()->json([
                    'success' => false,
                    'error' => 'FAQ not found'
                ], 404);
            }

            // Increment view count
            $faq['view_count']++;
            $faq['last_viewed'] = now()->toISOString();

            // Update in cache
            $updatedFaqs = collect($faqs)->map(function($item) use ($faqId, $faq) {
                return $item['id'] === $faqId ? $faq : $item;
            })->toArray();

            Cache::put($faqsKey, $updatedFaqs, now()->addDays(7));

            return response()->json([
                'success' => true,
                'faq' => $faq
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get FAQ details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get FAQ details'
            ], 500);
        }
    }

    /**
     * Rate FAQ helpfulness
     */
    public function rateFaq(Request $request, int $faqId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'helpful' => 'required|boolean',
                'comment' => 'nullable|string|max:500'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $faqsKey = 'mobile_faqs';
            $faqs = Cache::get($faqsKey, $this->getDefaultFaqs());

            $faqIndex = collect($faqs)->search(function($item) use ($faqId) {
                return $item['id'] === $faqId;
            });

            if ($faqIndex === false) {
                return response()->json([
                    'success' => false,
                    'error' => 'FAQ not found'
                ], 404);
            }

            // Update rating
            if ($request->helpful) {
                $faqs[$faqIndex]['helpful_count']++;
            } else {
                $faqs[$faqIndex]['not_helpful_count']++;
            }

            // Store user rating to prevent duplicate ratings
            $userRatingKey = "faq_rating_{$user->id}_{$faqId}";
            Cache::put($userRatingKey, [
                'helpful' => $request->helpful,
                'comment' => $request->comment,
                'rated_at' => now()->toISOString()
            ], now()->addDays(30));

            // Update FAQs in cache
            Cache::put($faqsKey, $faqs, now()->addDays(7));

            Log::info('FAQ rated', [
                'faq_id' => $faqId,
                'user_id' => $user->id,
                'helpful' => $request->helpful
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Thank you for your feedback!'
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to rate FAQ: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to rate FAQ'
            ], 500);
        }
    }

    /**
     * Create a support ticket
     */
    public function createSupportTicket(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'subject' => 'required|string|max:255',
                'description' => 'required|string|max:2000',
                'category' => 'required|in:technical,billing,account,feature_request,bug_report,other',
                'priority' => 'required|in:low,medium,high,urgent',
                'attachments' => 'nullable|array|max:5',
                'attachments.*' => 'file|max:10240|mimes:jpg,jpeg,png,gif,pdf,txt,log,zip',
                'device_info' => 'nullable|array',
                'contact_method' => 'nullable|in:email,phone,chat',
                'preferred_contact_time' => 'nullable|string|max:100'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $ticketId = 'TKT-' . strtoupper(uniqid());

            // Handle file attachments
            $attachments = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('support_attachments', 'public');
                    $attachments[] = [
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType()
                    ];
                }
            }

            $ticketData = [
                'id' => $ticketId,
                'user_id' => $user->id,
                'user_name' => $user->name,
                'user_email' => $user->email,
                'subject' => $request->subject,
                'description' => $request->description,
                'category' => $request->category,
                'priority' => $request->priority,
                'status' => 'open',
                'attachments' => $attachments,
                'device_info' => $request->device_info ?? [],
                'contact_method' => $request->contact_method ?? 'email',
                'preferred_contact_time' => $request->preferred_contact_time,
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString(),
                'messages' => [
                    [
                        'id' => uniqid('msg_'),
                        'from_user' => true,
                        'from_name' => $user->name,
                        'message' => $request->description,
                        'attachments' => $attachments,
                        'created_at' => now()->toISOString()
                    ]
                ]
            ];

            // Store ticket in cache
            $cacheKey = "support_ticket_{$ticketId}";
            Cache::put($cacheKey, $ticketData, now()->addDays(30));

            // Add to user's ticket list
            $userTicketsKey = "user_tickets_{$user->id}";
            $userTickets = Cache::get($userTicketsKey, []);
            $userTickets[] = $ticketId;
            Cache::put($userTicketsKey, $userTickets, now()->addDays(30));

            // Add to global support queue
            $supportQueueKey = 'support_ticket_queue';
            $supportQueue = Cache::get($supportQueueKey, []);
            $supportQueue[] = $ticketId;
            Cache::put($supportQueueKey, $supportQueue, now()->addDays(30));

            // Send notification for urgent tickets
            if ($request->priority === 'urgent') {
                $this->notifySupportTeam($ticketData);
            }

            Log::info('Support ticket created', [
                'ticket_id' => $ticketId,
                'user_id' => $user->id,
                'category' => $request->category,
                'priority' => $request->priority
            ]);

            return response()->json([
                'success' => true,
                'ticket_id' => $ticketId,
                'message' => 'Support ticket created successfully',
                'status' => 'open',
                'created_at' => $ticketData['created_at']
            ], 201);

        } catch (\Exception $e) {
            Log::error('Failed to create support ticket: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to create support ticket'
            ], 500);
        }
    }

    /**
     * Get user's support tickets
     */
    public function getUserTickets(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $limit = $request->get('limit', 20);
            $page = $request->get('page', 1);
            $status = $request->get('status'); // open, in_progress, resolved, closed
            $category = $request->get('category');

            $userTicketsKey = "user_tickets_{$user->id}";
            $ticketIds = Cache::get($userTicketsKey, []);

            $tickets = [];
            foreach ($ticketIds as $ticketId) {
                $cacheKey = "support_ticket_{$ticketId}";
                $ticket = Cache::get($cacheKey);

                if ($ticket) {
                    // Apply filters
                    if ($status && $ticket['status'] !== $status) {
                        continue;
                    }
                    if ($category && $ticket['category'] !== $category) {
                        continue;
                    }

                    // Remove message details for list view
                    $ticketSummary = $ticket;
                    $ticketSummary['message_count'] = count($ticket['messages']);
                    $ticketSummary['last_message_at'] = end($ticket['messages'])['created_at'];
                    unset($ticketSummary['messages']);

                    $tickets[] = $ticketSummary;
                }
            }

            // Sort by creation date (newest first)
            usort($tickets, function($a, $b) {
                return Carbon::parse($b['created_at'])->gt(Carbon::parse($a['created_at'])) ? 1 : -1;
            });

            // Paginate
            $offset = ($page - 1) * $limit;
            $paginatedTickets = array_slice($tickets, $offset, $limit);

            return response()->json([
                'success' => true,
                'tickets' => $paginatedTickets,
                'pagination' => [
                    'current_page' => $page,
                    'per_page' => $limit,
                    'total' => count($tickets),
                    'last_page' => ceil(count($tickets) / $limit)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get user tickets: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get support tickets'
            ], 500);
        }
    }

    /**
     * Get specific ticket details
     */
    public function getTicket(Request $request, string $ticketId): JsonResponse
    {
        try {
            $user = Auth::user();
            $cacheKey = "support_ticket_{$ticketId}";
            $ticket = Cache::get($cacheKey);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found'
                ], 404);
            }

            // Check if user owns this ticket or is support staff
            if ($ticket['user_id'] !== $user->id && !$user->hasAnyRole(['admin', 'support'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Access denied'
                ], 403);
            }

            return response()->json([
                'success' => true,
                'ticket' => $ticket
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get ticket details: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get ticket details'
            ], 500);
        }
    }

    /**
     * Add message to support ticket
     */
    public function addTicketMessage(Request $request, string $ticketId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'message' => 'required|string|max:2000',
                'attachments' => 'nullable|array|max:3',
                'attachments.*' => 'file|max:5120|mimes:jpg,jpeg,png,gif,pdf,txt,log'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $cacheKey = "support_ticket_{$ticketId}";
            $ticket = Cache::get($cacheKey);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found'
                ], 404);
            }

            // Check permissions
            if ($ticket['user_id'] !== $user->id && !$user->hasAnyRole(['admin', 'support'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Access denied'
                ], 403);
            }

            // Handle attachments
            $attachments = [];
            if ($request->hasFile('attachments')) {
                foreach ($request->file('attachments') as $file) {
                    $path = $file->store('ticket_attachments', 'public');
                    $attachments[] = [
                        'original_name' => $file->getClientOriginalName(),
                        'path' => $path,
                        'size' => $file->getSize(),
                        'mime_type' => $file->getMimeType()
                    ];
                }
            }

            // Add new message
            $newMessage = [
                'id' => uniqid('msg_'),
                'from_user' => $ticket['user_id'] === $user->id,
                'from_name' => $user->name,
                'from_id' => $user->id,
                'message' => $request->message,
                'attachments' => $attachments,
                'created_at' => now()->toISOString()
            ];

            $ticket['messages'][] = $newMessage;
            $ticket['updated_at'] = now()->toISOString();

            // Update status if message is from support
            if ($user->hasAnyRole(['admin', 'support']) && $ticket['status'] === 'open') {
                $ticket['status'] = 'in_progress';
            }

            // Update ticket in cache
            Cache::put($cacheKey, $ticket, now()->addDays(30));

            Log::info('Message added to ticket', [
                'ticket_id' => $ticketId,
                'user_id' => $user->id,
                'from_user' => $newMessage['from_user']
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Message added successfully',
                'ticket_message' => $newMessage
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to add ticket message: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to add message'
            ], 500);
        }
    }

    /**
     * Close support ticket
     */
    public function closeTicket(Request $request, string $ticketId): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'reason' => 'nullable|string|max:500',
                'satisfaction_rating' => 'nullable|integer|min:1|max:5'
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'errors' => $validator->errors()
                ], 422);
            }

            $user = Auth::user();
            $cacheKey = "support_ticket_{$ticketId}";
            $ticket = Cache::get($cacheKey);

            if (!$ticket) {
                return response()->json([
                    'success' => false,
                    'error' => 'Ticket not found'
                ], 404);
            }

            // Check permissions
            if ($ticket['user_id'] !== $user->id && !$user->hasAnyRole(['admin', 'support'])) {
                return response()->json([
                    'success' => false,
                    'error' => 'Access denied'
                ], 403);
            }

            // Update ticket status
            $ticket['status'] = 'closed';
            $ticket['closed_at'] = now()->toISOString();
            $ticket['closed_by'] = $user->id;
            $ticket['close_reason'] = $request->reason;
            $ticket['satisfaction_rating'] = $request->satisfaction_rating;
            $ticket['updated_at'] = now()->toISOString();

            // Update ticket in cache
            Cache::put($cacheKey, $ticket, now()->addDays(30));

            Log::info('Support ticket closed', [
                'ticket_id' => $ticketId,
                'closed_by' => $user->id,
                'satisfaction_rating' => $request->satisfaction_rating
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ticket closed successfully',
                'closed_at' => $ticket['closed_at']
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to close ticket: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to close ticket'
            ], 500);
        }
    }

    /**
     * Get support statistics
     */
    public function getSupportStats(Request $request): JsonResponse
    {
        try {
            $user = Auth::user();
            $userTicketsKey = "user_tickets_{$user->id}";
            $ticketIds = Cache::get($userTicketsKey, []);

            $stats = [
                'total_tickets' => 0,
                'open_tickets' => 0,
                'resolved_tickets' => 0,
                'average_response_time_hours' => 0,
                'satisfaction_rating' => 0,
                'last_ticket_date' => null
            ];

            $responseTimes = [];
            $ratings = [];
            $lastTicketDate = null;

            foreach ($ticketIds as $ticketId) {
                $cacheKey = "support_ticket_{$ticketId}";
                $ticket = Cache::get($cacheKey);

                if ($ticket) {
                    $stats['total_tickets']++;

                    if ($ticket['status'] === 'open') {
                        $stats['open_tickets']++;
                    } elseif (in_array($ticket['status'], ['resolved', 'closed'])) {
                        $stats['resolved_tickets']++;
                    }

                    // Calculate response time
                    if (count($ticket['messages']) > 1) {
                        $firstMessage = $ticket['messages'][0];
                        $secondMessage = $ticket['messages'][1];
                        $responseTime = Carbon::parse($secondMessage['created_at'])
                                            ->diffInHours(Carbon::parse($firstMessage['created_at']));
                        $responseTimes[] = $responseTime;
                    }

                    // Collect satisfaction ratings
                    if ($ticket['satisfaction_rating']) {
                        $ratings[] = $ticket['satisfaction_rating'];
                    }

                    // Track latest ticket date
                    $ticketDate = Carbon::parse($ticket['created_at']);
                    if (!$lastTicketDate || $ticketDate->gt($lastTicketDate)) {
                        $lastTicketDate = $ticketDate;
                    }
                }
            }

            // Calculate averages
            if (!empty($responseTimes)) {
                $stats['average_response_time_hours'] = round(array_sum($responseTimes) / count($responseTimes), 2);
            }

            if (!empty($ratings)) {
                $stats['satisfaction_rating'] = round(array_sum($ratings) / count($ratings), 2);
            }

            $stats['last_ticket_date'] = $lastTicketDate?->toISOString();

            return response()->json([
                'success' => true,
                'stats' => $stats
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get support stats: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Failed to get support statistics'
            ], 500);
        }
    }

    /**
     * Get default FAQs
     */
    private function getDefaultFaqs(): array
    {
        return [
            [
                'id' => 1,
                'question' => 'How do I reset my password?',
                'answer' => 'You can reset your password by clicking the "Forgot Password" link on the login page and following the instructions sent to your email.',
                'category' => 'account',
                'tags' => ['password', 'reset', 'login', 'account'],
                'order' => 1,
                'view_count' => 150,
                'helpful_count' => 45,
                'not_helpful_count' => 3,
                'last_updated' => now()->subDays(5)->toISOString()
            ],
            [
                'id' => 2,
                'question' => 'How do I enable push notifications?',
                'answer' => 'Go to Settings > Notifications and toggle on the types of notifications you want to receive. Make sure your device allows notifications for this app.',
                'category' => 'notifications',
                'tags' => ['notifications', 'push', 'settings', 'mobile'],
                'order' => 2,
                'view_count' => 120,
                'helpful_count' => 38,
                'not_helpful_count' => 2,
                'last_updated' => now()->subDays(3)->toISOString()
            ],
            [
                'id' => 3,
                'question' => 'Why is the app running slowly?',
                'answer' => 'App performance can be affected by low device storage, poor internet connection, or running too many apps simultaneously. Try closing other apps and ensuring you have a stable internet connection.',
                'category' => 'technical',
                'tags' => ['performance', 'slow', 'technical', 'troubleshooting'],
                'order' => 3,
                'view_count' => 95,
                'helpful_count' => 28,
                'not_helpful_count' => 5,
                'last_updated' => now()->subDays(7)->toISOString()
            ],
            [
                'id' => 4,
                'question' => 'How do I sync my data across devices?',
                'answer' => 'Data syncing happens automatically when you\'re logged in and connected to the internet. You can manually sync by pulling down on the main screen or going to Settings > Sync.',
                'category' => 'sync',
                'tags' => ['sync', 'data', 'devices', 'cloud'],
                'order' => 4,
                'view_count' => 80,
                'helpful_count' => 25,
                'not_helpful_count' => 1,
                'last_updated' => now()->subDays(10)->toISOString()
            ],
            [
                'id' => 5,
                'question' => 'Can I use the app offline?',
                'answer' => 'Yes, many features work offline. Your data will sync automatically when you reconnect to the internet. Some features like real-time updates require an internet connection.',
                'category' => 'offline',
                'tags' => ['offline', 'internet', 'sync', 'connectivity'],
                'order' => 5,
                'view_count' => 65,
                'helpful_count' => 22,
                'not_helpful_count' => 0,
                'last_updated' => now()->subDays(12)->toISOString()
            ]
        ];
    }

    /**
     * Get FAQ categories
     */
    private function getFaqCategories(): array
    {
        return [
            ['id' => 'account', 'name' => 'Account & Login', 'icon' => 'user'],
            ['id' => 'notifications', 'name' => 'Notifications', 'icon' => 'bell'],
            ['id' => 'technical', 'name' => 'Technical Issues', 'icon' => 'settings'],
            ['id' => 'sync', 'name' => 'Data Sync', 'icon' => 'refresh'],
            ['id' => 'offline', 'name' => 'Offline Usage', 'icon' => 'wifi-off'],
            ['id' => 'billing', 'name' => 'Billing & Payments', 'icon' => 'credit-card'],
            ['id' => 'features', 'name' => 'Features & Usage', 'icon' => 'help-circle']
        ];
    }

    /**
     * Notify support team about urgent tickets
     */
    private function notifySupportTeam(array $ticketData): void
    {
        try {
            Log::info('Urgent support ticket notification', [
                'ticket_id' => $ticketData['id'],
                'priority' => $ticketData['priority'],
                'category' => $ticketData['category'],
                'subject' => $ticketData['subject']
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to notify support team: ' . $e->getMessage());
        }
    }
}
