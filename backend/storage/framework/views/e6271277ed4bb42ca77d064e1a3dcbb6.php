<!-- ========== FRILO App Menu ========== -->
<div class="app-menu navbar-menu">
    <!-- LOGO -->
    <div class="navbar-brand-box">
        <!-- Dark Logo-->
        <a href="<?php echo e(route('admin.dashboard')); ?>" class="logo logo-dark">
            <span class="logo-sm">
                <span class="fw-bold text-primary fs-18">F</span>
            </span>
            <span class="logo-lg">
                <span class="fw-bold text-primary fs-20">FRILO</span>
                <span class="text-muted fs-12 ms-1">Admin</span>
            </span>
        </a>
        <!-- Light Logo-->
        <a href="<?php echo e(route('admin.dashboard')); ?>" class="logo logo-light">
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
                    <a class="nav-link menu-link <?php echo e(request()->routeIs('admin.dashboard') ? 'active' : ''); ?>"
                       href="<?php echo e(route('admin.dashboard')); ?>">
                        <i class="ri-dashboard-2-line"></i>
                        <span>Tableau de bord</span>
                    </a>
                </li>

                <!-- Gestion -->
                <li class="menu-title"><span>Gestion</span></li>

                <!-- Commandes -->
                <li class="nav-item">
                    <a class="nav-link menu-link <?php echo e(request()->routeIs('admin.orders*') ? 'active' : ''); ?>"
                       href="<?php echo e(route('admin.orders.index')); ?>">
                        <i class="ri-shopping-bag-3-line"></i>
                        <span>Commandes</span>
                        <?php $pendingCount = \App\Models\Order::where('status', 'pending')->count(); ?>
                        <?php if($pendingCount > 0): ?>
                            <span class="badge bg-danger rounded-pill ms-auto"><?php echo e($pendingCount); ?></span>
                        <?php endif; ?>
                    </a>
                </li>

                <!-- Templates -->
                <li class="nav-item">
                    <a class="nav-link menu-link <?php echo e(request()->routeIs('admin.templates*') ? 'active' : ''); ?>"
                       href="<?php echo e(route('admin.templates.index')); ?>">
                        <i class="ri-layout-3-line"></i>
                        <span>Templates</span>
                    </a>
                </li>

                <!-- Secteurs -->
                <li class="nav-item">
                    <a class="nav-link menu-link <?php echo e(request()->routeIs('admin.sectors*') ? 'active' : ''); ?>"
                       href="<?php echo e(route('admin.sectors.index')); ?>">
                        <i class="ri-apps-2-line"></i>
                        <span>Secteurs</span>
                    </a>
                </li>

                <!-- Utilisateurs -->
                <li class="menu-title"><span>Utilisateurs</span></li>
                <li class="nav-item">
                    <a class="nav-link menu-link <?php echo e(request()->routeIs('admin.clients*') ? 'active' : ''); ?>"
                       href="<?php echo e(route('admin.clients.index')); ?>">
                        <i class="ri-group-line"></i>
                        <span>Clients</span>
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link menu-link <?php echo e(request()->routeIs('admin.contact-requests*') ? 'active' : ''); ?>"
                       href="<?php echo e(route('admin.contact-requests.index')); ?>">
                        <i class="ri-mail-open-line"></i>
                        <span>Contacts</span>
                        <?php $newContactCount = \App\Models\ContactRequest::where('status', 'new')->count(); ?>
                        <?php if($newContactCount > 0): ?>
                            <span class="badge bg-warning rounded-pill ms-auto"><?php echo e($newContactCount); ?></span>
                        <?php endif; ?>
                    </a>
                </li>

            </ul>
        </div>
    </div>

    <div class="sidebar-background"></div>
</div>
<!-- Left Sidebar End -->
<div class="vertical-overlay"></div>
<?php /**PATH /var/www/html/resources/views/layouts/sidebar.blade.php ENDPATH**/ ?>