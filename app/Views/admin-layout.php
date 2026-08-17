<?php
/** @var string $content */
/** @var string $title */
$flash = flash_get();
$path = current_path();
?>
<!DOCTYPE html>
<html lang="en-ZA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title ?? 'Admin') ?> · Fieldworx Admin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(url('/assets/css/app.css')) ?>">
</head>
<body>
  <?php if (Auth::isAdmin() && $path !== '/admin/login'): ?>
  <div class="admin-shell">
    <header class="admin-header">
      <div class="admin-header-inner">
        <div class="admin-brand-block">
          <a href="<?= e(url('/admin')) ?>" class="brand-mark">Fieldworx</a>
          <span class="admin-badge">Admin</span>
        </div>
        <nav class="admin-nav">
          <a href="<?= e(url('/admin')) ?>">Suppliers</a>
          <a href="<?= e(url('/admin/registrations')) ?>">Registrations</a>
          <a href="<?= e(url('/admin/suppliers/new')) ?>">Add supplier</a>
          <a href="<?= e(url('/')) ?>">View site</a>
          <form method="post" action="<?= e(url('/admin/logout')) ?>" class="inline-form">
            <?= csrf_field() ?>
            <button type="submit" class="text-btn">Sign out</button>
          </form>
        </nav>
      </div>
    </header>
    <div class="admin-main">
      <?php if ($flash): ?>
        <p class="<?= $flash['type'] === 'success' ? 'admin-success' : 'admin-error' ?>"><?= e($flash['message']) ?></p>
      <?php endif; ?>
      <?= $content ?>
    </div>
  </div>
  <?php else: ?>
    <?= $content ?>
  <?php endif; ?>
  <script src="<?= e(url('/assets/js/admin-supplier.js')) ?>" defer></script>
</body>
</html>
