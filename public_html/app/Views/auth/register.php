<?php $old = $old ?? []; ?>
<div class="page-shell">
  <header class="page-intro">
    <h1>Register your kitchen</h1>
    <p>Fieldworx reviews new accounts before trade prices and ordering unlock.</p>
  </header>
  <?php if (!empty($error)): ?>
    <p class="admin-error"><?= e($error) ?></p>
  <?php endif; ?>
  <form method="post" action="<?= e(url('/register')) ?>" class="register-form">
    <?= csrf_field() ?>
    <section class="admin-panel">
      <h2>Login</h2>
      <div class="admin-grid">
        <label>Username <input name="username" required value="<?= e($old['username'] ?? '') ?>"></label>
        <label>Password <input type="password" name="password" required minlength="8"></label>
        <label>Confirm password <input type="password" name="password_confirm" required minlength="8"></label>
      </div>
    </section>
    <section class="admin-panel">
      <h2>Business</h2>
      <div class="admin-grid">
        <label>Registered business name <input name="registered_business_name" required value="<?= e($old['registered_business_name'] ?? '') ?>"></label>
        <label>Trading name <input name="trading_name" required value="<?= e($old['trading_name'] ?? '') ?>"></label>
        <label>VAT number <input name="vat_number" value="<?= e($old['vat_number'] ?? '') ?>"></label>
        <label>Registration number <input name="registration_number" value="<?= e($old['registration_number'] ?? '') ?>"></label>
        <label>Landline <input name="landline_number" value="<?= e($old['landline_number'] ?? '') ?>"></label>
      </div>
    </section>
    <section class="admin-panel">
      <h2>Buyer contact</h2>
      <div class="admin-grid">
        <label>Name <input name="buyer_name" required value="<?= e($old['buyer_name'] ?? '') ?>"></label>
        <label>Phone <input name="buyer_phone" required value="<?= e($old['buyer_phone'] ?? '') ?>"></label>
        <label class="span-2">Email <input type="email" name="buyer_email" required value="<?= e($old['buyer_email'] ?? '') ?>"></label>
      </div>
    </section>
    <section class="admin-panel">
      <h2>Accounts contact</h2>
      <div class="admin-grid">
        <label>Name <input name="accounts_name" required value="<?= e($old['accounts_name'] ?? '') ?>"></label>
        <label>Phone <input name="accounts_phone" required value="<?= e($old['accounts_phone'] ?? '') ?>"></label>
        <label class="span-2">Email <input type="email" name="accounts_email" required value="<?= e($old['accounts_email'] ?? '') ?>"></label>
      </div>
    </section>
    <section class="admin-panel">
      <h2>Delivery address</h2>
      <div class="admin-grid">
        <label class="span-2">Address line 1 <input name="address_line1" required value="<?= e($old['address_line1'] ?? '') ?>"></label>
        <label class="span-2">Address line 2 <input name="address_line2" value="<?= e($old['address_line2'] ?? '') ?>"></label>
        <label>City <input name="city" required value="<?= e($old['city'] ?? '') ?>"></label>
        <label>Province <input name="province" required value="<?= e($old['province'] ?? '') ?>"></label>
        <label>Postal code <input name="postal_code" required value="<?= e($old['postal_code'] ?? '') ?>"></label>
      </div>
    </section>
    <section class="admin-panel">
      <h2>Trading times</h2>
      <div class="trading-day">
        <?php foreach ($days as $key => $label): ?>
          <div class="admin-grid" style="margin-bottom:0.75rem">
            <strong><?= e($label) ?></strong>
            <label><input type="checkbox" name="day_closed[<?= e($key) ?>]" value="1"> Closed</label>
            <label>Open <input type="time" name="day_open[<?= e($key) ?>]" value="08:00"></label>
            <label>Close <input type="time" name="day_close[<?= e($key) ?>]" value="17:00"></label>
          </div>
        <?php endforeach; ?>
      </div>
      <label class="span-2">Notes
        <textarea name="trading_times_notes" rows="3"><?= e($old['trading_times_notes'] ?? '') ?></textarea>
      </label>
    </section>
    <button class="btn btn-primary" type="submit">Submit registration</button>
  </form>
</div>
