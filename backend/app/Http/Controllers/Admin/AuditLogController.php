<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminAuditLog;
use Illuminate\Http\Request;
use Illuminate\View\View;

class AuditLogController extends Controller
{
    public function index(Request $request): View
    {
        $query = AdminAuditLog::query()
            ->with('actor')
            ->latest('id');

        if ($request->filled('event')) {
            $query->where('event', (string) $request->string('event'));
        }

        if ($request->filled('actor')) {
            $actorQuery = (string) $request->string('actor');
            $query->whereHas('actor', function ($subQuery) use ($actorQuery): void {
                $subQuery
                    ->where('name', 'like', '%'.$actorQuery.'%')
                    ->orWhere('email', 'like', '%'.$actorQuery.'%');
            });
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', (string) $request->string('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', (string) $request->string('to'));
        }

        $auditLogs = $query->paginate(30)->withQueryString();

        $events = AdminAuditLog::query()
            ->select('event')
            ->distinct()
            ->orderBy('event')
            ->pluck('event');

        return view('admin.audit-logs.index', [
            'auditLogs' => $auditLogs,
            'events' => $events,
        ]);
    }
}
