<?php /** @var array $registration */ ?>
<div class="admin-page">
  <div class="admin-page-header">
    <div>
      <p class="section-kicker"><a href="<?= e(url('/admin/registrations')) ?>">Registrations</a></p>
      <h1><?= e($registration['trading_name']) ?></h1>
      <p><span class="status-pill status-<?= e($registration['status']) ?>"><?= e($registration['status']) ?></span></p>
    </div>
    <?php if ($registration['status'] === 'pending'): ?>
      <div class="admin-form-actions">
        <form method="post" action="<?= e(url('/admin/registrations/' . $registration['id'])) ?>">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="approve">
          <button class="btn btn-primary" type="submit">Approve</button>
        </form>
        <form method="post" action="<?= e(url('/admin/registrations/' . $registration['id'])) ?>">
          <?= csrf_field() ?>
          <input type="hidden" name="action" value="reject">
          <button class="btn btn-danger" type="submit">Reject</button>
        </form>
      </div>
    <?php endif; ?>
  </div>

  <dl class="detail-list">
    <div><dt>Username</dt><dd><?= e($registration['username']) ?></dd></div>
    <div><dt>Registered business</dt><dd><?= e($registration['registered_business_name']) ?></dd></div>
    <div><dt>VAT</dt><dd><?= e($registration['vat_number'] ?: '—') ?></dd></div>
    <div><dt>Buyer</dt><dd><?= e($registration['buyer_name']) ?> · <?= e($registration['buyer_phone']) ?> · <?= e($registration['buyer_email']) ?></dd></div>
    <div><dt>Accounts</dt><dd><?= e($registration['accounts_name']) ?> · <?= e($registration['accounts_phone']) ?> · <?= e($registration['accounts_email']) ?></dd></div>
    <div><dt>Delivery</dt><dd><?= e($registration['address_line1']) ?>, <?= e($registration['city']) ?>, <?= e($registration['province']) ?> <?= e($registration['postal_code']) ?></dd></div>
  </dl>
</div>
