@extends('layouts.master')

@section('title') Tableau de bord @endsection

@section('content')
@php
    $frontendUrl = rtrim((string) config('app.frontend_url'), '/');
    $adminUser = auth()->user();
    $canOps = $adminUser?->hasAnyAdminRole(['ops_admin']);
    $canContent = $adminUser?->hasAnyAdminRole(['content_admin']);
    $statusBadge = static fn (string $status): string => match($status) {
        'pending' => 'warning',
        'processing' => 'info',
        'completed' => 'success',
        'cancelled' => 'danger',
        default => 'secondary',
    };
@endphp

<div class="frilo-op-header">
    <div>
        <span class="frilo-section-eyebrow">Console opérationnelle</span>
        <h1>Tableau de bord FRILO</h1>
        <p>Suivi des commandes, alertes SLA et production client. Les priorités du jour doivent être visibles en moins de dix secondes.</p>
    </div>
    <div class="d-flex flex-wrap gap-2">
        @if($canOps)
            <a href="{{ route('admin.orders.index', ['status' => 'pending']) }}" class="btn btn-frilo">
                <i class="ri-shopping-bag-3-line align-middle me-1"></i> Commandes en attente
            </a>
        @endif
        @if($frontendUrl !== '')
            <a href="{{ $frontendUrl }}" target="_blank" rel="noreferrer" class="btn btn-frilo-outline">
                <i class="ri-external-link-line align-middle me-1"></i> Site client
            </a>
        @endif
    </div>
</div>

<div class="row g-3">
    <div class="col-xl-4 col-md-6">
        <div class="card frilo-kpi-card is-critical h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between gap-3">
                    <div>
                        <div class="frilo-kpi-label">À confirmer</div>
                        <p class="frilo-kpi-value">{{ $stats['pending'] }}</p>
                        <span class="frilo-kpi-meta">Commandes en attente de prise en charge</span>
                    </div>
                    <span class="frilo-kpi-icon"><i class="ri-time-line"></i></span>
                </div>
                @if($canOps)
                    <a href="{{ route('admin.orders.index', ['status' => 'pending']) }}" class="btn btn-sm btn-soft-primary mt-3">
                        Voir les commandes
                    </a>
                @endif
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-md-6">
        <div class="card frilo-kpi-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between gap-3">
                    <div>
                        <div class="frilo-kpi-label">En production</div>
                        <p class="frilo-kpi-value">{{ $stats['processing'] }}</p>
                        <span class="frilo-kpi-meta">Sites en cours de préparation</span>
                    </div>
                    <span class="frilo-kpi-icon"><i class="ri-loader-4-line"></i></span>
                </div>
                @if($canOps)
                    <a href="{{ route('admin.orders.index', ['status' => 'processing']) }}" class="btn btn-sm btn-soft-secondary mt-3">
                        Ouvrir la file
                    </a>
                @endif
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-md-6">
        <div class="card frilo-kpi-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between gap-3">
                    <div>
                        <div class="frilo-kpi-label">Livrées</div>
                        <p class="frilo-kpi-value">{{ $stats['completed'] }}</p>
                        <span class="frilo-kpi-meta">Commandes finalisées</span>
                    </div>
                    <span class="frilo-kpi-icon"><i class="ri-checkbox-circle-line"></i></span>
                </div>
                @if($canOps)
                    <a href="{{ route('admin.orders.index', ['status' => 'completed']) }}" class="btn btn-sm btn-soft-secondary mt-3">
                        Consulter
                    </a>
                @endif
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-md-6">
        <div class="card frilo-kpi-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between gap-3">
                    <div>
                        <div class="frilo-kpi-label">Chiffre d'affaires</div>
                        <p class="frilo-kpi-value">{{ number_format($stats['revenue'], 0, ',', ' ') }}</p>
                        <span class="frilo-kpi-meta">FCFA sur commandes livrées</span>
                    </div>
                    <span class="frilo-kpi-icon"><i class="ri-money-dollar-circle-line"></i></span>
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-md-6">
        <div class="card frilo-kpi-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between gap-3">
                    <div>
                        <div class="frilo-kpi-label">Clients inscrits</div>
                        <p class="frilo-kpi-value">{{ $stats['clients'] }}</p>
                        <span class="frilo-kpi-meta">Comptes client actifs dans FRILO</span>
                    </div>
                    <span class="frilo-kpi-icon"><i class="ri-group-line"></i></span>
                </div>
                @if($canOps)
                    <a href="{{ route('admin.clients.index') }}" class="btn btn-sm btn-soft-secondary mt-3">
                        Voir les clients
                    </a>
                @endif
            </div>
        </div>
    </div>

    <div class="col-xl-4 col-md-6">
        <div class="card frilo-kpi-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between gap-3">
                    <div>
                        <div class="frilo-kpi-label">Templates actifs</div>
                        <p class="frilo-kpi-value">{{ $stats['templates'] }}</p>
                        <span class="frilo-kpi-meta">Modèles disponibles côté public</span>
                    </div>
                    <span class="frilo-kpi-icon"><i class="ri-layout-3-line"></i></span>
                </div>
                @if($canContent)
                    <a href="{{ route('admin.templates.index') }}" class="btn btn-sm btn-soft-secondary mt-3">
                        Gérer le catalogue
                    </a>
                @endif
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mt-1">
    <div class="col-xl-6">
        <div class="card frilo-sla-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between gap-3">
                    <div>
                        <span class="frilo-section-eyebrow">SLA confirmation</span>
                        <h5 class="card-title mt-2 mb-1">{{ $slaAlerts['overdue_confirmation_count'] }} commande(s) en retard</h5>
                        <p class="text-muted mb-0">Pending depuis plus de {{ $slaAlerts['confirmation_minutes'] }} minutes.</p>
                    </div>
                    @if($canOps)
                        <a href="{{ route('admin.orders.index', ['status' => 'pending']) }}" class="btn btn-sm btn-soft-primary align-self-start">
                            Traiter
                        </a>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="col-xl-6">
        <div class="card frilo-sla-card h-100">
            <div class="card-body">
                <div class="d-flex justify-content-between gap-3">
                    <div>
                        <span class="frilo-section-eyebrow">SLA livraison</span>
                        <h5 class="card-title mt-2 mb-1">{{ $slaAlerts['overdue_delivery_count'] }} commande(s) en retard</h5>
                        <p class="text-muted mb-0">Processing depuis plus de {{ $slaAlerts['delivery_hours'] }} heures.</p>
                    </div>
                    @if($canOps)
                        <a href="{{ route('admin.orders.index', ['status' => 'processing']) }}" class="btn btn-sm btn-soft-primary align-self-start">
                            Suivre
                        </a>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mt-1">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                    <span class="frilo-section-eyebrow">Priorités</span>
                    <h5 class="card-title mb-0 mt-1">Commandes en retard SLA</h5>
                </div>
                @if($canOps)
                    <a href="{{ route('admin.orders.index') }}" class="btn btn-soft-primary btn-sm">
                        Voir toutes les commandes
                    </a>
                @endif
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-nowrap align-middle mb-0 frilo-admin-table">
                        <thead class="table-light">
                            <tr>
                                <th class="frilo-table-id">Commande</th>
                                <th>Client</th>
                                <th class="frilo-table-status">Statut</th>
                                <th class="frilo-table-date">Retard</th>
                                <th class="frilo-table-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($slaOverdueOrders as $order)
                                <tr>
                                    <td class="fw-bold">#{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</td>
                                    <td>{{ $order->user->name ?? '—' }}</td>
                                    <td>
                                        <span class="badge badge-soft-{{ $statusBadge($order->status->value) }}">
                                            {{ $order->status->label() }}
                                        </span>
                                    </td>
                                    <td class="fw-bold">
                                        @if($order->status->value === 'pending')
                                            {{ max(0, now()->diffInMinutes($order->created_at) - $slaAlerts['confirmation_minutes']) }} min
                                        @elseif($order->status->value === 'processing')
                                            {{ max(0, now()->diffInHours($order->created_at) - $slaAlerts['delivery_hours']) }} h
                                        @else
                                            —
                                        @endif
                                    </td>
                                    <td class="frilo-table-actions">
                                        <a href="{{ route('admin.orders.show', $order) }}" class="btn btn-sm btn-soft-secondary" aria-label="Ouvrir la commande #{{ $order->id }}">
                                            <i class="ri-eye-line"></i>
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="frilo-empty-state">Aucune alerte SLA active.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-3 mt-1">
    <div class="col-12">
        <div class="card">
            <div class="card-header d-flex flex-wrap align-items-center justify-content-between gap-2">
                <div>
                    <span class="frilo-section-eyebrow">Activité récente</span>
                    <h5 class="card-title mb-0 mt-1">Dernières commandes</h5>
                </div>
                @if($canOps)
                    <a href="{{ route('admin.orders.index') }}" class="btn btn-soft-secondary btn-sm">
                        Voir tout
                    </a>
                @endif
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-nowrap align-middle mb-0 frilo-admin-table">
                        <thead class="table-light">
                            <tr>
                                <th class="frilo-table-id">Commande</th>
                                <th>Client</th>
                                <th class="frilo-table-money">Prix</th>
                                <th class="frilo-table-status">Statut</th>
                                <th class="frilo-table-date">Date</th>
                                <th class="frilo-table-actions">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($recentOrders as $order)
                                <tr>
                                    <td>
                                        <a href="{{ route('admin.orders.show', $order) }}" class="fw-bold">
                                            #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}
                                        </a>
                                    </td>
                                    <td>{{ $order->user->name ?? '—' }}</td>
                                    <td class="fw-bold">{{ number_format($order->price, 0, ',', ' ') }} FCFA</td>
                                    <td>
                                        <span class="badge badge-soft-{{ $statusBadge($order->status->value) }}">
                                            {{ $order->status->label() }}
                                        </span>
                                    </td>
                                    <td>{{ $order->created_at->format('d/m/Y') }}</td>
                                    <td class="frilo-table-actions">
                                        <a href="{{ route('admin.orders.show', $order) }}" class="btn btn-sm btn-soft-secondary" aria-label="Ouvrir la commande #{{ $order->id }}">
                                            <i class="ri-eye-line"></i>
                                        </a>
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="6" class="frilo-empty-state">Aucune commande pour le moment.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection
