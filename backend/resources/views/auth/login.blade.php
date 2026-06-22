@extends('layouts.master-without-nav')

@section('title') Connexion administration @endsection

@section('meta_description', "Connexion réservée aux administrateurs FRILO pour accéder à l'espace d'administration.")

@section('body')
<body class="frilo-admin-login-body">
@endsection

@section('content')
<style>
    :root {
        --frilo-ink: #080b12;
        --frilo-muted: #5f6675;
        --frilo-line: #e5e7eb;
        --frilo-red: #ef0000;
        --frilo-soft: #f6f6f4;
    }

    .frilo-admin-login *,
    .frilo-admin-login *::before,
    .frilo-admin-login *::after {
        box-sizing: border-box;
    }

    .frilo-admin-login-body {
        height: 100vh;
        min-height: 100vh;
        overflow: hidden;
        background: #ffffff;
        color: var(--frilo-ink);
        font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    .frilo-admin-login {
        height: 100vh;
        min-height: 100vh;
        display: grid;
        grid-template-rows: auto 1fr auto;
        overflow: hidden;
        background: #ffffff;
    }

    .frilo-admin-login__topbar {
        min-height: 76px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
        padding: 18px clamp(24px, 5vw, 72px);
        border-bottom: 1px solid var(--frilo-line);
        background: rgba(255, 255, 255, .96);
    }

    .frilo-admin-login__logo {
        display: inline-flex;
        align-items: center;
        width: 142px;
        min-width: 142px;
    }

    .frilo-admin-login__logo img {
        display: block;
        width: 100%;
        height: auto;
    }

    .frilo-admin-login__badge {
        border: 1px solid #111827;
        border-radius: 999px;
        padding: 10px 16px;
        color: #111827;
        font-size: 13px;
        font-weight: 800;
        letter-spacing: .02em;
        text-transform: uppercase;
        white-space: nowrap;
    }

    .frilo-admin-login__main {
        display: grid;
        grid-template-columns: repeat(2, minmax(420px, 1fr));
        gap: clamp(28px, 5vw, 68px);
        align-items: stretch;
        min-height: 0;
        width: min(1180px, calc(100vw - 48px));
        margin: 0 auto;
        padding: clamp(24px, 4vh, 40px) 0;
    }

    .frilo-admin-login__context {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        min-height: 634px;
        padding: clamp(26px, 3vw, 36px);
        background: var(--frilo-ink);
        color: #ffffff;
    }

    .frilo-admin-login__eyebrow {
        margin: 0 0 16px;
        color: #ff2b2b;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: .18em;
        text-transform: uppercase;
    }

    .frilo-admin-login__context h1 {
        max-width: 520px;
        margin: 0;
        color: #ffffff;
        font-size: 40px;
        line-height: 1.05;
        font-weight: 900;
        letter-spacing: 0;
    }

    .frilo-admin-login__context p {
        max-width: 440px;
        margin: 18px 0 0;
        color: rgba(255, 255, 255, .72);
        font-size: 15px;
        line-height: 1.5;
    }

    .frilo-admin-login__signals {
        display: grid;
        gap: 0;
        margin-top: 26px;
        border-top: 1px solid rgba(255, 255, 255, .22);
    }

    .frilo-admin-login__signal {
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: 14px;
        padding: 13px 0;
        border-bottom: 1px solid rgba(255, 255, 255, .18);
    }

    .frilo-admin-login__signal span {
        color: rgba(255, 255, 255, .36);
        font-size: 22px;
        line-height: 1;
        font-weight: 800;
    }

    .frilo-admin-login__signal strong {
        display: block;
        color: #ffffff;
        font-size: 16px;
        font-weight: 900;
    }

    .frilo-admin-login__signal small {
        display: block;
        margin-top: 4px;
        color: rgba(255, 255, 255, .62);
        font-size: 13px;
        line-height: 1.4;
    }

    .frilo-admin-login__panel {
        display: flex;
        align-items: stretch;
        padding: 0;
    }

    .frilo-admin-login__card {
        width: 100%;
        height: 100%;
        padding: clamp(28px, 3.5vw, 42px);
        border: 1px solid #111827;
        border-radius: 0;
        background: #ffffff;
        box-shadow: none;
    }

    .frilo-admin-login__card-head {
        display: grid;
        gap: 12px;
        padding-bottom: 24px;
        border-bottom: 1px solid var(--frilo-line);
    }

    .frilo-admin-login__card-head h2 {
        margin: 0;
        color: var(--frilo-ink);
        font-size: clamp(30px, 3vw, 40px);
        line-height: 1;
        font-weight: 900;
        letter-spacing: 0;
    }

    .frilo-admin-login__card-head p {
        max-width: 520px;
        margin: 0;
        color: var(--frilo-muted);
        font-size: 16px;
        line-height: 1.6;
    }

    .frilo-admin-login__alert {
        display: grid;
        gap: 4px;
        margin-top: 18px;
        padding: 12px 14px;
        border: 1px solid rgba(239, 0, 0, .34);
        background: rgba(239, 0, 0, .07);
        color: #8f0000;
        font-size: 13px;
        line-height: 1.4;
    }

    .frilo-admin-login__alert strong {
        display: block;
        color: #8f0000;
        font-size: 13px;
        font-weight: 900;
    }

    .frilo-admin-login__alert span {
        color: #8f0000;
        font-weight: 700;
    }

    .frilo-admin-login__form {
        display: grid;
        gap: 18px;
        margin-top: 22px;
    }

    .frilo-admin-login__field label,
    .frilo-admin-login__remember label {
        color: var(--frilo-ink);
        font-size: 14px;
        font-weight: 900;
        letter-spacing: .08em;
        text-transform: uppercase;
    }

    .frilo-admin-login__field input {
        width: 100%;
        min-height: 56px;
        margin-top: 10px;
        border: 1px solid #cfd5df;
        border-radius: 0;
        padding: 0 18px;
        color: var(--frilo-ink);
        font-size: 16px;
        font-weight: 700;
        background: #ffffff;
        transition: border-color .18s ease, box-shadow .18s ease;
    }

    .frilo-admin-login__field input:focus {
        border-color: var(--frilo-ink);
        box-shadow: 0 0 0 4px rgba(8, 11, 18, .08);
        outline: none;
    }

    .frilo-admin-login__field input.is-invalid {
        border-color: var(--frilo-red);
        box-shadow: 0 0 0 3px rgba(239, 0, 0, .08);
    }

    .frilo-admin-login__field input::placeholder {
        color: #98a1b2;
        font-weight: 600;
    }

    .frilo-admin-login__password {
        position: relative;
    }

    .frilo-admin-login__password input {
        padding-right: 54px;
    }

    .frilo-admin-login__password button {
        position: absolute;
        right: 8px;
        top: 10px;
        width: 44px;
        height: 56px;
        border: 0;
        background: transparent;
        color: #6b7280;
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }

    .frilo-admin-login__remember {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-top: 2px;
    }

    .frilo-admin-login__remember input {
        width: 20px;
        height: 20px;
        margin: 0;
        border-radius: 0;
        border-color: #cfd5df;
    }

    .frilo-admin-login__submit {
        display: inline-flex;
        width: 100%;
        min-height: 58px;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--frilo-red);
        border-radius: 0;
        background: var(--frilo-red);
        color: #ffffff;
        font-size: 16px;
        font-weight: 900;
        letter-spacing: .01em;
        transition: transform .18s ease, background .18s ease, border-color .18s ease;
    }

    .frilo-admin-login__submit:hover,
    .frilo-admin-login__submit:focus {
        background: #c90000;
        border-color: #c90000;
        color: #ffffff;
        transform: translateY(-1px);
    }

    .frilo-admin-login__help {
        margin: 18px 0 0;
        color: #7b8392;
        font-size: 13px;
        line-height: 1.5;
    }

    .frilo-admin-login__footer {
        padding: 16px clamp(24px, 5vw, 72px);
        border-top: 1px solid var(--frilo-line);
        color: #7b8392;
        font-size: 13px;
        font-weight: 700;
        text-align: center;
        background: #ffffff;
    }

    .invalid-feedback {
        display: block;
        margin-top: 7px;
        color: #b00000;
        font-size: 13px;
        line-height: 1.35;
        font-weight: 800;
    }

    @media (max-width: 991.98px) {
        .frilo-admin-login__main {
            grid-template-columns: 1fr;
            width: min(720px, calc(100vw - 32px));
            padding: 28px 0 44px;
        }

        .frilo-admin-login__context {
            min-height: auto;
        }

        .frilo-admin-login__context h1 {
            font-size: clamp(34px, 9vw, 52px);
        }

        .frilo-admin-login__panel {
            padding: 0;
        }

        .frilo-admin-login-body {
            height: auto;
            min-height: 100vh;
            overflow: auto;
        }

        .frilo-admin-login {
            height: auto;
            min-height: 100vh;
            overflow: visible;
        }
    }

    @media (max-width: 575.98px) {
        .frilo-admin-login__topbar {
            min-height: 68px;
            padding: 16px 18px;
        }

        .frilo-admin-login__logo {
            width: 116px;
            min-width: 116px;
        }

        .frilo-admin-login__badge {
            display: none;
        }

        .frilo-admin-login__context,
        .frilo-admin-login__card {
            padding: 24px;
        }

        .frilo-admin-login__signal {
            grid-template-columns: 44px 1fr;
        }
    }
</style>

<div class="frilo-admin-login">
    <header class="frilo-admin-login__topbar">
        <a class="frilo-admin-login__logo" href="{{ route('admin.login') }}" aria-label="FRILO">
            <img src="{{ URL::asset('build/images/frilo-logo-black.png') }}" alt="FRILO">
        </a>
        <span class="frilo-admin-login__badge">Espace d'administration</span>
    </header>

    <main class="frilo-admin-login__main">
        <section class="frilo-admin-login__context" aria-label="Contexte administration FRILO">
            <div>
                <p class="frilo-admin-login__eyebrow">Accès réservé</p>
                <h1>Accédez au pilotage FRILO.</h1>
                <p>Cette porte d'entrée est réservée à l'équipe FRILO pour suivre les commandes, les contenus, les paiements et la livraison client.</p>
            </div>

            <div class="frilo-admin-login__signals" aria-label="Garanties de l'espace admin">
                <div class="frilo-admin-login__signal">
                    <span>01</span>
                    <div>
                        <strong>Accès privé</strong>
                        <small>URL dédiée, compte admin actif et protections serveur.</small>
                    </div>
                </div>
                <div class="frilo-admin-login__signal">
                    <span>02</span>
                    <div>
                        <strong>Rôles séparés</strong>
                        <small>Chaque profil accède uniquement aux actions dont il a besoin.</small>
                    </div>
                </div>
                <div class="frilo-admin-login__signal">
                    <span>03</span>
                    <div>
                        <strong>Suivi opérationnel</strong>
                        <small>Commandes, production, relances et livraison restent au même endroit.</small>
                    </div>
                </div>
            </div>
        </section>

        <section class="frilo-admin-login__panel" aria-label="Connexion administrateur">
            <div class="frilo-admin-login__card">
                <div class="frilo-admin-login__card-head">
                    <h2>Connexion admin</h2>
                    <p>Connectez-vous avec votre compte FRILO actif pour accéder au pilotage interne.</p>
                </div>

                @if ($errors->any())
                    <div class="frilo-admin-login__alert" role="alert" aria-live="polite">
                        <strong>Connexion impossible.</strong>
                        <span>Vérifiez vos identifiants administrateur, puis réessayez.</span>
                    </div>
                @endif

                <form class="frilo-admin-login__form" action="{{ route('admin.login.submit') }}" method="POST">
                    @csrf

                    <div class="frilo-admin-login__field">
                        <label for="email">Adresse e-mail <span class="text-danger">*</span></label>
                        <input type="email"
                               class="@error('email') is-invalid @enderror"
                               id="email"
                               name="email"
                               value="{{ old('email') }}"
                               placeholder="admin@frilo.com"
                               autocomplete="email"
                               aria-invalid="@error('email') true @else false @enderror"
                               @error('email') aria-describedby="email-error" @enderror
                               required
                               autofocus>
                        @error('email')
                            <span id="email-error" class="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                        @enderror
                    </div>

                    <div class="frilo-admin-login__field">
                        <label for="password-input">Mot de passe <span class="text-danger">*</span></label>
                        <div class="frilo-admin-login__password">
                            <input type="password"
                                   class="password-input @error('password') is-invalid @enderror"
                                   name="password"
                                   placeholder="Votre mot de passe"
                                   id="password-input"
                                   autocomplete="current-password"
                                   aria-invalid="@error('password') true @else false @enderror"
                                   @error('password') aria-describedby="password-error" @enderror
                                   required>
                            <button
                                type="button"
                                id="password-addon"
                                aria-label="Afficher le mot de passe"
                                aria-controls="password-input"
                                aria-pressed="false">
                                <i class="ri-eye-fill align-middle"></i>
                            </button>
                        </div>
                        @error('password')
                            <span id="password-error" class="invalid-feedback" role="alert"><strong>{{ $message }}</strong></span>
                        @enderror
                    </div>

                    <div class="frilo-admin-login__remember">
                        <input type="checkbox" name="remember" id="auth-remember-check" {{ old('remember') ? 'checked' : '' }}>
                        <label for="auth-remember-check">Se souvenir de moi</label>
                    </div>

                    <button class="frilo-admin-login__submit" type="submit">Se connecter</button>
                </form>

                <p class="frilo-admin-login__help">Si vous n'avez pas accès à cette interface, contactez le super administrateur FRILO.</p>
            </div>
        </section>
    </main>

    <footer class="frilo-admin-login__footer">
        &copy; {{ date('Y') }} FRILO. Accès réservé à l'équipe d'administration.
    </footer>
</div>
@endsection

@section('script')
<script>
    document.addEventListener('DOMContentLoaded', function () {
        const passwordInput = document.getElementById('password-input');
        const passwordToggle = document.getElementById('password-addon');

        if (!passwordInput || !passwordToggle) {
            return;
        }

        const icon = passwordToggle.querySelector('i');

        passwordToggle.addEventListener('click', function () {
            const isHidden = passwordInput.type === 'password';

            passwordInput.type = isHidden ? 'text' : 'password';
            passwordToggle.setAttribute('aria-pressed', isHidden ? 'true' : 'false');
            passwordToggle.setAttribute(
                'aria-label',
                isHidden ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
            );

            if (icon) {
                icon.classList.toggle('ri-eye-fill', !isHidden);
                icon.classList.toggle('ri-eye-off-fill', isHidden);
            }
        });
    });
</script>
@endsection
