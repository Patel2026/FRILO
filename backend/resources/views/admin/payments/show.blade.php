@extends('layouts.master')

@section('title') Paiement #{{ $payment->id }} @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Paiement #{{ $payment->id }}</h4>
            <a href="{{ route('admin.payments.index') }}" class="btn btn-soft-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Retour
            </a>
        </div>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        {{ session('success') }}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
@endif

@if($errors->any())
    <div class="alert alert-danger" role="alert">
        <ul class="mb-0 ps-3">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<div class="row">
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Résumé transaction</h5></div>
            <div class="card-body">
                <p class="mb-2"><strong>Provider:</strong> {{ $payment->provider }}</p>
                <p class="mb-2"><strong>Transaction FedaPay:</strong> {{ $payment->fedapay_transaction_id ?? '—' }}</p>
                <p class="mb-2"><strong>Référence:</strong> {{ $payment->fedapay_reference ?? '—' }}</p>
                <p class="mb-2"><strong>Montant:</strong> {{ number_format($payment->amount, 0, ',', ' ') }} {{ $payment->currency }}</p>
                <p class="mb-2"><strong>Mode:</strong> {{ $payment->mode ?? '—' }}</p>
                <p class="mb-3"><strong>Statut:</strong> <span class="badge badge-soft-secondary">{{ $payment->status }}</span></p>
                @if($payment->checkout_url)
                    <p class="mb-3"><a href="{{ $payment->checkout_url }}" target="_blank" rel="noopener">Ouvrir checkout</a></p>
                @endif
                <form method="POST" action="{{ route('admin.payments.sync', $payment) }}">
                    @csrf
                    <button class="btn btn-soft-info w-100" type="submit">
                        <i class="ri-refresh-line me-1"></i> Synchroniser avec FedaPay
                    </button>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Commande liée</h5></div>
            <div class="card-body">
                @if($payment->order)
                    <p class="mb-2">
                        <strong>Commande:</strong>
                        <a href="{{ route('admin.orders.show', $payment->order) }}">
                            #ORD-{{ str_pad($payment->order->id, 5, '0', STR_PAD_LEFT) }}
                        </a>
                    </p>
                    <p class="mb-2"><strong>Client:</strong> {{ $payment->order->user?->name ?? '—' }} ({{ $payment->order->user?->email ?? '—' }})</p>
                    <p class="mb-2"><strong>Template:</strong> {{ $payment->order->template?->name ?? '—' }}</p>
                    <p class="mb-0"><strong>Statut commande:</strong> {{ $payment->order->status->label() }}</p>
                @else
                    <p class="text-muted mb-0">Aucune commande liée (ou commande supprimée).</p>
                @endif
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Payload brut (debug)</h5></div>
            <div class="card-body">
                <pre class="mb-0" style="white-space: pre-wrap;">{{ json_encode($payment->raw_payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?: '—' }}</pre>
            </div>
        </div>
    </div>
</div>
@endsection
