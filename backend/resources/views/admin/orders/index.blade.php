@extends('layouts.master')

@section('title') Commandes @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Commandes</h4>
        </div>
    </div>
</div>

{{-- Filtres --}}
<div class="card">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-auto">
                <label class="form-label">Statut</label>
                <select name="status" class="form-select">
                    <option value="">Tous</option>
                    @foreach($statuses as $s)
                        <option value="{{ $s->value }}" {{ request('status') === $s->value ? 'selected' : '' }}>
                            {{ $s->label() }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-auto">
                <label class="form-label">Paiement</label>
                <select name="payment_status" class="form-select">
                    <option value="">Tous</option>
                    @foreach($paymentStatuses as $paymentStatus)
                        <option value="{{ $paymentStatus->value }}" {{ request('payment_status') === $paymentStatus->value ? 'selected' : '' }}>
                            {{ $paymentStatus->label() }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-auto">
                <button type="submit" class="btn btn-primary">Filtrer</button>
                <a href="{{ route('admin.orders.index') }}" class="btn btn-soft-secondary ms-1">Réinitialiser</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $orders->total() }} commande(s)</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0 frilo-admin-table">
                <thead class="table-light">
                    <tr>
                        <th class="frilo-table-id">Commande</th>
                        <th>Client</th>
                        <th class="frilo-table-secondary">Offre</th>
                        <th class="frilo-table-money">Prix</th>
                        <th class="frilo-table-status">Statut</th>
                        <th class="frilo-table-status frilo-table-secondary">Paiement</th>
                        <th class="frilo-table-date frilo-table-tertiary">Date</th>
                        <th class="frilo-table-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($orders as $order)
                    <tr>
                        <td><strong>#{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</strong></td>
                        <td>
                            <div>{{ $order->user->name ?? '—' }}</div>
                            <small class="text-muted">{{ $order->user->email ?? '' }}</small>
                        </td>
                        <td class="frilo-table-secondary">{{ $order->template->name ?? '—' }}</td>
                        <td>{{ number_format($order->price, 0, ',', ' ') }} FCFA</td>
                        <td>
                            <span class="badge badge-soft-{{ match($order->status->value) {
                                'pending' => 'warning',
                                'processing' => 'info',
                                'completed' => 'success',
                                'cancelled' => 'danger',
                                default => 'secondary'
                            } }}">
                                {{ $order->status->label() }}
                            </span>
                        </td>
                        <td class="frilo-table-secondary">
                            <span class="badge {{ $order->payment_status->badgeClass() }}">
                                {{ $order->payment_status->label() }}
                            </span>
                        </td>
                        <td class="frilo-table-tertiary">{{ $order->created_at->format('d/m/Y H:i') }}</td>
                        <td class="frilo-table-actions">
                            <a href="{{ route('admin.orders.show', $order) }}" class="btn btn-sm btn-soft-primary">
                                <i class="ri-eye-line align-middle"></i> Voir
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="8" class="text-center text-muted py-4">Aucune commande.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $orders->withQueryString()->links() }}</div>
    </div>
</div>
@endsection
