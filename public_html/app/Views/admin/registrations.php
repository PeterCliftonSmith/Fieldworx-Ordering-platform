<div class="admin-page">
  <div class="admin-page-header">
    <div>
      <p class="section-kicker">Customers</p>
      <h1>Registrations</h1>
    </div>
  </div>
  <?php if (!$registrations): ?>
    <p class="muted">No registrations yet.</p>
  <?php else: ?>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Trading name</th>
            <th>Username</th>
            <th>Status</th>
            <th>Submitted</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($registrations as $registration): ?>
            <tr>
              <td><?= e($registration['trading_name']) ?></td>
              <td><?= e($registration['username']) ?></td>
              <td><span class="status-pill status-<?= e($registration['status']) ?>"><?= e($registration['status']) ?></span></td>
              <td><?= e(date('Y-m-d H:i', strtotime($registration['created_at']))) ?></td>
              <td><a href="<?= e(url('/admin/registrations/' . $registration['id'])) ?>">Open</a></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
