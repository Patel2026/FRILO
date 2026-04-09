<?php $__env->startSection('title'); ?> Templates <?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Templates</h4>
            <a href="<?php echo e(route('admin.templates.create')); ?>" class="btn btn-primary btn-sm">
                <i class="ri-add-line me-1"></i> Nouveau template
            </a>
        </div>
    </div>
</div>

<?php if(session('success')): ?>
    <div class="alert alert-success alert-dismissible fade show">
        <?php echo e(session('success')); ?>

        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
<?php endif; ?>

<div class="card">
    <div class="card-body">
        <div class="table-responsive">
            <table class="table table-nowrap align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Nom</th>
                        <th>Secteur</th>
                        <th>Prix (FCFA)</th>
                        <th>Actif</th>
                        <th>Commandes</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php $__empty_1 = true; $__currentLoopData = $templates; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $template): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); $__empty_1 = false; ?>
                    <tr>
                        <td>
                            <div class="d-flex align-items-center gap-2">
                                <?php if($template->full_thumbnail_url): ?>
                                    <img src="<?php echo e($template->full_thumbnail_url); ?>" height="40" class="rounded" alt="">
                                <?php endif; ?>
                                <div>
                                    <strong><?php echo e($template->name); ?></strong>
                                    <div class="text-muted small"><?php echo e($template->slug); ?></div>
                                </div>
                            </div>
                        </td>
                        <td><?php echo e($template->sector->name ?? '—'); ?></td>
                        <td><?php echo e(number_format($template->price, 0, ',', ' ')); ?></td>
                        <td>
                            <span class="badge badge-soft-<?php echo e($template->is_active ? 'success' : 'danger'); ?>">
                                <?php echo e($template->is_active ? 'Actif' : 'Inactif'); ?>

                            </span>
                        </td>
                        <td><?php echo e($template->orders_count ?? 0); ?></td>
                        <td>
                            <a href="<?php echo e(route('admin.templates.edit', $template)); ?>" class="btn btn-sm btn-soft-primary me-1">
                                <i class="ri-edit-line"></i>
                            </a>
                            <form action="<?php echo e(route('admin.templates.destroy', $template)); ?>" method="POST" class="d-inline"
                                  onsubmit="return confirm('Désactiver ce template ?')">
                                <?php echo csrf_field(); ?> <?php echo method_field('DELETE'); ?>
                                <button class="btn btn-sm btn-soft-danger"><i class="ri-delete-bin-line"></i></button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); if ($__empty_1): ?>
                    <tr><td colspan="6" class="text-center text-muted py-4">Aucun template.</td></tr>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
        <div class="mt-3"><?php echo e($templates->links()); ?></div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.master', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /var/www/html/resources/views/admin/templates/index.blade.php ENDPATH**/ ?>