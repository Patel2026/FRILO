<?php $__env->startSection('title'); ?> Nouveau template <?php $__env->stopSection(); ?>

<?php $__env->startSection('content'); ?>
<div class="row">
    <div class="col-12">
        <div class="page-title-box d-sm-flex align-items-center justify-content-between">
            <h4 class="mb-sm-0">Nouveau template</h4>
            <a href="<?php echo e(route('admin.templates.index')); ?>" class="btn btn-soft-secondary btn-sm">
                <i class="ri-arrow-left-line me-1"></i> Retour
            </a>
        </div>
    </div>
</div>

<div class="row">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-body">
                <form action="<?php echo e(route('admin.templates.store')); ?>" method="POST" enctype="multipart/form-data">
                    <?php echo csrf_field(); ?>
                    <?php echo $__env->make('admin.templates._form', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>
                    <div class="mt-4">
                        <button type="submit" class="btn btn-primary">Créer le template</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.master', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /var/www/html/resources/views/admin/templates/create.blade.php ENDPATH**/ ?>