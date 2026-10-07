<?php

namespace App\Services;

use App\Models\ContactRequest;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ContactRequestService
{
    public function paginate(?string $status, ?string $reference, bool $trashed): LengthAwarePaginator
    {
        return ContactRequest::query()
            ->when($trashed, fn ($query) => $query->onlyTrashed())
            ->when($status, fn ($query) => $query->where('status', $status))
            ->when($reference, fn ($query) => $query->where('order_reference', 'like', '%'.$reference.'%'))
            ->latest()->orderByDesc('id')->paginate(20);
    }

    public function updateStatus(ContactRequest $contactRequest, string $status): void
    {
        DB::transaction(function () use ($contactRequest, $status): void {
            $active = ContactRequest::query()->lockForUpdate()->findOrFail($contactRequest->id);
            $active->update([
                'status' => $status,
                'processed_at' => $status === ContactRequest::STATUS_DONE ? now() : null,
            ]);
        });
    }

    /** @param array<int, int|string> $ids */
    public function moveSelection(array $ids, bool $restore): int
    {
        return DB::transaction(function () use ($ids, $restore): int {
            $contacts = ContactRequest::query()
                ->when($restore, fn ($query) => $query->onlyTrashed())
                ->whereIn('id', $ids)->orderBy('id')->lockForUpdate()->get();

            if ($contacts->count() !== count($ids)) {
                throw ValidationException::withMessages([
                    'ids' => 'La sélection a changé ou contient une demande indisponible. Rechargez la liste et réessayez.',
                ]);
            }

            foreach ($contacts as $contact) {
                $restore ? $contact->restore() : $contact->delete();
            }

            return $contacts->count();
        });
    }
}
