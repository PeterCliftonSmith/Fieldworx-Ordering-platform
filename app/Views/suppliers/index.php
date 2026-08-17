<div class="page-shell">
  <header class="page-intro">
    <h1>Suppliers</h1>
    <p>Choose a supplier, add lines for your service week, and send one clear order through Fieldworx.</p>
  </header>
  <div class="supplier-list section" style="padding-top:0">
    <?php if (!$suppliers): ?>
      <p class="muted">No suppliers published yet.</p>
    <?php endif; ?>
    <?php foreach ($suppliers as $supplier): ?>
      <article class="supplier-row">
        <div class="supplier-image">
          <img src="<?= e($supplier['image']) ?>" alt="<?= e($supplier['image_alt']) ?>">
        </div>
        <div class="supplier-copy">
          <p class="supplier-meta"><?= e($supplier['specialty']) ?> · <?= e($supplier['region']) ?></p>
          <h2 class="supplier-name"><?= e($supplier['name']) ?></h2>
          <p class="supplier-blurb"><?= e($supplier['blurb']) ?></p>
          <p class="muted small"><?= e($supplier['lead_time']) ?></p>
          <a class="btn btn-primary" href="<?= e(url('/suppliers/' . $supplier['id'])) ?>">Open catalogue</a>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</div>
