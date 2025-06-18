@props(['permission', 'fallback' => ''])

@if (auth()->check() && auth()->user()->hasPermissionTo($permission))
    {{ $slot }}
@else
    {{ $fallback }}
@endif 