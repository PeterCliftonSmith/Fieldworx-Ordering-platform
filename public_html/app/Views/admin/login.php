<div class="admin-page" style="max-width:28rem;margin:4rem auto;padding:0 1rem">
  <p class="section-kicker">Fieldworx</p>
  <h1>Admin sign in</h1>
  <?php if (!empty($error)): ?><p class="admin-error"><?= e($error) ?></p><?php endif; ?>
  <form method="post" action="<?= e(url('/admin/login')) ?>" class="register-form">
    <?= csrf_field() ?>
    <input type="hidden" name="next" value="<?= e($next ?? '/admin') ?>">
    <label>Password <input type="password" name="password" required></label>
    <button class="btn btn-primary" type="submit">Sign in</button>
  </form>
</div>
