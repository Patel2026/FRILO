<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\StoreClientContactRequest;
use App\Http\Requests\Api\UpdateClientContactRequest;
use App\Models\ClientContact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ClientContact::class);

        $contacts = ClientContact::where('user_id', $request->user()->id)
            ->orderBy('name')
            ->paginate(20);

        return response()->json([
            'data' => $contacts->getCollection()
                ->map(fn (ClientContact $c) => $this->transform($c))
                ->values(),
            'meta' => [
                'current_page' => $contacts->currentPage(),
                'last_page'    => $contacts->lastPage(),
                'per_page'     => $contacts->perPage(),
                'total'        => $contacts->total(),
            ],
        ]);
    }

    public function store(StoreClientContactRequest $request): JsonResponse
    {
        $contact = ClientContact::create([
            ...$request->validated(),
            'user_id' => $request->user()->id,
        ]);

        return response()->json($this->transform($contact), 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $contact = ClientContact::findOrFail($id);
        $this->authorize('view', $contact);

        return response()->json($this->transform($contact));
    }

    public function update(UpdateClientContactRequest $request, int $id): JsonResponse
    {
        $contact = ClientContact::findOrFail($id);
        $this->authorize('update', $contact);

        $contact->update($request->validated());

        return response()->json($this->transform($contact->fresh()));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $contact = ClientContact::findOrFail($id);
        $this->authorize('delete', $contact);

        $contact->delete();

        return response()->json(null, 204);
    }

    private function transform(ClientContact $contact): array
    {
        return [
            'id'          => $contact->id,
            'name'        => $contact->name,
            'company'     => $contact->company,
            'phone'       => $contact->phone,
            'whatsapp'    => $contact->whatsapp,
            'email'       => $contact->email,
            'notes'       => $contact->notes,
            'acquired_at' => $contact->acquired_at?->toDateString(),
        ];
    }
}
