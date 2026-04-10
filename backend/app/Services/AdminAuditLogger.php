<?php

namespace App\Services;

use App\Models\AdminAuditLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class AdminAuditLogger
{
    public function record(
        string $event,
        array $payload = [],
        ?User $actor = null,
        ?string $message = null,
        ?string $targetType = null,
        ?string $targetId = null,
        ?Request $request = null
    ): void {
        try {
            AdminAuditLog::create([
                'actor_id' => $actor?->id,
                'event' => $event,
                'target_type' => $targetType,
                'target_id' => $targetId,
                'message' => $message,
                'payload' => $payload,
                'ip_address' => $request?->ip(),
                'user_agent' => $request?->userAgent(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('admin.audit.persist_failed', [
                'event' => $event,
                'error' => $exception->getMessage(),
            ]);
        }
    }
}
