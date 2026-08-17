<?php
$bySupplier = [];
foreach ($order['lines'] as $line) {
    $bySupplier[$line['supplier_id']]['name'] = $line['supplier_name'];
    $bySupplier[$line['supplier_id']]['lines'][] = $line;
}
?>
<div class="page-shell">
  <header class="page-intro">
    <p class="section-kicker"><a href="<?= e(url('/orders')) ?>">Order history</a></p>
    <h1><?= e($order['id']) ?></h1>
    <p>
      Placed <?= e(date('Y-m-d H:i', strtotime($order['created_at']))) ?> ·
      <span class="status-pill status-<?= e($order['status']) ?>"><?= e($order['status']) ?></span>
    </p>
  </header>
  <div class="order-draft">
    <?php foreach ($bySupplier as $supplierId => $group): ?>
      <section class="order-supplier-group">
        <h2><a href="<?= e(url('/suppliers/' . $supplierId)) ?>"><?= e($group['name']) ?></a></h2>
        <ul class="order-lines">
          <?php foreach ($group['lines'] as $line): ?>
            <li>
              <div class="order-line-main">
                <div class="order-line-media">
                  <?php if ($line['image']): ?>
                    <img src="<?= e($line['image']) ?>" alt="<?= e($line['image_alt']) ?>">
                  <?php endif; ?>
                  <div>
                    <p class="order-line-name"><?= e($line['name']) ?></p>
                    <?php if (!empty($line['variation_name'])): ?>
                      <p class="order-line-variation"><?= e($line['variation_name']) ?></p>
                    <?php endif; ?>
                    <p class="muted">
                      Qty <?= (int) $line['quantity'] ?> · <?= e($line['unit']) ?> ·
                      <?= e(format_zar((float) $line['price_ex_vat'])) ?> excl /
                      <?= e(format_zar((float) $line['price_incl_vat'])) ?> incl
                    </p>
                  </div>
                </div>
              </div>
              <div class="order-line-total">
                <p><?= e(format_zar((float) $line['price_ex_vat'] * (int) $line['quantity'])) ?> excl</p>
                <p class="muted small"><?= e(format_zar((float) $line['price_incl_vat'] * (int) $line['quantity'])) ?> incl</p>
              </div>
            </li>
          <?php endforeach; ?>
        </ul>
      </section>
    <?php endforeach; ?>
    <div class="order-summary">
      <div class="order-summary-row"><span>Subtotal excl. VAT</span><strong><?= e(format_zar((float) $order['subtotal_ex_vat'])) ?></strong></div>
      <div class="order-summary-row muted"><span>VAT</span><span><?= e(format_zar((float) $order['vat_total'])) ?></span></div>
      <div class="order-summary-row order-summary-total"><span>Total incl. VAT</span><strong><?= e(format_zar((float) $order['total_incl_vat'])) ?></strong></div>
      <div class="order-summary-actions">
        <a class="btn btn-ghost" href="<?= e(url('/orders')) ?>">Back to history</a>
        <a class="btn btn-primary" href="<?= e(url('/order')) ?>">Start a new order</a>
      </div>
    </div>
  </div>
</div>
