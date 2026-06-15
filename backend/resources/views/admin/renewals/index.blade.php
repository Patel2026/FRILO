@extends('layouts.master')

@section('title') Renouvellements @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Renouvellements</h4>
        </div>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

<div class="card">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-auto">
                <label class="form-label" for="status">Statut</label>
                <select id="status" name="status" class="form-select">
                    <option value="">Tous</option>
                    @foreach($statuses as $status)
                        <option value="{{ $status }}" @selected(request('status') === $status)>{{ ucfirst($status) }}</option>
                    @endforeach
                </select>
            </div>
            <div class="col-auto">
                <button class="btn btn-primary" type="submit">Filtrer</button>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header"><h5 class="card-title mb-0">Sites à suivre</h5></div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Client</th>
                        <th>Domaine</th>
                        <th>Expiration</th>
                        <th>Statut</th>
                        <th>Relances</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($orders as $order)
                        <tr>
                            <td>{{ $order->user?->name ?? '—' }}</td>
                            <td>{{ $order->domain ?: $order->site_url }}</td>
                            <td>{{ $order->hosting_expires_at?->format('d/m/Y') }}</td>
                            <td><span class="badge badge-soft-{{ $order->hosting_renewal_status === 'paid' ? 'success' : 'warning' }}">{{ $order->hosting_renewal_status }}</span></td>
                            <td>{{ $order->hosting_renewal_reminder_count }}</td>
                            <td>
                                <form action="{{ route('admin.renewals.reminder', $order) }}" method="POST" class="d-inline">
                                    @csrf
                                    @method('PATCH')
                                    <input type="hidden" name="hosting_renewal_note" value="Relance renouvellement envoyee.">
                                    <button type="submit" class="btn btn-soft-primary btn-sm">Relancer</button>
                                </form>
                                <form action="{{ route('admin.renewals.mark-paid', $order) }}" method="POST" class="d-inline">
                                    @csrf
                                    @method('PATCH')
                                    <button type="submit" class="btn btn-soft-success btn-sm">Marquer payé</button>
                                </form>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="text-center text-muted py-4">Aucun renouvellement proche.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $orders->links() }}
    </div>
</div>
@endsection
