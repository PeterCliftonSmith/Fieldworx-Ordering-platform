<?php
$products = $supplier['products'] ?? [];
if (!$products) {
    $products = [[
        'id' => '',
        'name' => '',
        'unit' => '',
        'category' => '',
        'image' => '',
        'image_alt' => '',
        'price_ex_vat' => '',
        'price_incl_vat' => '',
        'variations' => [],
    ]];
}
$action = $mode === 'edit'
    ? url('/admin/suppliers/' . $supplier['id'])
    : url('/admin/suppliers/new');
?>
<form class="admin-form" method="post" action="<?= e($action) ?>" id="supplier-form">
  <?= csrf_field() ?>
  <div class="admin-form-header">
    <div>
      <p class="section-kicker">Catalogue admin</p>
      <h1><?= e($title) ?></h1>
    </div>
    <div class="admin-form-actions">
      <?php if ($mode === 'edit'): ?>
        <button formaction="<?= e(url('/admin/suppliers/' . $supplier['id'] . '/delete')) ?>" formmethod="post" type="submit" class="btn btn-danger" onclick="return confirm('Remove this supplier?')">Remove supplier</button>
      <?php endif; ?>
      <button type="submit" class="btn btn-primary">Save supplier</button>
    </div>
  </div>

  <?php if (!empty($error)): ?><p class="admin-error"><?= e($error) ?></p><?php endif; ?>

  <section class="admin-panel">
    <h2>Supplier details</h2>
    <div class="admin-grid">
      <label>Name <input name="name" required value="<?= e($supplier['name'] ?? '') ?>"></label>
      <label>Region <input name="region" required value="<?= e($supplier['region'] ?? '') ?>"></label>
      <label>Specialty <input name="specialty" required value="<?= e($supplier['specialty'] ?? '') ?>"></label>
      <label>Lead time <input name="lead_time" required value="<?= e($supplier['lead_time'] ?? '') ?>"></label>
      <label class="span-2">Image URL <input name="image" required value="<?= e($supplier['image'] ?? '') ?>"></label>
      <label class="span-2">Image description <input name="image_alt" required value="<?= e($supplier['image_alt'] ?? '') ?>"></label>
      <label class="span-2">Short description <textarea name="blurb" rows="3" required><?= e($supplier['blurb'] ?? '') ?></textarea></label>
    </div>
  </section>

  <section class="admin-panel">
    <div class="admin-panel-heading">
      <div>
        <h2>Products</h2>
        <p class="muted small">Add varieties when the same item is sold in different forms (loaf vs grated). New varieties inherit unit/price from the product.</p>
      </div>
      <button type="button" class="btn btn-ghost" id="add-product">Add product</button>
    </div>
    <div class="admin-product-list" id="product-list">
      <?php foreach ($products as $pIndex => $product): ?>
        <?php require __DIR__ . '/partials/product-card.php'; ?>
      <?php endforeach; ?>
    </div>
  </section>
</form>

<template id="product-template">
  <?php
    $pIndex = '__INDEX__';
    $product = [
      'id' => '', 'name' => '', 'unit' => '', 'category' => '',
      'image' => '', 'image_alt' => '', 'price_ex_vat' => '', 'price_incl_vat' => '',
      'variations' => [],
    ];
    require __DIR__ . '/partials/product-card.php';
  ?>
</template>

<template id="variation-template">
  <?php
    $pIndex = '__PINDEX__';
    $vIndex = '__VINDEX__';
    $variation = [
      'id' => '', 'name' => '', 'unit' => '', 'image' => '', 'image_alt' => '',
      'price_ex_vat' => '', 'price_incl_vat' => '',
    ];
    require __DIR__ . '/partials/variation-card.php';
  ?>
</template>
