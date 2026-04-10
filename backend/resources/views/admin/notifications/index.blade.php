@extends('layouts.master')

@section('title') Notifications admin @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Notifications (admin)</h4>
            <form method="POST" action="{{ route('admin.notifications.read-all') }}">
                @csrf
                <button class="btn btn-soft-secondary btn-sm" type="submit">
                    <i class="ri-check-double-line me-1"></i> Tout marquer lu
                </button>
            </form>
        </div>
    </div>
</div>

@if(session('success'))
    <div class="alert alert-success">{{ session('success') }}</div>
@endif

@if($errors->any())
    <div class="alert alert-danger">
        <ul class="mb-0 ps-3">
            @foreach($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

<div class="row g-3 mb-3">
    <div class="col-md-4">
        <div class="card">
            <div class="card-body">
                <p class="text-muted text-uppercase fs-12 fw-semibold mb-1">Total notifications</p>
                <h3 class="mb-0">{{ number_format($stats['total'], 0, ',', ' ') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card">
            <div class="card-body">
                <p class="text-muted text-uppercase fs-12 fw-semibold mb-1">Non lues</p>
                <h3 class="mb-0">{{ number_format($stats['unread'], 0, ',', ' ') }}</h3>
            </div>
        </div>
    </div>
    <div class="col-md-4">
        <div class="card">
            <div class="card-body">
                <p class="text-muted text-uppercase fs-12 fw-semibold mb-1">Clients actifs</p>
                <h3 class="mb-0">{{ number_format($stats['clients'], 0, ',', ' ') }}</h3>
            </div>
        </div>
    </div>
</div>

<div class="row g-3">
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">Envoyer une notification</h5>
            </div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.notifications.send') }}" class="row g-3">
                    @csrf
                    <div class="col-12">
                        <label class="form-label">Audience</label>
                        <select class="form-select" name="audience" id="audience-select" required>
                            <option value="all_clients" {{ old('audience') === 'all_clients' ? 'selected' : '' }}>Tous les clients</option>
                            <option value="all_super_admins" {{ old('audience') === 'all_super_admins' ? 'selected' : '' }}>Tous les super_admins</option>
                            <option value="selected_users" {{ old('audience') === 'selected_users' ? 'selected' : '' }}>Utilisateurs ciblés</option>
                        </select>
                    </div>
                    <div class="col-12" id="selected-users-wrapper">
                        <label class="form-label">Utilisateurs ciblés</label>
                        <select class="form-select" name="user_ids[]" multiple size="7">
                            @foreach($clients as $client)
                                <option value="{{ $client->id }}" {{ collect(old('user_ids', []))->contains($client->id) ? 'selected' : '' }}>
                                    {{ $client->name }} ({{ $client->email }})
                                </option>
                            @endforeach
                            @foreach($superAdmins as $admin)
                                <option value="{{ $admin->id }}" {{ collect(old('user_ids', []))->contains($admin->id) ? 'selected' : '' }}>
                                    {{ $admin->name }} [admin]
                                </option>
                            @endforeach
                        </select>
                        <small class="text-muted">Utilisé uniquement si audience = utilisateurs ciblés.</small>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Titre</label>
                        <input class="form-control" name="title" value="{{ old('title') }}" maxlength="140" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Message</label>
                        <textarea class="form-control" name="message" rows="4" maxlength="2000" required>{{ old('message') }}</textarea>
                    </div>
                    <div class="col-12">
                        <label class="form-label">URL action (optionnelle)</label>
                        <input class="form-control" name="action_url" value="{{ old('action_url') }}" placeholder="/dashboard/orders/12 ou https://...">
                    </div>
                    <div class="col-12">
                        <label class="form-label">Label action (optionnel)</label>
                        <input class="form-control" name="action_label" value="{{ old('action_label') }}" placeholder="Voir le détail">
                    </div>
                    <div class="col-12">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="send-email" name="send_email" value="1" {{ old('send_email') ? 'checked' : '' }}>
                            <label class="form-check-label" for="send-email">Envoyer aussi par e-mail (si activé)</label>
                        </div>
                    </div>
                    <div class="col-12">
                        <button type="submit" class="btn btn-primary w-100">Envoyer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-8">
        <div class="card">
            <div class="card-header">
                <form method="GET" class="row g-2 align-items-end">
                    <div class="col-md-4">
                        <label class="form-label mb-1">Audience</label>
                        <select class="form-select form-select-sm" name="audience">
                            <option value="all" {{ $filters['audience'] === 'all' ? 'selected' : '' }}>Toutes</option>
                            <option value="clients" {{ $filters['audience'] === 'clients' ? 'selected' : '' }}>Clients</option>
                            <option value="super_admins" {{ $filters['audience'] === 'super_admins' ? 'selected' : '' }}>Super admins</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label mb-1">État</label>
                        <select class="form-select form-select-sm" name="status">
                            <option value="all" {{ $filters['status'] === 'all' ? 'selected' : '' }}>Tous</option>
                            <option value="unread" {{ $filters['status'] === 'unread' ? 'selected' : '' }}>Non lues</option>
                            <option value="read" {{ $filters['status'] === 'read' ? 'selected' : '' }}>Lues</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label mb-1">Recherche</label>
                        <input class="form-control form-control-sm" type="text" name="search" value="{{ $filters['search'] }}" placeholder="Nom ou email">
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-sm btn-soft-primary w-100" type="submit">Filtrer</button>
                    </div>
                </form>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-nowrap align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Destinataire</th>
                                <th>Contenu</th>
                                <th>État</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            @forelse($notifications as $notification)
                                @php
                                    $data = is_array($notification->data) ? $notification->data : [];
                                    $title = (string) ($data['title'] ?? 'Notification');
                                    $message = (string) ($data['message'] ?? '');
                                    $recipient = $notification->notifiable;
                                @endphp
                                <tr>
                                    <td>
                                        {{ $notification->created_at?->format('d/m/Y H:i') }}
                                    </td>
                                    <td>
                                        <strong>{{ $recipient->name ?? '—' }}</strong>
                                        <small class="d-block text-muted">{{ $recipient->email ?? '—' }}</small>
                                    </td>
                                    <td style="max-width: 360px;" class="text-wrap">
                                        <strong>{{ $title }}</strong>
                                        @if($message !== '')
                                            <small class="d-block text-muted">{{ \Illuminate\Support\Str::limit($message, 140) }}</small>
                                        @endif
                                    </td>
                                    <td>
                                        <span class="badge badge-soft-{{ $notification->read_at ? 'success' : 'warning' }}">
                                            {{ $notification->read_at ? 'Lue' : 'Non lue' }}
                                        </span>
                                    </td>
                                    <td>
                                        @if($notification->read_at)
                                            <form method="POST" action="{{ route('admin.notifications.unread', $notification->id) }}">
                                                @csrf
                                                <button class="btn btn-sm btn-soft-secondary">Marquer non lue</button>
                                            </form>
                                        @else
                                            <form method="POST" action="{{ route('admin.notifications.read', $notification->id) }}">
                                                @csrf
                                                <button class="btn btn-sm btn-soft-primary">Marquer lue</button>
                                            </form>
                                        @endif
                                    </td>
                                </tr>
                            @empty
                                <tr>
                                    <td colspan="5" class="text-center text-muted py-4">Aucune notification.</td>
                                </tr>
                            @endforelse
                        </tbody>
                    </table>
                </div>

                <div class="mt-3">{{ $notifications->links() }}</div>
            </div>
        </div>
    </div>
</div>
@endsection

@section('script')
<script>
    (function () {
        const audienceSelect = document.getElementById('audience-select');
        const selectedUsersWrapper = document.getElementById('selected-users-wrapper');

        if (!audienceSelect || !selectedUsersWrapper) {
            return;
        }

        const toggle = () => {
            selectedUsersWrapper.style.display = audienceSelect.value === 'selected_users' ? 'block' : 'none';
        };

        toggle();
        audienceSelect.addEventListener('change', toggle);
    })();
</script>
@endsection
