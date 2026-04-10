@extends('layouts.master')

@section('title') Tableau de bord @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Tableau de bord</h4>
        </div>
    </div>
</div>

{{-- KPI Cards --}}
<div class="row">
    <div class="col-xl-3 col-md-6">
        <div class="card card-animate">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1 overflow-hidden">
                        <p class="text-uppercase fw-medium text-muted text-truncate mb-0">En attente</p>
                    </div>
                    <div class="flex-shrink-0">
                        <span class="badge bg-warning-subtle text-warning">Pending</span>
                    </div>
                </div>
                <div class="d-flex align-items-end justify-content-between mt-4">
                    <div>
                        <h4 class="fs-22 fw-semibold ff-secondary mb-4">{{ $stats['pending'] }}</h4>
                        <a href="{{ route('admin.orders.index', ['status' => 'pending']) }}" class="text-decoration-underline">Voir les commandes</a>
                    </div>
                    <div class="avatar-sm flex-shrink-0">
                        <span class="avatar-title bg-warning-subtle rounded fs-3">
                            <i class="ri-time-line text-warning"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6">
        <div class="card card-animate">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1 overflow-hidden">
                        <p class="text-uppercase fw-medium text-muted text-truncate mb-0">En production</p>
                    </div>
                </div>
                <div class="d-flex align-items-end justify-content-between mt-4">
                    <div>
                        <h4 class="fs-22 fw-semibold ff-secondary mb-4">{{ $stats['processing'] }}</h4>
                        <a href="{{ route('admin.orders.index', ['status' => 'processing']) }}" class="text-decoration-underline">Voir les commandes</a>
                    </div>
                    <div class="avatar-sm flex-shrink-0">
                        <span class="avatar-title bg-info-subtle rounded fs-3">
                            <i class="ri-loader-4-line text-info"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6">
        <div class="card card-animate">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1 overflow-hidden">
                        <p class="text-uppercase fw-medium text-muted text-truncate mb-0">Livrées</p>
                    </div>
                </div>
                <div class="d-flex align-items-end justify-content-between mt-4">
                    <div>
                        <h4 class="fs-22 fw-semibold ff-secondary mb-4">{{ $stats['completed'] }}</h4>
                        <a href="{{ route('admin.orders.index', ['status' => 'completed']) }}" class="text-decoration-underline">Voir les commandes</a>
                    </div>
                    <div class="avatar-sm flex-shrink-0">
                        <span class="avatar-title bg-success-subtle rounded fs-3">
                            <i class="ri-checkbox-circle-line text-success"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-3 col-md-6">
        <div class="card card-animate">
            <div class="card-body">
                <div class="d-flex align-items-center">
                    <div class="flex-grow-1 overflow-hidden">
                        <p class="text-uppercase fw-medium text-muted text-truncate mb-0">Chiffre d'affaires</p>
                    </div>
                </div>
                <div class="d-flex align-items-end justify-content-between mt-4">
                    <div>
                        <h4 class="fs-22 fw-semibold ff-secondary mb-4">{{ number_format($stats['revenue'], 0, ',', ' ') }} FCFA</h4>
                        <span class="text-muted">Commandes livrées</span>
                    </div>
                    <div class="avatar-sm flex-shrink-0">
                        <span class="avatar-title bg-primary-subtle rounded fs-3">
                            <i class="ri-money-franc-circle-line text-primary"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Ligne 2 : clients + templates --}}
<div class="row">
    <div class="col-xl-3 col-md-6">
        <div class="card card-animate">
            <div class="card-body">
                <div class="d-flex align-items-end justify-content-between mt-2">
                    <div>
                        <p class="text-uppercase fw-medium text-muted mb-0">Clients inscrits</p>
                        <h4 class="fs-22 fw-semibold ff-secondary mt-2 mb-0">{{ $stats['clients'] }}</h4>
                    </div>
                    <div class="avatar-sm flex-shrink-0">
                        <span class="avatar-title bg-primary-subtle rounded fs-3">
                            <i class="ri-group-line text-primary"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="card card-animate">
            <div class="card-body">
                <div class="d-flex align-items-end justify-content-between mt-2">
                    <div>
                        <p class="text-uppercase fw-medium text-muted mb-0">Templates actifs</p>
                        <h4 class="fs-22 fw-semibold ff-secondary mt-2 mb-0">{{ $stats['templates'] }}</h4>
                    </div>
                    <div class="avatar-sm flex-shrink-0">
                        <span class="avatar-title bg-primary-subtle rounded fs-3">
                            <i class="ri-layout-3-line text-primary"></i>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Alertes SLA --}}
<div class="row">
    <div class="col-xl-3 col-md-6">
        <div class="card card-animate">
            <div class="card-body">
                <p class="text-uppercase fw-medium text-muted mb-1">SLA confirmation</p>
                <h4 class="fs-22 fw-semibold mb-1">{{ $slaAlerts['overdue_confirmation_count'] }}</h4>
                <p class="text-muted mb-0">Commandes pending en retard (> {{ $slaAlerts['confirmation_minutes'] }} min)</p>
            </div>
        </div>
    </div>
    <div class="col-xl-3 col-md-6">
        <div class="card card-animate">
            <div class="card-body">
                <p class="text-uppercase fw-medium text-muted mb-1">SLA livraison</p>
                <h4 class="fs-22 fw-semibold mb-1">{{ $slaAlerts['overdue_delivery_count'] }}</h4>
                <p class="text-muted mb-0">Commandes processing en retard (> {{ $slaAlerts['delivery_hours'] }} h)</p>
            </div>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex align-items-center">
                <h5 class="card-title flex-grow-1 mb-0">Alertes SLA — commandes en retard</h5>
                <a href="{{ route('admin.orders.index') }}" class="btn btn-soft-primary btn-sm">Voir commandes</a>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-nowrap align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>#</th>
                                <th>Client</th>
                                <th>Template</th>
                                <th>Statut</th>
                                <th>Créée le</th>
                                <th>Retard</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($slaOverdueOrders as $order)
                                <tr>
                                    <td>#{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</td>
                                    <td>{{ $order->user->name ?? '—' }}</td>
                                    <td>{{ $order->template->name ?? '—' }}</td>
                                    <td><span class="badge {{ $order->status->badgeClass() }}">{{ $order->status->label() }}</span></td>
                                    <td>{{ $order->created_at->format('d/m/Y H:i') }}</td>
                                    <td>
                                        @if($order->status->value === 'pending')
                                            {{ max(0, now()->diffInMinutes($order->created_at) - $slaAlerts['confirmation_minutes']) }} min
                                        @elseif($order->status->value === 'processing')
                                            {{ max(0, now()->diffInHours($order->created_at) - $slaAlerts['delivery_hours']) }} h
                                        @else
                                            —
                                        @endif
                                    </td>
                                    <td>
                                        <a href="{{ route('admin.orders.show', $order) }}" class="btn btn-sm btn-soft-secondary">
                                            <i class="ri-eye-line"></i>
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="7" class="text-center text-muted py-4">Aucune alerte SLA active.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

{{-- Dernières commandes --}}
<div class="row">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex align-items-center">
                <h5 class="card-title flex-grow-1 mb-0">Dernières commandes</h5>
                <a href="{{ route('admin.orders.index') }}" class="btn btn-soft-primary btn-sm">Voir tout</a>
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
                            @forelse($recentOrders as $order)
                            <tr>
                                <td><a href="{{ route('admin.orders.show', $order) }}">#{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</a></td>
                                <td>{{ $order->user->name ?? '—' }}</td>
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
                                <td>{{ $order->created_at->format('d/m/Y') }}</td>
                                <td>
                                    <a href="{{ route('admin.orders.show', $order) }}" class="btn btn-sm btn-soft-secondary">
                                        <i class="ri-eye-line"></i>
                                    </a>
                                </td>
                            </tr>
                            @empty
                            <tr><td colspan="8" class="text-center text-muted py-4">Aucune commande pour le moment.</td></tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
