<?php
    $template = $template ?? null;
    $previewPagesRaw = old('preview_pages_raw',
        collect($template?->preview_pages ?? [])
            ->map(function ($page) {
                $label = is_array($page) ? ($page['label'] ?? '') : '';
                $path = is_array($page) ? ($page['path'] ?? '/') : '/';
                return trim($label) !== '' ? trim($label) . '|' . ($path !== '' ? $path : '/') : null;
            })
            ->filter()
            ->implode("\n")
    );
    $previewGalleryRaw = old('preview_gallery_raw', implode("\n", $template?->preview_gallery ?? []));
?>

<div class="mb-3">
    <label class="form-label">Secteur <span class="text-danger">*</span></label>
    <select name="sector_id" class="form-select <?php $__errorArgs = ['sector_id'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" required>
        <option value="">-- Sélectionner --</option>
        <?php $__currentLoopData = $sectors; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $sector): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            <option value="<?php echo e($sector->id); ?>" <?php echo e(old('sector_id', $template?->sector_id) == $sector->id ? 'selected' : ''); ?>>
                <?php echo e($sector->name); ?>

            </option>
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </select>
    <?php $__errorArgs = ['sector_id'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
</div>

<div class="mb-3">
    <label class="form-label">Nom <span class="text-danger">*</span></label>
    <input type="text" name="name" class="form-control <?php $__errorArgs = ['name'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>"
           value="<?php echo e(old('name', $template?->name)); ?>" required>
    <?php $__errorArgs = ['name'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
</div>

<div class="mb-3">
    <label class="form-label">Description</label>
    <textarea name="description" class="form-control" rows="3"><?php echo e(old('description', $template?->description)); ?></textarea>
</div>

<div class="mb-3">
    <label class="form-label">Prix (FCFA) <span class="text-danger">*</span></label>
    <input type="number" name="price" class="form-control <?php $__errorArgs = ['price'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>"
           value="<?php echo e(old('price', $template?->price)); ?>" min="0" required>
    <?php $__errorArgs = ['price'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
</div>

<div class="mb-3">
    <label class="form-label">Fonctionnalités incluses (une par ligne)</label>
    <textarea name="features_raw" class="form-control" rows="4"
              placeholder="Menu digital&#10;Réservation en ligne&#10;Galerie photos"><?php echo e(old('features_raw', implode("\n", $template?->features ?? []))); ?></textarea>
    <div class="form-text">Chaque ligne devient un élément de la liste.</div>
</div>

<div class="mb-3">
    <label class="form-label">Thumbnail</label>
    <?php if($template?->full_thumbnail_url): ?>
        <div class="mb-2">
            <img src="<?php echo e($template->full_thumbnail_url); ?>" height="80" class="rounded border" alt="">
        </div>
    <?php endif; ?>
    <input type="file" name="thumbnail" class="form-control" accept="image/jpeg,image/png,image/webp">
    <div class="form-text">JPG, PNG ou WebP — max 2 Mo.</div>
</div>

<div class="mb-3">
    <label class="form-label">URL de prévisualisation</label>
    <input type="url" name="preview_url" class="form-control"
           value="<?php echo e(old('preview_url', $template?->preview_url)); ?>" placeholder="https://...">
    <div class="form-text">Lien vers la démo live (site interactif affiché dans l'espace client).</div>
</div>

<div class="mb-3">
    <label class="form-label">Pages de prévisualisation (une page par ligne)</label>
    <textarea name="preview_pages_raw" class="form-control <?php $__errorArgs = ['preview_pages_raw'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" rows="4"
              placeholder="Accueil|/&#10;Services|/services&#10;Contact|/contact"><?php echo e($previewPagesRaw); ?></textarea>
    <?php $__errorArgs = ['preview_pages_raw'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
    <div class="form-text">Format: <code>Titre|/chemin</code>. Exemple: <code>Tarifs|/tarifs</code>.</div>
</div>

<div class="mb-3">
    <label class="form-label">Galerie d'aperçu (une URL d'image par ligne)</label>
    <textarea name="preview_gallery_raw" class="form-control <?php $__errorArgs = ['preview_gallery_raw'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?> is-invalid <?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>" rows="4"
              placeholder="https://.../home.jpg&#10;https://.../about.jpg"><?php echo e($previewGalleryRaw); ?></textarea>
    <?php $__errorArgs = ['preview_gallery_raw'];
$__bag = $errors->getBag($__errorArgs[1] ?? 'default');
if ($__bag->has($__errorArgs[0])) :
if (isset($message)) { $__messageOriginal = $message; }
$message = $__bag->first($__errorArgs[0]); ?><div class="invalid-feedback"><?php echo e($message); ?></div><?php unset($message);
if (isset($__messageOriginal)) { $message = $__messageOriginal; }
endif;
unset($__errorArgs, $__bag); ?>
    <div class="form-text">Utilisée en fallback si la démo live n'est pas disponible.</div>
</div>

<div class="form-check form-switch mb-0">
    <input class="form-check-input" type="checkbox" name="is_active" value="1" id="is_active"
           <?php echo e(old('is_active', $template?->is_active ?? true) ? 'checked' : ''); ?>>
    <label class="form-check-label" for="is_active">Template actif (visible dans le catalogue)</label>
</div>
<?php /**PATH /var/www/html/resources/views/admin/templates/_form.blade.php ENDPATH**/ ?>