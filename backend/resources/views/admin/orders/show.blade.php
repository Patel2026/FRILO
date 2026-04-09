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
    </div>
</div>
@endsection
