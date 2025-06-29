<?php

namespace Modules\Core\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Gate;

class BackupController extends Controller
{
    private $backupDisk = 'backups';

    public function __construct()
    {
        $this->middleware(['auth', 'can:admin']);
    }

    /**
     * Trigger a new database backup
     */
    public function backup(Request $request): JsonResponse
    {
        $filename = 'backup_' . now()->format('Ymd_His') . '_' . Str::random(6) . '.sql';
        $path = 'db/' . $filename;

        $command = sprintf(
            'mysqldump --user=%s --password=%s --host=%s %s > %s',
            env('DB_USERNAME'),
            env('DB_PASSWORD'),
            env('DB_HOST'),
            env('DB_DATABASE'),
            storage_path('app/' . $this->backupDisk . '/' . $path)
        );

        $result = null;
        $output = null;
        @mkdir(storage_path('app/' . $this->backupDisk . '/db'), 0775, true);
        exec($command, $output, $result);

        if ($result === 0) {
            Log::info('Database backup created', ['file' => $path]);
            return response()->json(['message' => 'Backup created', 'file' => $path]);
        } else {
            Log::error('Database backup failed', ['output' => $output]);
            return response()->json(['message' => 'Backup failed', 'error' => $output], 500);
        }
    }

    /**
     * List available backups
     */
    public function list(): JsonResponse
    {
        $files = Storage::disk($this->backupDisk)->files('db');
        $backups = collect($files)->map(function ($file) {
            return [
                'name' => basename($file),
                'size' => Storage::disk($this->backupDisk)->size($file),
                'created_at' => Storage::disk($this->backupDisk)->lastModified($file),
            ];
        })->sortByDesc('created_at')->values();
        return response()->json(['backups' => $backups]);
    }

    /**
     * Download a backup file
     */
    public function download($filename): StreamedResponse
    {
        $path = 'db/' . $filename;
        if (!Storage::disk($this->backupDisk)->exists($path)) {
            abort(404);
        }
        return Storage::disk($this->backupDisk)->download($path);
    }

    /**
     * Delete a backup file
     */
    public function delete($filename): JsonResponse
    {
        $path = 'db/' . $filename;
        if (Storage::disk($this->backupDisk)->exists($path)) {
            Storage::disk($this->backupDisk)->delete($path);
            Log::info('Backup deleted', ['file' => $path]);
            return response()->json(['message' => 'Backup deleted']);
        }
        return response()->json(['message' => 'File not found'], 404);
    }

    /**
     * Restore database from uploaded backup file
     */
    public function restore(Request $request): JsonResponse
    {
        $request->validate([
            'backup' => 'required|file|mimes:sql',
        ]);
        /** @var UploadedFile $file */
        $file = $request->file('backup');
        $path = $file->storeAs('db', 'restore_' . now()->format('Ymd_His') . '_' . Str::random(6) . '.sql', $this->backupDisk);
        $command = sprintf(
            'mysql --user=%s --password=%s --host=%s %s < %s',
            env('DB_USERNAME'),
            env('DB_PASSWORD'),
            env('DB_HOST'),
            env('DB_DATABASE'),
            storage_path('app/' . $this->backupDisk . '/' . $path)
        );
        $result = null;
        $output = null;
        exec($command, $output, $result);
        if ($result === 0) {
            Log::info('Database restored from backup', ['file' => $path]);
            return response()->json(['message' => 'Database restored']);
        } else {
            Log::error('Database restore failed', ['output' => $output]);
            return response()->json(['message' => 'Restore failed', 'error' => $output], 500);
        }
    }
}
