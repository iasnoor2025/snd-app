@props(['role', 'fallback' => ''])

@if (auth()->check() && auth()->user()->hasRole($role))
    {{ $slot }}
@else
    {{ $fallback }}
@endif 