<div class="page-shell">
  <header class="page-intro">
    <h1>Order history</h1>
    <p>Submitted orders for your Fieldworx account.</p>
  </header>
  <?php if (!$orders): ?>
    <p class="muted">No orders yet. <a href="<?= e(url('/suppliers')) ?>">Browse suppliers</a>.</p>
  <?php else: ?>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Placed</th>
            <th>Status</th>
            <th>Total incl. VAT</th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($orders as $order): ?>
            <tr>
              <td><a href="<?= e(url('/orders/' . $order['id'])) ?>"><?= e($order['id']) ?></a></td>
              <td><?= e(date('Y-m-d H:i', strtotime($order['created_at']))) ?></td>
              <td><span class="status-pill status-<?= e($order['status']) ?>"><?= e($order['status']) ?></span></td>
              <td><?= e(format_zar((float) $order['total_incl_vat'])) ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
