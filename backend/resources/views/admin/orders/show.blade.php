@extends('layouts.master')

@section('title') Commande #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }} @endsection

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Commande #{{ str_pad($order->id, 5, '0', STR_PAD_LEFT) }}</h4>
            <a href="{{ route('admin.orders.index') }}" class="btn btn-soft-secondary btn-sm">
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
    {{-- Infos commande + changement de statut --}}
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Statut de la commande</h5></div>
            <div class="card-body">
                <div class="mb-3">
                    <span class="badge badge-soft-{{ match($order->status->value) {
                        'pending' => 'warning',
                        'processing' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'secondary'
                    } }} fs-14">
                        {{ $order->status->label() }}
                    </span>
                </div>

                @php $transitions = $order->status->allowedTransitions(); @endphp
                @if(count($transitions))
                    <hr>
                    <p class="text-muted mb-2 fw-medium">Changer le statut :</p>
                    @foreach($transitions as $next)
                    <form action="{{ route('admin.orders.status', $order) }}" method="POST" class="mb-2">
                        @csrf
                        @method('PATCH')
                        <input type="hidden" name="status" value="{{ $next->value }}">
                        <button type="submit" class="btn btn-soft-{{ match($next->value) {
                            'processing' => 'info',
                            'completed' => 'success',
                            'cancelled' => 'danger',
                            default => 'secondary'
                        } }} w-100">
                            → {{ $next->label() }}
                        </button>
                    </form>
                    @endforeach
                @else
                    <p class="text-muted fst-italic mt-2 mb-0">Statut final — aucune transition possible.</p>
                @endif
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Template commandé</h5></div>
            <div class="card-body">
                <p class="mb-1"><strong>{{ $order->template->name ?? '—' }}</strong></p>
                <p class="mb-1 text-muted">{{ $order->template->sector->name ?? '—' }}</p>
                <p class="mb-0 fw-semibold text-primary">{{ number_format($order->price, 0, ',', ' ') }} FCFA <small class="text-muted fw-normal">(prix au moment de la commande)</small></p>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Paiement</h5></div>
            <div class="card-body">
                <p class="mb-2">
                    <span class="badge {{ $order->payment_status->badgeClass() }}">
                        {{ $order->payment_status->label() }}
                    </span>
                </p>
                @if($order->paid_at)
                    <p class="mb-2 text-muted"><i class="ri-time-line me-1"></i>Payée le {{ $order->paid_at->format('d/m/Y H:i') }}</p>
                @endif
                <p class="mb-1"><strong>Mode:</strong> {{ $order->latestPayment?->mode ?? '—' }}</p>
                <p class="mb-1"><strong>Référence:</strong> {{ $order->latestPayment?->fedapay_reference ?? '—' }}</p>
                <p class="mb-0"><strong>Statut transaction:</strong> {{ $order->latestPayment?->status ?? '—' }}</p>
            </div>
        </div>
    </div>

    {{-- Client + Instructions --}}
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Client</h5></div>
            <div class="card-body">
                <p class="mb-1"><i class="ri-user-line me-1 text-muted"></i> {{ $order->user->name ?? '—' }}</p>
                <p class="mb-0"><i class="ri-mail-line me-1 text-muted"></i> {{ $order->user->email ?? '—' }}</p>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Instructions de personnalisation</h5></div>
            <div class="card-body">
                @if($order->instruction)
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-medium">Nom de l'entreprise</label>
                            <p>{{ $order->instruction->enterprise_name ?: '—' }}</p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-medium">Couleurs souhaitées</label>
                            <div class="d-flex gap-2 flex-wrap">
                                @forelse($order->instruction->colors ?? [] as $color)
                                    <span class="badge" style="background: {{ $color }}; color: #fff;">{{ $color }}</span>
                                @empty
                                    <span class="text-muted">—</span>
                                @endforelse
                            </div>
                        </div>
                        <div class="col-12">
                            <label class="form-label text-muted fw-medium">Description de l'activité</label>
                            <p>{{ $order->instruction->activity_description ?: '—' }}</p>
                        </div>
                        <div class="col-12">
                            <label class="form-label text-muted fw-medium">Instructions spécifiques</label>
                            <p>{{ $order->instruction->specific_instructions ?: '—' }}</p>
                        </div>
                    </div>
                @else
                    <p class="text-muted fst-italic">Aucune instruction renseignée.</p>
                @endif
            </div>
        </div>

        {{-- Site livré --}}
        <div class="card mt-3">
            <div class="card-header"><h5 class="card-title mb-0">Site livré</h5></div>
            <div class="card-body">
                @if($order->site_url || $order->domain || $order->hosting_expires_at)
                    @if($order->site_url)
                        @php $siteUrlSafe = Str::startsWith($order->site_url, ['http://', 'https://']) ? $order->site_url : '#'; @endphp
                        <p class="mb-1"><strong>URL :</strong> <a href="{{ $siteUrlSafe }}" target="_blank" rel="noopener noreferrer" class="text-primary">{{ $order->site_url }}</a></p>
                    @endif
                    @if($order->domain)
                        <p class="mb-1"><strong>Domaine :</strong> {{ $order->domain }}</p>
                    @endif
                    @if($order->hosting_expires_at)
                        <p class="mb-3"><strong>Hébergement expire le :</strong> {{ $order->hosting_expires_at->format('d/m/Y') }}</p>
                    @endif
                    <hr>
                @else
                    <p class="text-muted mb-3">Aucune information de site renseignée.</p>
                @endif
                <form action="{{ route('admin.orders.site', $order) }}" method="POST">
                    @csrf
                    @method('PATCH')
                    <div class="mb-2">
                        <label class="form-label">URL du site</label>
                        <input type="url" name="site_url" class="form-control form-control-sm @error('site_url') is-invalid @enderror"
                            value="{{ old('site_url', $order->site_url) }}" placeholder="https://...">
                        @error('site_url')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>
                    <div class="mb-2">
                        <label class="form-label">Nom de domaine</label>
                        <input type="text" name="domain" class="form-control form-control-sm @error('domain') is-invalid @enderror"
                            value="{{ old('domain', $order->domain) }}" placeholder="monsite.com">
                        @error('domain')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Expiration hébergement</label>
                        <input type="date" name="hosting_expires_at" class="form-control form-control-sm @error('hosting_expires_at') is-invalid @enderror"
                            value="{{ old('hosting_expires_at', $order->hosting_expires_at?->format('Y-m-d')) }}">
                        @error('hosting_expires_at')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>
                    <button type="submit" class="btn btn-soft-primary btn-sm w-100">Enregistrer</button>
                </form>
            </div>
        </div>

        {{-- Prévisualisation --}}
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="card-title mb-0">Lien de prévisualisation</h5>
            </div>
            <div class="card-body">
                @if($order->preview_url)
                    <p class="mb-2">
                        <a href="{{ $order->preview_url }}" target="_blank" class="text-primary">
                            {{ $order->preview_url }}
                        </a>
                    </p>
                @else
                    <p class="text-muted mb-2">Aucun lien défini.</p>
                @endif

                @if($order->client_feedback)
                    <div class="alert alert-info mt-3">
                        <strong>Retours client :</strong><br>
                        {{ $order->client_feedback }}<br>
                        <small class="text-muted">
                            Soumis le {{ $order->feedback_submitted_at?->format('d/m/Y H:i') }}
                        </small>
                    </div>
                @endif

                <form action="{{ route('admin.orders.preview', $order) }}" method="POST" class="mt-3">
                    @csrf
                    @method('PATCH')
                    <div class="mb-3">
                        <label for="preview_url" class="form-label">URL de prévisualisation</label>
                        <input type="text"
                               id="preview_url"
                               name="preview_url"
                               class="form-control @error('preview_url') is-invalid @enderror"
                               value="{{ old('preview_url', $order->preview_url) }}"
                               placeholder="https://preview.frilo.bj/orders/{{ $order->id }}">
                        @error('preview_url')
                            <div class="invalid-feedback">{{ $message }}</div>
                        @enderror
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm">Enregistrer le lien</button>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
