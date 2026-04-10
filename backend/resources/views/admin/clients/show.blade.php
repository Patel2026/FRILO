@extends('layouts.master')

@section('title') Client — {{ $user->name }} @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">{{ $user->name }}</h4>
            <a href="{{ route('admin.clients.index') }}" class="btn btn-soft-secondary btn-sm">
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

<div class="row">
    <div class="col-lg-4">
        <div class="card">
            <div class="card-body text-center">
                <div class="avatar-lg mx-auto mb-3">
                    <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-1">
                        {{ strtoupper(substr($user->name, 0, 1)) }}
                    </span>
                </div>
                <h5 class="mb-1">{{ $user->name }}</h5>
                <p class="text-muted mb-0">{{ $user->email }}</p>
                <p class="mt-2 mb-0">
                    @if($user->is_active)
                        <span class="badge badge-soft-success">Compte actif</span>
                    @else
                        <span class="badge badge-soft-danger">Compte désactivé</span>
                    @endif
                </p>
                <p class="text-muted small mt-1">Inscrit le {{ $user->created_at->format('d/m/Y') }}</p>

                <form method="POST" action="{{ route('admin.clients.toggle-active', $user) }}" class="mt-3">
                    @csrf
                    @method('PATCH')
                    <input type="hidden" name="is_active" value="{{ $user->is_active ? 0 : 1 }}">
                    <button class="btn {{ $user->is_active ? 'btn-soft-danger' : 'btn-soft-success' }} btn-sm" type="submit">
                        @if($user->is_active)
                            Désactiver le compte
                        @else
                            Réactiver le compte
                        @endif
                    </button>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Commandes ({{ $user->orders->count() }})</h5></div>
            <div class="card-body">
                @forelse($user->orders as $order)
                <div class="d-flex align-items-center justify-content-between border-bottom py-2">
                    <div>
                        <a href="{{ route('admin.orders.show', $order) }}">
                            #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}
                        </a>
                        <span class="text-muted ms-2">{{ $order->template->name ?? '—' }}</span>
                        <span class="text-muted ms-1 small">{{ $order->template->sector->name ?? '' }}</span>
                    </div>
                    <div class="d-flex align-items-center gap-3">
                        <span class="fw-medium">{{ number_format($order->price, 0, ',', ' ') }} FCFA</span>
                        <span class="badge badge-soft-{{ match($order->status->value) {
                            'pending' => 'warning',
                            'processing' => 'info',
                            'completed' => 'success',
                            'cancelled' => 'danger',
                            default => 'secondary'
                        } }}">{{ $order->status->label() }}</span>
                    </div>
                </div>
                @empty
                <p class="text-muted fst-italic mb-0">Aucune commande.</p>
                @endforelse
            </div>
        </div>
    </div>
</div>
@endsection
