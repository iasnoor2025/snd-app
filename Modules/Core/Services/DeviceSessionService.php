<?php

namespace Modules\Core\Services;

use Illuminate\Http\Request;
use Modules\Core\Domain\Models\DeviceSession;
use App\Models\User;
use Jenssegers\Agent\Agent;
use Stevebauman\Location\Facades\Location;

class DeviceSessionService
{
    private Agent $agent;

    public function __construct()
    {
        $this->agent = new Agent();
    }

    public function createSession(User $user, Request $request, bool $remember = false): DeviceSession
    {
        $this->agent->setUserAgent($request->userAgent());
        $location = Location::get($request->ip());

        return DeviceSession::create([
            'user_id' => $user->id,
            'device_name' => $this->getDeviceName(),
            'device_type' => $this->agent->deviceType(),
            'browser' => $this->agent->browser(),
            'platform' => $this->agent->platform(),
            'ip_address' => $request->ip(),
            'location' => $location ? "{$location->cityName}, {$location->countryName}" : null,
            'last_active_at' => now(),
            'is_remembered' => $remember,
            'session_id' => session()->getId(),
            'metadata' => [
                'browser_version' => $this->agent->version($this->agent->browser()),
                'platform_version' => $this->agent->version($this->agent->platform()),
                'is_mobile' => $this->agent->isMobile(),
                'is_tablet' => $this->agent->isTablet(),
                'is_desktop' => $this->agent->isDesktop(),
            ],
        ]);
    }

    public function updateSession(DeviceSession $session, Request $request): void
    {
        $location = Location::get($request->ip());

        $session->update([
            'ip_address' => $request->ip(),
            'location' => $location ? "{$location->cityName}, {$location->countryName}" : null,
            'last_active_at' => now(),
        ]);
    }

    public function getCurrentSession(User $user): ?DeviceSession
    {
        return $user->deviceSessions()
            ->where('session_id', session()->getId())
            ->first();
    }

    public function getActiveSessions(User $user): array
    {
        return $user->deviceSessions()
            ->where('last_active_at', '>', now()->subMinutes(config('session.lifetime', 120)))
            ->orderBy('last_active_at', 'desc')
            ->get()
            ->map(fn($session) => $session->device_info)
            ->toArray();
    }

    public function revokeSession(DeviceSession $session): void
    {
        $session->delete();
    }

    public function revokeAllSessionsExceptCurrent(User $user): void
    {
        $user->deviceSessions()
            ->where('session_id', '!=', session()->getId())
            ->delete();
    }

    public function cleanupInactiveSessions(): int
    {
        return DeviceSession::where('last_active_at', '<', now()->subMinutes(config('session.lifetime', 120)))
            ->delete();
    }

    private function getDeviceName(): string
    {
        $browser = $this->agent->browser();
        $platform = $this->agent->platform();
        $device = $this->agent->device();

        if ($device && $device !== 'WebKit') {
            return $device;
        }

        return "{$browser} on {$platform}";
    }
} 