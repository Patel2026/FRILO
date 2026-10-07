<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\BulkContactRequest;
use App\Http\Requests\Admin\UpdateContactRequestStatusRequest;
use App\Models\ContactRequest;
use App\Services\ContactRequestService;
use Illuminate\Contracts\View\View;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class ContactRequestController extends Controller
{
    public function __construct(private readonly ContactRequestService $service) {}

    public function index(Request $request): View
    {
        $this->authorize('viewAny', ContactRequest::class);

        return view('admin.contact-requests.index', [
            'contactRequests' => $this->service->paginate(
                $request->string('status')->toString(),
                $request->string('reference')->trim()->toString(),
                $request->boolean('trashed'),
            ),
            'statuses' => ContactRequest::STATUSES,
            'trashed' => $request->boolean('trashed'),
        ]);
    }

    public function updateStatus(UpdateContactRequestStatusRequest $request, ContactRequest $contactRequest): RedirectResponse
    {
        $this->authorize('update', $contactRequest);
        $this->service->updateStatus($contactRequest, $request->validated('status'));

        return back()->with('success', 'Statut de la demande de contact mis à jour.');
    }

    public function bulkDestroy(BulkContactRequest $request): RedirectResponse
    {
        $this->authorize('deleteAny', ContactRequest::class);
        $count = $this->service->moveSelection($request->validated('ids'), false);

        return back()->with('success', $count.' demande(s) déplacée(s) dans la corbeille.');
    }

    public function bulkRestore(BulkContactRequest $request): RedirectResponse
    {
        $this->authorize('restoreAny', ContactRequest::class);
        $count = $this->service->moveSelection($request->validated('ids'), true);

        return back()->with('success', $count.' demande(s) restaurée(s).');
    }
}
