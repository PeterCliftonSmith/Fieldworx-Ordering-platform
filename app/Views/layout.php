<?php
/** @var string $content */
/** @var string $title */
$customer = Auth::customer();
$path = current_path();
$flash = flash_get();
?>
<!DOCTYPE html>
<html lang="en-ZA">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title ?? 'Fieldworx') ?> · Fieldworx</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Sora:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="<?= e(url('/assets/css/app.css')) ?>">
</head>
<body>
  <header class="site-header">
    <div class="site-header-inner">
      <a href="<?= e(url('/')) ?>" class="brand-mark" aria-label="Fieldworx home">Fieldworx</a>
      <nav class="site-nav" aria-label="Primary">
        <a class="nav-link<?= str_starts_with($path, '/suppliers') ? ' active' : '' ?>" href="<?= e(url('/suppliers')) ?>">Suppliers</a>
        <a class="nav-link<?= $path === '/how-it-works' ? ' active' : '' ?>" href="<?= e(url('/how-it-works')) ?>">How it works</a>
        <a class="nav-link<?= $path === '/register' ? ' active' : '' ?>" href="<?= e(url('/register')) ?>">Register</a>
        <a class="nav-link<?= $path === '/order' ? ' active' : '' ?>" href="<?= e(url('/order')) ?>">
          Order <span class="cart-count" id="cart-count" hidden></span>
        </a>
        <?php if ($customer): ?>
          <a class="nav-link<?= str_starts_with($path, '/orders') ? ' active' : '' ?>" href="<?= e(url('/orders')) ?>">My orders</a>
          <span class="nav-user" title="<?= e($customer['tradingName']) ?>"><?= e($customer['username']) ?></span>
          <form method="post" action="<?= e(url('/logout')) ?>" class="inline-form">
            <?= csrf_field() ?>
            <button type="submit" class="nav-link nav-button">Sign out</button>
          </form>
        <?php else: ?>
          <a class="nav-link<?= $path === '/login' ? ' active' : '' ?>" href="<?= e(url('/login')) ?>">Sign in</a>
        <?php endif; ?>
      </nav>
    </div>
  </header>

  <main>
    <?php if ($flash): ?>
      <div class="page-shell" style="padding-top:1rem">
        <p class="<?= $flash['type'] === 'success' ? 'admin-success' : 'admin-error' ?>"><?= e($flash['message']) ?></p>
      </div>
    <?php endif; ?>
    <?= $content ?>
  </main>

  <footer class="site-footer">
    <div class="site-footer-inner">
      <div>
        <p class="footer-brand">Fieldworx</p>
        <p class="footer-copy">Ordering between restaurants and suppliers — without the back-and-forth.</p>
      </div>
      <div class="footer-links">
        <a href="<?= e(url('/suppliers')) ?>">Browse suppliers</a>
        <a href="<?= e(url('/how-it-works')) ?>">How it works</a>
        <a href="<?= e(url('/register')) ?>">Register</a>
        <a href="<?= e(url('/login')) ?>">Sign in</a>
        <a href="<?= e(url('/order')) ?>">Current order</a>
        <a href="<?= e(url('/orders')) ?>">Order history</a>
      </div>
    </div>
  </footer>
  <script src="<?= e(url('/assets/js/cart.js')) ?>" defer></script>
</body>
</html>
