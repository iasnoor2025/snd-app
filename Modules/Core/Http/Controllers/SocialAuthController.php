<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Modules\Core\Domain\Models\User;
use Illuminate\Routing\Controller;

class SocialAuthController extends Controller
{
    /**
     * Redirect the user to the social provider authentication page.
     */
    public function redirectToProvider(string $provider): RedirectResponse
    {
        return Socialite::driver($provider)->redirect();
    }

    /**
     * Obtain the user information from provider and log them in or register.
     */
    public function handleProviderCallback(string $provider)
    {
        $socialUser = Socialite::driver($provider)->stateless()->user();

        $user = User::where('email', $socialUser->getEmail())->first();

        if (!$user) {
            // Try to find by provider_id
            $user = User::where('provider', $provider)
                ->where('provider_id', $socialUser->getId())
                ->first();
        }

        if (!$user) {
            // Register new user
            $user = User::create([
                'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                'email' => $socialUser->getEmail(),
                'password' => Hash::make(Str::random(16)),
                'is_active' => true,
                'provider' => $provider,
                'provider_id' => $socialUser->getId(),
            ]);
        } else {
            // Update provider info if missing
            if (!$user->provider || !$user->provider_id) {
                $user->provider = $provider;
                $user->provider_id = $socialUser->getId();
                $user->save();
            }
        }

        Auth::login($user, true);

        return redirect()->intended('/dashboard');
    }
}
