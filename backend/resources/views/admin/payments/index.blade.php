@extends('layouts.master')

@section('title') Paiements @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Paiements</h4>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-body">
        <form method="GET" class="row g-3 align-items-end">
            <div class="col-auto">
                <label class="form-label">Statut transaction</label>
                <select name="status" class="form-select">
                    <option value="">Tous</option>
                    @foreach($statuses as $status)
                        <option value="{{ $status }}" {{ request('status') === $status ? 'selected' : '' }}>
                            {{ $status }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-auto">
                <label class="form-label">Mode</label>
                <select name="mode" class="form-select">
                    <option value="">Tous</option>
                    @foreach($modes as $mode)
                        <option value="{{ $mode }}" {{ request('mode') === $mode ? 'selected' : '' }}>
                            {{ $mode }}
                        </option>
                    @endforeach
                </select>
            </div>
            <div class="col-auto">
                <label class="form-label">Provider</label>
                <input type="text" name="provider" value="{{ request('provider') }}" class="form-control" placeholder="fedapay">
            </div>
            <div class="col-auto">
                <label class="form-label">Réf. commande</label>
                <input type="text" name="order_reference" value="{{ request('order_reference') }}" class="form-control" placeholder="#ORD-00042">
            </div>
            <div class="col-auto">
                <button type="submit" class="btn btn-primary">Filtrer</button>
                <a href="{{ route('admin.payments.index') }}" class="btn btn-soft-secondary ms-1">Réinitialiser</a>
            </div>
        </form>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $payments->total() }} transaction(s)</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>#</th>
                        <th>Commande</th>
                        <th>Client</th>
                        <th>Montant</th>
                        <th>Mode</th>
                        <th>Statut</th>
                        <th>Référence</th>
                        <th>Date</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($payments as $payment)
                        <tr>
                            <td><strong>#{{ $payment->id }}</strong></td>
                            <td>
                                @if($payment->order)
                                    <a href="{{ route('admin.orders.show', $payment->order) }}">
                                        #ORD-{{ str_pad($payment->order_id, 5, '0', STR_PAD_LEFT) }}
                                    </a>
                                @else
                                    <span class="text-muted">Commande supprimée</span>
                                @endif
                            </td>
                            <td>
                                {{ $payment->order?->user?->name ?? '—' }}
                                <small class="d-block text-muted">{{ $payment->order?->user?->email ?? '' }}</small>
                            </td>
                            <td>{{ number_format($payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</td>
                            <td>{{ $payment->mode ?? '—' }}</td>
                            <td><span class="badge badge-soft-secondary">{{ $payment->status }}</span></td>
                            <td>{{ $payment->fedapay_reference ?? '—' }}</td>
                            <td>{{ $payment->created_at?->format('d/m/Y H:i') }}</td>
                            <td>
                                <a href="{{ route('admin.payments.show', $payment) }}" class="btn btn-sm btn-soft-primary">
                                    <i class="ri-eye-line align-middle"></i> Voir
                                </a>
                            </td>
                        </tr>
                    @empty
                        <tr>
                            <td colspan="9" class="text-center text-muted py-4">Aucune transaction paiement.</td>
                        </tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $payments->links() }}</div>
    </div>
</div>
@endsection
