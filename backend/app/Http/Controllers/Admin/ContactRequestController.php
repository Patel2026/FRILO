<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ContactRequestController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactRequest::query()->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('reference')) {
            $query->where('order_reference', 'like', '%'.$request->string('reference')->trim().'%');
        }

        $contactRequests = $query->paginate(20);

        return view('admin.contact-requests.index', [
            'contactRequests' => $contactRequests,
            'statuses' => ContactRequest::STATUSES,
        ]);
    }

    public function updateStatus(Request $request, ContactRequest $contactRequest)
    {
        $request->validate([
            'status' => ['required', 'string', Rule::in(ContactRequest::STATUSES)],
        ]);

        $status = $request->string('status')->toString();

        $contactRequest->update([
            'status' => $status,
            'processed_at' => $status === ContactRequest::STATUS_DONE ? now() : null,
        ]);

        return redirect()
            ->route('admin.contact-requests.index')
            ->with('success', 'Statut de la demande de contact mis à jour.');
    }
}
