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
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>#</th>
                        <th>Client</th>
                        <th>Template</th>
                        <th>Secteur</th>
                        <th>Prix</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th></th>
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
                        <td>{{ $order->template->name ?? '—' }}</td>
                        <td>{{ $order->template->sector->name ?? '—' }}</td>
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
                        <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                        <td>
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
