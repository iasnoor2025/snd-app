<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Routing\Controller;
use Illuminate\Http\Request;
use Modules\ProjectManagement\Domain\Models\ProjectDocument;

class FilesWidgetController extends Controller
{
    /**
     * Get recent files for dashboard widget.
     */
    public function recent(Request $request)
    {
        $files = ProjectDocument::orderByDesc('created_at')
            ->limit(10)
            ->get(['id', 'name', 'project_id', 'category', 'created_at']);

        return response()->json([
            'data' => $files,
            'count' => $files->count(),
        ]);
    }
}
