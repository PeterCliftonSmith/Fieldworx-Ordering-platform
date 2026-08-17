<section class="hero">
  <div class="hero-media">
    <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1800&q=80" alt="Restaurant kitchen plating">
    <div class="hero-scrim" aria-hidden="true"></div>
  </div>
  <div class="hero-content page-shell">
    <p class="hero-brand">Fieldworx</p>
    <h1 class="hero-headline">Restaurant ordering, one clear list</h1>
    <p class="hero-support">Connect with trusted suppliers and build kitchen orders without the back-and-forth.</p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="<?= e(url('/suppliers')) ?>">Browse suppliers</a>
      <a class="btn btn-ghost" href="<?= e(url('/how-it-works')) ?>">How it works</a>
    </div>
  </div>
</section>

<section class="section page-shell">
  <div class="section-heading">
    <p class="section-kicker">Suppliers</p>
    <h2>Start with kitchens we already stock</h2>
  </div>
  <div class="supplier-list">
    <?php foreach ($suppliers as $supplier): ?>
      <article class="supplier-row">
        <div class="supplier-image">
          <img src="<?= e($supplier['image']) ?>" alt="<?= e($supplier['image_alt']) ?>">
        </div>
        <div class="supplier-copy">
          <p class="supplier-meta"><?= e($supplier['region']) ?> · <?= e($supplier['lead_time']) ?></p>
          <h3 class="supplier-name"><?= e($supplier['name']) ?></h3>
          <p class="supplier-blurb"><?= e($supplier['blurb']) ?></p>
          <a class="btn btn-primary" href="<?= e(url('/suppliers/' . $supplier['id'])) ?>">View catalogue</a>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
  <p style="margin-top:1.5rem">
    <a class="btn btn-ghost" href="<?= e(url('/suppliers')) ?>">See all suppliers</a>
  </p>
</section>
