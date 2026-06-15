<!-- ========== FRILO App Menu ========== -->
<div class="app-menu navbar-menu">
    <!-- LOGO -->
    <div class="navbar-brand-box">
        <!-- Dark Logo-->
        <a href="{{ route('admin.dashboard') }}" class="logo logo-dark">
            <span class="logo-sm">
                <span class="fw-bold text-primary fs-18">F</span>
            </span>
            <span class="logo-lg">
                <span class="fw-bold text-primary fs-20">FRILO</span>
                <span class="text-muted fs-12 ms-1">Admin</span>
            </span>
        </a>
        <!-- Light Logo-->
        <a href="{{ route('admin.dashboard') }}" class="logo logo-light">
            <span class="logo-sm">
                <span class="fw-bold text-white fs-18">F</span>
            </span>
            <span class="logo-lg">
                <span class="fw-bold text-white fs-20">FRILO</span>
                <span class="text-white-50 fs-12 ms-1">Admin</span>
            </span>
        </a>
        <button type="button" class="btn btn-sm p-0 fs-20 header-item float-end btn-vertical-sm-hover" id="vertical-hover">
            <i class="ri-record-circle-line"></i>
        </button>
    </div>

    <div id="scrollbar">
        <div class="container-fluid">
            <ul class="navbar-nav" id="navbar-nav">

                <!-- Principal -->
                <li class="menu-title"><span>Principal</span></li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.dashboard') ? 'active' : '' }}"
                       href="{{ route('admin.dashboard') }}">
                        <i class="ri-dashboard-2-line"></i>
                        <span>Tableau de bord</span>
                    </a>
                </li>

                <!-- Gestion -->
                <li class="menu-title"><span>Gestion</span></li>

                <!-- Commandes -->
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.orders*') ? 'active' : '' }}"
                       href="{{ route('admin.orders.index') }}">
                        <i class="ri-shopping-bag-3-line"></i>
                        <span>Commandes</span>
                        @php $pendingCount = \App\Models\Order::where('status', 'pending')->count(); @endphp
                        @if($pendingCount > 0)
                            <span class="badge bg-danger rounded-pill ms-auto">{{ $pendingCount }}</span>
                        @endif
                    </a>
                </li>

                <!-- Templates -->
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.templates*') ? 'active' : '' }}"
                       href="{{ route('admin.templates.index') }}">
                        <i class="ri-layout-3-line"></i>
                        <span>Templates</span>
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.order-options*') ? 'active' : '' }}"
                       href="{{ route('admin.order-options.index') }}">
                        <i class="ri-price-tag-3-line"></i>
                        <span>Options de commande</span>
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.reviews*') ? 'active' : '' }}"
                       href="{{ route('admin.reviews.index') }}">
                        <i class="ri-star-smile-line"></i>
                        <span>Avis clients</span>
                        @php $pendingReviewCount = \App\Models\TemplateReview::where('status', 'pending')->count(); @endphp
                        @if($pendingReviewCount > 0)
                            <span class="badge bg-warning rounded-pill ms-auto">{{ $pendingReviewCount }}</span>
                        @endif
                    </a>
                </li>

                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.faqs*') ? 'active' : '' }}"
                       href="{{ route('admin.faqs.index') }}">
                        <i class="ri-question-answer-line"></i>
                        <span>FAQ</span>
                    </a>
                </li>

                <!-- Secteurs -->
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.sectors*') ? 'active' : '' }}"
                       href="{{ route('admin.sectors.index') }}">
                        <i class="ri-apps-2-line"></i>
                        <span>Secteurs</span>
                    </a>
                </li>

                <!-- Utilisateurs -->
                <li class="menu-title"><span>Utilisateurs</span></li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.clients*') ? 'active' : '' }}"
                       href="{{ route('admin.clients.index') }}">
                        <i class="ri-group-line"></i>
                        <span>Clients</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.contact-requests*') ? 'active' : '' }}"
                       href="{{ route('admin.contact-requests.index') }}">
                        <i class="ri-mail-open-line"></i>
                        <span>Contacts</span>
                        @php $newContactCount = \App\Models\ContactRequest::where('status', 'new')->count(); @endphp
                        @if($newContactCount > 0)
                            <span class="badge bg-warning rounded-pill ms-auto">{{ $newContactCount }}</span>
                        @endif
                    </a>
                </li>

                <li class="menu-title"><span>Plateforme</span></li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.content.pages*') ? 'active' : '' }}"
                       href="{{ route('admin.content.pages.index') }}">
                        <i class="ri-pages-line"></i>
                        <span>Contenu du site - Pages</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.content.history*') ? 'active' : '' }}"
                       href="{{ route('admin.content.history.index') }}">
                        <i class="ri-history-line"></i>
                        <span>Contenu du site - Historique</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.notifications*') ? 'active' : '' }}"
                       href="{{ route('admin.notifications.index') }}">
                        <i class="ri-notification-3-line"></i>
                        <span>Notifications</span>
                        @php $adminUnreadCount = auth()->user()?->unreadNotifications()->count() ?? 0; @endphp
                        @if($adminUnreadCount > 0)
                            <span class="badge bg-danger rounded-pill ms-auto">{{ $adminUnreadCount > 99 ? '99+' : $adminUnreadCount }}</span>
                        @endif
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.backups*') ? 'active' : '' }}"
                       href="{{ route('admin.backups.index') }}">
                        <i class="ri-database-2-line"></i>
                        <span>Sauvegardes</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.settings*') ? 'active' : '' }}"
                       href="{{ route('admin.settings.index') }}">
                        <i class="ri-settings-3-line"></i>
                        <span>Paramètres</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link menu-link {{ request()->routeIs('admin.audit-logs*') ? 'active' : '' }}"
                       href="{{ route('admin.audit-logs.index') }}">
                        <i class="ri-file-list-3-line"></i>
                        <span>Journal d'audit</span>
                    </a>
                </li>

            </ul>
        </div>
    </div>

    <div class="sidebar-background"></div>
</div>
<!-- Left Sidebar End -->
<div class="vertical-overlay"></div>
