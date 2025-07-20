<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ __('Core::offline.offline') }} - {{ config('app.name', 'SND Rental') }}</title>

    <!-- Favicon -->
    <link rel="icon" type="image/x-icon" href="/favicon.ico">

    <!-- PWA Meta Tags -->
    <meta name="theme-color" content="#4A90E2">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="SND Rental">

    <!-- Styles -->
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #333;
            line-height: 1.6;
        }

        .offline-container {
            background: white;
            border-radius: 20px;
            padding: 3rem 2rem;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            max-width: 500px;
            width: 90%;
            margin: 1rem;
        }

        .offline-icon {
            font-size: 4rem;
            margin-bottom: 1.5rem;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
        }

        .offline-title {
            font-size: 2.5rem;
            font-weight: 700;
            color: #2d3748;
            margin-bottom: 1rem;
        }

        .offline-subtitle {
            font-size: 1.1rem;
            color: #718096;
            margin-bottom: 2rem;
            line-height: 1.8;
        }

        .offline-actions {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-top: 2rem;
        }

        .btn {
            padding: 1rem 2rem;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        }

        .btn-primary {
            background: linear-gradient(135deg, #4A90E2, #357ABD);
            color: white;
        }

        .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(74, 144, 226, 0.3);
        }

        .btn-secondary {
            background: #f7fafc;
            color: #4a5568;
            border: 2px solid #e2e8f0;
        }

        .btn-secondary:hover {
            background: #edf2f7;
            transform: translateY(-1px);
        }

        .connection-status {
            margin-top: 2rem;
            padding: 1rem;
            border-radius: 12px;
            font-size: 0.9rem;
            font-weight: 500;
        }

        .status-offline {
            background: #fed7d7;
            color: #c53030;
            border: 1px solid #feb2b2;
        }

        .status-online {
            background: #c6f6d5;
            color: #2f855a;
            border: 1px solid #9ae6b4;
        }

        .features-list {
            text-align: left;
            margin: 2rem 0;
            padding: 1.5rem;
            background: #f8fafc;
            border-radius: 12px;
        }

        .features-list h3 {
            color: #2d3748;
            margin-bottom: 1rem;
            font-size: 1.1rem;
        }

        .features-list ul {
            list-style: none;
            padding: 0;
        }

        .features-list li {
            padding: 0.5rem 0;
            color: #4a5568;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .features-list li::before {
            content: "✓";
            color: #48bb78;
            font-weight: bold;
        }

        @media (max-width: 640px) {
            .offline-container {
                padding: 2rem 1.5rem;
            }

            .offline-title {
                font-size: 2rem;
            }

            .offline-actions {
                gap: 0.75rem;
            }
        }

        .loading-spinner {
            display: none;
            width: 20px;
            height: 20px;
            border: 2px solid #ffffff;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }

        .btn.loading .loading-spinner {
            display: inline-block;
        }

        .btn.loading .btn-text {
            display: none;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📱</div>

        <h1 class="offline-title">{{ __('Core::offline.you_are_offline') }}</h1>

        <p class="offline-subtitle">
            {{ __('Core::offline.not_connected_message') }}
        </p>

        <div class="connection-status status-offline" id="connectionStatus">
            {{ __('Core::offline.no_internet_connection') }}
        </div>

        <div class="features-list">
            <h3>{{ __('Core::offline.available_offline_features') }}</h3>
            <ul>
                <li>{{ __('Core::offline.view_cached_dashboard_data') }}</li>
                <li>{{ __('Core::offline.browse_previously_loaded_equipment') }}</li>
                <li>{{ __('Core::offline.access_saved_rental_information') }}</li>
                <li>{{ __('Core::offline.view_customer_details') }}</li>
                <li>{{ __('Core::offline.create_offline_actions') }}</li>
            </ul>
        </div>

        <div class="offline-actions">
            <button class="btn btn-primary" onclick="retryConnection()" id="retryBtn">
                <div class="loading-spinner"></div>
                <span class="btn-text">{{ __('Core::offline.try_again') }}</span>
            </button>

            <a href="/dashboard" class="btn btn-secondary">
                {{ __('Core::offline.go_to_dashboard') }}
            </a>

            <button class="btn btn-secondary" onclick="goBack()">
                {{ __('Core::offline.go_back') }}
            </button>
        </div>
    </div>

    <script>
        // Check connection status
        function updateConnectionStatus() {
            const statusElement = document.getElementById('connectionStatus');

            if (navigator.onLine) {
                statusElement.className = 'connection-status status-online';
                statusElement.innerHTML = '🟢 {{ __('Core::offline.connected_to_internet') }}';
            } else {
                statusElement.className = 'connection-status status-offline';
                statusElement.innerHTML = '🔴 {{ __('Core::offline.no_internet_connection') }}';
            }
        }

        // Retry connection
        function retryConnection() {
            const retryBtn = document.getElementById('retryBtn');
            retryBtn.classList.add('loading');

            // Simulate checking connection
            setTimeout(() => {
                if (navigator.onLine) {
                    window.location.reload();
                } else {
                    retryBtn.classList.remove('loading');
                    // Show a brief message
                    const originalText = retryBtn.querySelector('.btn-text').textContent;
                    retryBtn.querySelector('.btn-text').textContent = '{{ __('Core::offline.still_offline') }}';
                    setTimeout(() => {
                        retryBtn.querySelector('.btn-text').textContent = originalText;
                    }, 2000);
                }
            }, 1500);
        }

        // Go back function
        function goBack() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/dashboard';
            }
        }

        // Listen for connection changes
        window.addEventListener('online', () => {
            updateConnectionStatus();
            // Auto-reload after a short delay when connection is restored
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        });

        window.addEventListener('offline', updateConnectionStatus);

        // Initial status check
        updateConnectionStatus();

        // Periodic connection check
        setInterval(() => {
            // Try to fetch a small resource to verify actual connectivity
            fetch('/favicon.ico', {
                method: 'HEAD',
                cache: 'no-cache'
            })
            .then(() => {
                if (!navigator.onLine) {
                    // Connection restored but navigator.onLine hasn't updated yet
                    window.location.reload();
                }
            })
            .catch(() => {
                // Still offline, update status
                updateConnectionStatus();
            });
        }, 10000); // Check every 10 seconds

        // Register service worker if not already registered
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('SW registered:', registration);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        }
    </script>
</body>
</html>
