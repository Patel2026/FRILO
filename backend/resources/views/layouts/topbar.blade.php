@php
    $adminUser = auth()->user();
    $adminUnreadCount = $adminUser ? $adminUser->unreadNotifications()->count() : 0;
    $adminLatestNotifications = $adminUser
        ? $adminUser->notifications()->latest()->limit(6)->get()
        : collect();
@endphp

<header id="page-topbar">
    <div class="layout-width">
        <div class="navbar-header">
            <div class="d-flex align-items-center">
                <button type="button" class="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger" id="topnav-hamburger-icon">
                    <span class="hamburger-icon">
                        <span></span>
                        <span></span>
                        <span></span>
                    </span>
                </button>

                <div class="ms-2">
                    <h6 class="mb-0 fw-semibold">FRILO Admin</h6>
                    <small class="text-muted">Backoffice opérationnel</small>
                </div>
            </div>

            <div class="d-flex align-items-center">
                <a href="{{ config('app.frontend_url', env('FRONTEND_APP_URL', 'http://localhost:3000')) }}" target="_blank" rel="noreferrer" class="btn btn-sm btn-soft-primary me-2">
                    <i class="ri-external-link-line align-middle me-1"></i> Site client
                </a>

                <div class="dropdown topbar-head-dropdown ms-1 header-item">
                    <button type="button" class="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i class="bx bx-bell fs-22"></i>
                        @if($adminUnreadCount > 0)
                            <span class="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
                                {{ $adminUnreadCount > 99 ? '99+' : $adminUnreadCount }}
                            </span>
                        @endif
                    </button>
                    <div class="dropdown-menu dropdown-menu-lg dropdown-menu-end p-0">
                        <div class="p-3 border-top-0 border-start-0 border-end-0 border-dashed border d-flex align-items-center justify-content-between">
                            <h6 class="m-0 fs-16 fw-semibold">Notifications</h6>
                            <a href="{{ route('admin.notifications.index') }}" class="text-reset text-decoration-underline small">Voir tout</a>
                        </div>
                        <div data-simplebar style="max-height: 320px;">
                            @forelse($adminLatestNotifications as $notification)
                                @php
                                    $data = is_array($notification->data) ? $notification->data : [];
                                    $title = (string) ($data['title'] ?? 'Notification');
                                    $message = (string) ($data['message'] ?? '');
                                @endphp
                                <a href="{{ route('admin.notifications.index') }}" class="dropdown-item notify-item {{ $notification->read_at ? '' : 'bg-light-subtle' }}">
                                    <div class="d-flex">
                                        <div class="avatar-xs me-3">
                                            <span class="avatar-title bg-primary-subtle text-primary rounded-circle fs-16">
                                                <i class="ri-notification-3-line"></i>
                                            </span>
                                        </div>
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">{{ \Illuminate\Support\Str::limit($title, 60) }}</h6>
                                            @if($message !== '')
                                                <div class="text-muted fs-12">{{ \Illuminate\Support\Str::limit($message, 90) }}</div>
                                            @endif
                                            <small class="text-muted">{{ $notification->created_at?->diffForHumans() }}</small>
                                        </div>
                                    </div>
                                </a>
                            @empty
                                <div class="p-3 text-center text-muted">
                                    Aucune notification récente.
                                </div>
                            @endforelse
                        </div>
                        @if($adminUnreadCount > 0)
                            <div class="p-2 border-top">
                                <form method="POST" action="{{ route('admin.notifications.read-all') }}">
                                    @csrf
                                    <button type="submit" class="btn btn-soft-secondary btn-sm w-100">
                                        <i class="ri-check-double-line me-1"></i> Tout marquer lu
                                    </button>
                                </form>
                            </div>
                        @endif
                    </div>
                </div>

                <div class="dropdown ms-sm-3 header-item topbar-user">
                    <button type="button" class="btn" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <span class="d-flex align-items-center">
                            <span class="text-start me-xl-2">
                                <span class="d-none d-xl-inline-block ms-1 fw-medium user-name-text">{{ auth()->user()->name ?? 'Admin' }}</span>
                                <span class="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">{{ str_replace('_', ' ', auth()->user()->role ?? 'super_admin') }}</span>
                            </span>
                            <i class="mdi mdi-chevron-down d-none d-xl-inline-block"></i>
                        </span>
                    </button>
                    <div class="dropdown-menu dropdown-menu-end">
                        <h6 class="dropdown-header">Bienvenue {{ auth()->user()->name ?? 'Admin' }} !</h6>
                        <a class="dropdown-item" href="{{ route('admin.settings.index') }}">
                            <i class="ri-settings-3-line text-muted fs-16 align-middle me-1"></i>
                            <span class="align-middle">Paramètres</span>
                        </a>
                        <div class="dropdown-divider"></div>
                        <form method="POST" action="{{ route('logout') }}">
                            @csrf
                            <button type="submit" class="dropdown-item">
                                <i class="ri-logout-box-r-line text-muted fs-16 align-middle me-1"></i>
                                <span class="align-middle">Déconnexion</span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</header>
