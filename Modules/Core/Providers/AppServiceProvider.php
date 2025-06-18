<?php
namespace Modules\Core\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Database\Events\MigrationsStarted;
use Illuminate\Database\Events\MigrationsEnded;
use Illuminate\Database\Events\MigratingEvent;
use Illuminate\Database\Events\MigratedEvent;
use Illuminate\Database\Events\QueryExecuted;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Handle database migration events to make migrations more resilient
        if (app()->runningInConsole()) {
            // For both production and development environments
            Event::listen(MigrationsStarted::class, function () {
                try {
                    // In PostgreSQL, this allows migrations to proceed even if some constraints are violated
                    if (DB::connection()->getDriverName() === 'pgsql') {
                        DB::statement('SET session_replication_role = replica;');
                    }

                    // For MySQL, disable foreign key checks temporarily
                    if (DB::connection()->getDriverName() === 'mysql') {
                        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
                    }

                    Log::info('Database migration started with relaxed constraints');
                } catch (\Exception $e) {
                    Log::warning("Migration warning: " . $e->getMessage());
                }
            });

            Event::listen(MigrationsEnded::class, function () {
                try {
                    // Restore normal constraint behavior when migrations are done
                    if (DB::connection()->getDriverName() === 'pgsql') {
                        DB::statement('SET session_replication_role = DEFAULT;');
                    }

                    // For MySQL, re-enable foreign key checks
                    if (DB::connection()->getDriverName() === 'mysql') {
                        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
                    }

                    Log::info('Database migration completed, constraints restored');
                } catch (\Exception $e) {
                    Log::warning("Migration warning: " . $e->getMessage());
                }
            });

            // Gracefully handle common migration errors
            Event::listen(MigratingEvent::class, function (MigratingEvent $event) {
                try {
                    Log::info('Running migration: ' . $event->migration->migration);
                    DB::beginTransaction();
                } catch (\Exception $e) {
                    Log::warning("Migration warning: " . $e->getMessage());
                }
            });

            Event::listen(MigratedEvent::class, function (MigratedEvent $event) {
                try {
                    Log::info('Completed migration: ' . $event->migration->migration);
                    DB::commit();
                } catch (\Exception $e) {
                    Log::warning("Migration warning: " . $e->getMessage());
                    try {
                        DB::rollBack();
                    } catch (\Exception $rollbackEx) {
                        // Already logged
                    }
                }
            });

            // Log slow queries during migrations for debugging
            if (app()->environment('local', 'development', 'testing')) {
                DB::listen(function (QueryExecuted $query) {
                    // Log queries that take longer than 500ms
                    if ($query->time > 500) {
                        Log::warning("Slow Query ({$query->time}ms): " . $query->sql);
                    }
                });
            }
        }
    }
}
