<?php $__env->startSection('title'); ?> Commande #<?php echo e(str_pad($order->id, 5, '0', STR_PAD_LEFT)); ?> <?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Commande #<?php echo e(str_pad($order->id, 5, '0', STR_PAD_LEFT)); ?></h4>
            <a href="<?php echo e(route('admin.orders.index')); ?>" class="btn btn-soft-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Retour
            </a>
        </div>
    </div>
</div>

<?php if(session('success')): ?>
    <div class="alert alert-success alert-dismissible fade show" role="alert">
        <?php echo e(session('success')); ?>

        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<?php endif; ?>

<div class="row">
    
    <div class="col-lg-4">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Statut de la commande</h5></div>
            <div class="card-body">
                <div class="mb-3">
                    <span class="badge badge-soft-<?php echo e(match($order->status->value) {
                        'pending' => 'warning',
                        'processing' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        default => 'secondary'
                    }); ?> fs-14">
                        <?php echo e($order->status->label()); ?>

                    </span>
                </div>

                <?php $transitions = $order->status->allowedTransitions(); ?>
                <?php if(count($transitions)): ?>
                    <hr>
                    <p class="text-muted mb-2 fw-medium">Changer le statut :</p>
                    <?php $__currentLoopData = $transitions; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $next): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <form action="<?php echo e(route('admin.orders.status', $order)); ?>" method="POST" class="mb-2">
                        <?php echo csrf_field(); ?>
                        <?php echo method_field('PATCH'); ?>
                        <input type="hidden" name="status" value="<?php echo e($next->value); ?>">
                        <button type="submit" class="btn btn-soft-<?php echo e(match($next->value) {
                            'processing' => 'info',
                            'completed' => 'success',
                            'cancelled' => 'danger',
                            default => 'secondary'
                        }); ?> w-100">
                            → <?php echo e($next->label()); ?>

                        </button>
                    </form>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                <?php else: ?>
                    <p class="text-muted fst-italic mt-2 mb-0">Statut final — aucune transition possible.</p>
                <?php endif; ?>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Template commandé</h5></div>
            <div class="card-body">
                <p class="mb-1"><strong><?php echo e($order->template->name ?? '—'); ?></strong></p>
                <p class="mb-1 text-muted"><?php echo e($order->template->sector->name ?? '—'); ?></p>
                <p class="mb-0 fw-semibold text-primary"><?php echo e(number_format($order->price, 0, ',', ' ')); ?> FCFA <small class="text-muted fw-normal">(prix au moment de la commande)</small></p>
            </div>
        </div>
    </div>

    
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Client</h5></div>
            <div class="card-body">
                <p class="mb-1"><i class="ri-user-line me-1 text-muted"></i> <?php echo e($order->user->name ?? '—'); ?></p>
                <p class="mb-0"><i class="ri-mail-line me-1 text-muted"></i> <?php echo e($order->user->email ?? '—'); ?></p>
            </div>
        </div>

        <div class="card">
            <div class="card-header"><h5 class="card-title mb-0">Instructions de personnalisation</h5></div>
            <div class="card-body">
                <?php if($order->instruction): ?>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-medium">Nom de l'entreprise</label>
                            <p><?php echo e($order->instruction->enterprise_name ?: '—'); ?></p>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label text-muted fw-medium">Couleurs souhaitées</label>
                            <div class="d-flex gap-2 flex-wrap">
                                <?php $__empty_1 = true; $__currentLoopData = $order->instruction->colors ?? []; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $color): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                                    <span class="badge" style="background: <?php echo e($color); ?>; color: #fff;"><?php echo e($color); ?></span>
                                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                                    <span class="text-muted">—</span>
                                <?php endif; ?>
                            </div>
                        </div>
                        <div class="col-12">
                            <label class="form-label text-muted fw-medium">Description de l'activité</label>
                            <p><?php echo e($order->instruction->activity_description ?: '—'); ?></p>
                        </div>
                        <div class="col-12">
                            <label class="form-label text-muted fw-medium">Instructions spécifiques</label>
                            <p><?php echo e($order->instruction->specific_instructions ?: '—'); ?></p>
                        </div>
                    </div>
                <?php else: ?>
                    <p class="text-muted fst-italic">Aucune instruction renseignée.</p>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.master', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /var/www/html/resources/views/admin/orders/show.blade.php ENDPATH**/ ?>