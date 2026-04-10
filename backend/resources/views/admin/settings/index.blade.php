@extends('layouts.master')

@section('title') Paramètres plateforme @endsection

@php
    $general = data_get($payload, 'general', []);
    $branding = data_get($payload, 'branding', []);
    $pricing = data_get($payload, 'pricing', []);
    $fedapay = data_get($payload, 'payment.fedapay', []);
    $sla = data_get($payload, 'sla', []);
    $notifications = data_get($payload, 'notifications', []);
    $legal = data_get($payload, 'legal', []);
@endphp

@section('content')
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Paramètres plateforme</h4>
            <div class="d-flex gap-2">
                <a href="{{ route('admin.settings.history') }}" class="btn btn-soft-secondary btn-sm">
                    <i class="ri-time-line me-1"></i> Historique
                </a>
            </div>
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

<div class="card">
    <div class="card-body">
        <div class="row g-3">
            <div class="col-lg-4">
                <div class="border rounded p-3 h-100">
                    <div class="text-muted text-uppercase fs-12 fw-semibold">Révision brouillon</div>
                    <h5 class="mb-1">#{{ $draft->id }}</h5>
                    <small class="text-muted">Créée le {{ $draft->created_at?->format('d/m/Y H:i') }}</small>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="border rounded p-3 h-100">
                    <div class="text-muted text-uppercase fs-12 fw-semibold">Dernière publication</div>
                    @if($published)
                        <h5 class="mb-1">#{{ $published->id }}</h5>
                        <small class="text-muted">Le {{ $published->published_at?->format('d/m/Y H:i') }}</small>
                    @else
                        <h5 class="mb-1">Aucune</h5>
                        <small class="text-muted">Publie la première version quand prêt.</small>
                    @endif
                </div>
            </div>
            <div class="col-lg-4">
                <div class="border rounded p-3 h-100">
                    <div class="text-muted text-uppercase fs-12 fw-semibold">Dernier test paiement</div>
                    @if($draft->tested_at)
                        <h5 class="mb-1">{{ $draft->tested_at->format('d/m/Y H:i') }}</h5>
                        <small class="text-muted">Réalisé par utilisateur #{{ $draft->tested_by ?? '—' }}</small>
                    @else
                        <h5 class="mb-1">Non testé</h5>
                        <small class="text-muted">Teste la connexion avant publication.</small>
                    @endif
                </div>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header"><h5 class="card-title mb-0">Général</h5></div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.settings.update-section', 'general') }}" class="row g-3">
                    @csrf
                    @method('PATCH')
                    <div class="col-12">
                        <label class="form-label">Nom plateforme</label>
                        <input class="form-control" name="platform_name" value="{{ old('platform_name', $general['platform_name'] ?? '') }}" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Tagline</label>
                        <input class="form-control" name="tagline" value="{{ old('tagline', $general['tagline'] ?? '') }}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Email support</label>
                        <input type="email" class="form-control" name="support_email" value="{{ old('support_email', $general['support_email'] ?? '') }}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Téléphone support</label>
                        <input class="form-control" name="support_phone" value="{{ old('support_phone', $general['support_phone'] ?? '') }}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Timezone</label>
                        <input class="form-control" name="timezone" value="{{ old('timezone', $general['timezone'] ?? 'Africa/Porto-Novo') }}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Devise par défaut</label>
                        <input class="form-control text-uppercase" name="default_currency" value="{{ old('default_currency', $general['default_currency'] ?? 'XOF') }}" required>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-primary btn-sm" type="submit">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header"><h5 class="card-title mb-0">Branding</h5></div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.settings.update-section', 'branding') }}" class="row g-3">
                    @csrf
                    @method('PATCH')
                    <div class="col-md-6">
                        <label class="form-label">Logo URL</label>
                        <input class="form-control" name="logo_url" value="{{ old('logo_url', $branding['logo_url'] ?? '') }}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Favicon URL</label>
                        <input class="form-control" name="favicon_url" value="{{ old('favicon_url', $branding['favicon_url'] ?? '') }}">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Couleur primaire</label>
                        <input class="form-control" name="primary_color" value="{{ old('primary_color', $branding['primary_color'] ?? '#0f172a') }}" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Couleur secondaire</label>
                        <input class="form-control" name="secondary_color" value="{{ old('secondary_color', $branding['secondary_color'] ?? '#1f2937') }}" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Couleur accent</label>
                        <input class="form-control" name="accent_color" value="{{ old('accent_color', $branding['accent_color'] ?? '#2563eb') }}" required>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-primary btn-sm" type="submit">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-12">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Tarification publique</h5></div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.settings.update-section', 'pricing') }}" class="row g-3">
                    @csrf
                    @method('PATCH')
                    <div class="col-md-2">
                        <label class="form-label">Libellé devise</label>
                        <input class="form-control text-uppercase" name="currency_label" value="{{ old('currency_label', $pricing['currency_label'] ?? 'FCFA') }}" required>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Titre section</label>
                        <input class="form-control" name="section_title" value="{{ old('section_title', $pricing['section_title'] ?? '') }}" required>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label">Texte complémentaire</label>
                        <input class="form-control" name="custom_note" value="{{ old('custom_note', $pricing['custom_note'] ?? '') }}">
                    </div>
                    <div class="col-12">
                        <label class="form-label">Description section</label>
                        <textarea class="form-control" name="section_description" rows="2" required>{{ old('section_description', $pricing['section_description'] ?? '') }}</textarea>
                    </div>

                    <div class="col-lg-6">
                        <div class="border rounded p-3 h-100">
                            <h6 class="mb-3">Plan Standard</h6>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Nom</label>
                                    <input class="form-control" name="standard_name" value="{{ old('standard_name', data_get($pricing, 'standard.name', 'Standard')) }}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Prix</label>
                                    <input type="number" min="0" class="form-control" name="standard_price" value="{{ old('standard_price', data_get($pricing, 'standard.price', 50000)) }}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Libellé facturation</label>
                                    <input class="form-control" name="standard_billing_label" value="{{ old('standard_billing_label', data_get($pricing, 'standard.billing_label', 'Paiement unique')) }}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Texte bouton</label>
                                    <input class="form-control" name="standard_cta_label" value="{{ old('standard_cta_label', data_get($pricing, 'standard.cta_label', 'Choisir')) }}" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Features Standard</label>
                                    <textarea class="form-control" name="standard_features_raw" rows="7" required>{{ old('standard_features_raw', implode(PHP_EOL, data_get($pricing, 'standard.features', []))) }}</textarea>
                                    <div class="form-text">Une ligne par avantage affiché dans la carte Standard.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-lg-6">
                        <div class="border rounded p-3 h-100">
                            <h6 class="mb-3">Plan Premium</h6>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label">Badge</label>
                                    <input class="form-control" name="premium_badge_label" value="{{ old('premium_badge_label', data_get($pricing, 'premium.badge_label', 'Populaire')) }}">
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Nom</label>
                                    <input class="form-control" name="premium_name" value="{{ old('premium_name', data_get($pricing, 'premium.name', 'Premium')) }}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Prix</label>
                                    <input type="number" min="0" class="form-control" name="premium_price" value="{{ old('premium_price', data_get($pricing, 'premium.price', 75000)) }}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Libellé facturation</label>
                                    <input class="form-control" name="premium_billing_label" value="{{ old('premium_billing_label', data_get($pricing, 'premium.billing_label', 'Paiement unique')) }}" required>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label">Texte bouton</label>
                                    <input class="form-control" name="premium_cta_label" value="{{ old('premium_cta_label', data_get($pricing, 'premium.cta_label', 'Choisir')) }}" required>
                                </div>
                                <div class="col-12">
                                    <label class="form-label">Features Premium</label>
                                    <textarea class="form-control" name="premium_features_raw" rows="7" required>{{ old('premium_features_raw', implode(PHP_EOL, data_get($pricing, 'premium.features', []))) }}</textarea>
                                    <div class="form-text">Une ligne par avantage affiché dans la carte Premium.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="col-12">
                        <button class="btn btn-primary btn-sm" type="submit">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header"><h5 class="card-title mb-0">Paiement FedaPay</h5></div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.settings.update-section', 'payment') }}" class="row g-3">
                    @csrf
                    @method('PATCH')
                    <div class="col-md-4">
                        <label class="form-label">Activé</label>
                        <select name="enabled" class="form-select">
                            <option value="1" {{ (string) old('enabled', (int) ($fedapay['enabled'] ?? 1)) === '1' ? 'selected' : '' }}>Oui</option>
                            <option value="0" {{ (string) old('enabled', (int) ($fedapay['enabled'] ?? 1)) === '0' ? 'selected' : '' }}>Non</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Environnement</label>
                        <select name="environment" class="form-select">
                            <option value="sandbox" {{ old('environment', $fedapay['environment'] ?? 'sandbox') === 'sandbox' ? 'selected' : '' }}>Sandbox</option>
                            <option value="live" {{ old('environment', $fedapay['environment'] ?? 'sandbox') === 'live' ? 'selected' : '' }}>Live</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Devise</label>
                        <input class="form-control text-uppercase" name="currency" value="{{ old('currency', $fedapay['currency'] ?? 'XOF') }}" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Base URL</label>
                        <input class="form-control" name="base_url" value="{{ old('base_url', $fedapay['base_url'] ?? '') }}" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Callback URL</label>
                        <input class="form-control" name="callback_url" value="{{ old('callback_url', $fedapay['callback_url'] ?? '') }}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Secret key</label>
                        <input type="password" class="form-control" name="secret_key" placeholder="Laisser vide pour conserver la valeur">
                        <small class="text-muted">Configurée: {{ $secretState['secret_key_configured'] ? 'Oui' : 'Non' }}</small>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Webhook secret</label>
                        <input type="password" class="form-control" name="webhook_secret" placeholder="Laisser vide pour conserver la valeur">
                        <small class="text-muted">Configurée: {{ $secretState['webhook_secret_configured'] ? 'Oui' : 'Non' }}</small>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Tolérance webhook (sec)</label>
                        <input type="number" min="0" class="form-control" name="webhook_tolerance" value="{{ old('webhook_tolerance', $fedapay['webhook_tolerance'] ?? 300) }}" required>
                    </div>
                    <div class="col-12 d-flex gap-2">
                        <button class="btn btn-primary btn-sm" type="submit">Enregistrer</button>
                    </div>
                </form>

                <form method="POST" action="{{ route('admin.settings.payment.test') }}" class="mt-2">
                    @csrf
                    <button class="btn btn-soft-info btn-sm" type="submit">
                        Tester la connexion
                    </button>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header"><h5 class="card-title mb-0">Workflow / SLA</h5></div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.settings.update-section', 'sla') }}" class="row g-3">
                    @csrf
                    @method('PATCH')
                    <div class="col-md-6">
                        <label class="form-label">Confirmation (minutes)</label>
                        <input type="number" min="1" class="form-control" name="confirmation_minutes" value="{{ old('confirmation_minutes', $sla['confirmation_minutes'] ?? 120) }}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Preview (heures)</label>
                        <input type="number" min="1" class="form-control" name="preview_hours" value="{{ old('preview_hours', $sla['preview_hours'] ?? 24) }}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Livraison (heures)</label>
                        <input type="number" min="1" class="form-control" name="delivery_hours" value="{{ old('delivery_hours', $sla['delivery_hours'] ?? 48) }}" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Fenêtre révision (heures)</label>
                        <input type="number" min="1" class="form-control" name="revision_window_hours" value="{{ old('revision_window_hours', $sla['revision_window_hours'] ?? 24) }}" required>
                    </div>
                    <div class="col-12">
                        <button class="btn btn-primary btn-sm" type="submit">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header"><h5 class="card-title mb-0">Notifications</h5></div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.settings.update-section', 'notifications') }}" class="row g-3">
                    @csrf
                    @method('PATCH')
                    @foreach([
                        'email_enabled' => 'Email activé',
                        'sms_enabled' => 'SMS activé',
                        'whatsapp_enabled' => 'WhatsApp activé',
                        'notify_order_created' => 'Notifier commande créée',
                        'notify_payment_status_changed' => 'Notifier statut paiement',
                        'notify_order_status_changed' => 'Notifier statut commande',
                        'notify_contact_request_received' => 'Notifier demande contact',
                    ] as $field => $label)
                        <div class="col-md-6">
                            <label class="form-label">{{ $label }}</label>
                            <select name="{{ $field }}" class="form-select">
                                <option value="1" {{ (string) old($field, (int) ($notifications[$field] ?? 1)) === '1' ? 'selected' : '' }}>Oui</option>
                                <option value="0" {{ (string) old($field, (int) ($notifications[$field] ?? 1)) === '0' ? 'selected' : '' }}>Non</option>
                            </select>
                        </div>
                    @endforeach
                    <div class="col-12">
                        <button class="btn btn-primary btn-sm" type="submit">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-lg-6">
        <div class="card h-100">
            <div class="card-header"><h5 class="card-title mb-0">Légal</h5></div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.settings.update-section', 'legal') }}" class="row g-3">
                    @csrf
                    @method('PATCH')
                    <div class="col-12">
                        <label class="form-label">Raison sociale</label>
                        <input class="form-control" name="company_name" value="{{ old('company_name', $legal['company_name'] ?? 'FRILO') }}" required>
                    </div>
                    <div class="col-12">
                        <label class="form-label">Adresse</label>
                        <input class="form-control" name="company_address" value="{{ old('company_address', $legal['company_address'] ?? '') }}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">N° registre</label>
                        <input class="form-control" name="registration_number" value="{{ old('registration_number', $legal['registration_number'] ?? '') }}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">N° IFU / Taxe</label>
                        <input class="form-control" name="tax_number" value="{{ old('tax_number', $legal['tax_number'] ?? '') }}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">URL CGU</label>
                        <input class="form-control" name="terms_url" value="{{ old('terms_url', $legal['terms_url'] ?? '') }}">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">URL confidentialité</label>
                        <input class="form-control" name="privacy_url" value="{{ old('privacy_url', $legal['privacy_url'] ?? '') }}">
                    </div>
                    <div class="col-12">
                        <button class="btn btn-primary btn-sm" type="submit">Enregistrer</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <div class="col-12">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Publier la configuration</h5></div>
            <div class="card-body">
                <form method="POST" action="{{ route('admin.settings.publish') }}" class="row g-3">
                    @csrf
                    <div class="col-lg-8">
                        <label class="form-label">Note de changement (optionnelle)</label>
                        <textarea class="form-control" rows="2" name="change_note" placeholder="Résumé des changements publiés...">{{ old('change_note') }}</textarea>
                    </div>
                    <div class="col-lg-4 d-flex align-items-end justify-content-lg-end">
                        <button class="btn btn-success" type="submit">
                            <i class="ri-upload-cloud-line me-1"></i> Publier cette version
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
