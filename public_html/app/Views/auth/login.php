<div class="page-shell">
  <header class="page-intro">
    <h1>Sign in</h1>
    <p>Approved restaurant accounts can view trade prices and submit orders.</p>
  </header>
  <?php if (!empty($error)): ?>
    <p class="admin-error"><?= e($error) ?></p>
  <?php endif; ?>
  <form method="post" action="<?= e(url('/login')) ?>" class="register-form">
    <?= csrf_field() ?>
    <input type="hidden" name="next" value="<?= e($next ?? '/order') ?>">
    <label>
      Username
      <input name="username" required value="<?= e($username ?? '') ?>" autocomplete="username">
    </label>
    <label>
      Password
      <input type="password" name="password" required autocomplete="current-password">
    </label>
    <button class="btn btn-primary" type="submit">Sign in</button>
  </form>
</div>
