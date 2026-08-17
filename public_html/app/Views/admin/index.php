<div class="admin-page">
  <div class="admin-page-header">
    <div>
      <p class="section-kicker">Catalogue admin</p>
      <h1>Suppliers</h1>
    </div>
    <a class="btn btn-primary" href="<?= e(url('/admin/suppliers/new')) ?>">Add supplier</a>
  </div>
  <?php if (!$suppliers): ?>
    <p class="muted">No suppliers yet.</p>
  <?php else: ?>
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Region</th>
            <th>Specialty</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <?php foreach ($suppliers as $supplier): ?>
            <tr>
              <td><?= e($supplier['name']) ?></td>
              <td><?= e($supplier['region']) ?></td>
              <td><?= e($supplier['specialty']) ?></td>
              <td><a href="<?= e(url('/admin/suppliers/' . $supplier['id'])) ?>">Edit</a></td>
            </tr>
          <?php endforeach; ?>
        </tbody>
      </table>
    </div>
  <?php endif; ?>
</div>
