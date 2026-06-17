@extends('layouts.master')

@section('title') Clients @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box">
            <h4 class="mb-0">Clients</h4>
        </div>
    </div>
</div>

<div class="card">
    <div class="card-header">
        <h5 class="card-title mb-0">{{ $clients->total() }} client(s) inscrit(s)</h5>
    </div>
    <div class="card-body">
        <div class="table-responsive">
            <table class="table align-middle mb-0 frilo-admin-table">
                <thead class="table-light">
                    <tr>
                        <th>Nom</th>
                        <th class="frilo-table-secondary">Email</th>
                        <th class="frilo-table-status">Statut</th>
                        <th class="frilo-table-date frilo-table-tertiary">Inscription</th>
                        <th>Commandes</th>
                        <th class="frilo-table-actions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @forelse($clients as $client)
                    <tr>
                        <td>{{ $client->name }}</td>
                        <td class="frilo-table-secondary">{{ $client->email }}</td>
                        <td>
                            @if($client->is_active)
                                <span class="badge badge-soft-success">Actif</span>
                            @else
                                <span class="badge badge-soft-danger">Désactivé</span>
                            @endif
                        </td>
                        <td class="frilo-table-date frilo-table-tertiary">{{ $client->created_at->format('d/m/Y') }}</td>
                        <td>
                            <span class="badge bg-primary-subtle text-primary">{{ $client->orders_count }}</span>
                        </td>
                        <td class="frilo-table-actions">
                            <a href="{{ route('admin.clients.show', $client) }}" class="btn btn-sm btn-soft-primary">
                                <i class="ri-eye-line"></i> Voir
                            </a>
                        </td>
                    </tr>
                    @empty
                    <tr><td colspan="6" class="text-center text-muted py-4">Aucun client inscrit.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        <div class="mt-3">{{ $clients->links() }}</div>
    </div>
</div>
@endsection
