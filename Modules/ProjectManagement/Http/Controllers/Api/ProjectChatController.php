<?php

namespace Modules\ProjectManagement\Http\Controllers\Api;

use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Modules\ProjectManagement\Domain\Models\Project;
use Modules\ProjectManagement\Domain\Models\ProjectChat;
use Illuminate\Support\Facades\Auth;

class ProjectChatController extends Controller
{
    public function index(Project $project)
    {
        return response()->json($project->chats()->with('user')->orderBy('created_at')->get());
    }

    public function store(Request $request, Project $project)
    {
        $data = $request->validate([
            'message' => 'required|string',
        ]);
        $chat = $project->chats()->create([
            'user_id' => Auth::id(),
            'message' => $data['message'],
        ]);
        return response()->json($chat->load('user'), 201);
    }
}
