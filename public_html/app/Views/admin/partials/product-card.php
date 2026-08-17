<div class="admin-product-card" data-product-card>
  <div class="admin-product-card-top">
    <p class="admin-product-index">Product</p>
    <button type="button" class="text-btn js-remove-product">Remove</button>
  </div>
  <input type="hidden" name="product_id[<?= e((string) $pIndex) ?>]" value="<?= e($product['id'] ?? '') ?>">
  <div class="admin-product-fields">
    <label>Name <input name="product_name[<?= e((string) $pIndex) ?>]" value="<?= e($product['name'] ?? '') ?>" placeholder="Roma tomatoes"></label>
    <label>Category <input name="product_category[<?= e((string) $pIndex) ?>]" value="<?= e($product['category'] ?? '') ?>"></label>
    <label>Default unit <input name="product_unit[<?= e((string) $pIndex) ?>]" value="<?= e($product['unit'] ?? '') ?>" placeholder="kg"></label>
    <label>Price excl. VAT <input type="number" min="0" step="0.01" name="product_price_ex[<?= e((string) $pIndex) ?>]" value="<?= e((string) ($product['price_ex_vat'] ?? '')) ?>" class="js-price-ex"></label>
    <label>Price incl. VAT <input type="number" min="0" step="0.01" name="product_price_incl[<?= e((string) $pIndex) ?>]" value="<?= e((string) ($product['price_incl_vat'] ?? '')) ?>" class="js-price-incl"></label>
    <label class="span-2">Image URL <input name="product_image[<?= e((string) $pIndex) ?>]" value="<?= e($product['image'] ?? '') ?>"></label>
    <label class="span-2">Image description <input name="product_image_alt[<?= e((string) $pIndex) ?>]" value="<?= e($product['image_alt'] ?? '') ?>"></label>
  </div>
  <div class="admin-variations">
    <div class="admin-variations-heading">
      <div>
        <h3>Varieties</h3>
        <p class="muted small">Optional. Customers choose one before ordering.</p>
      </div>
      <button type="button" class="btn btn-ghost js-add-variation">Add variety</button>
    </div>
    <div class="admin-variation-list" data-variation-list>
      <?php foreach ($product['variations'] ?? [] as $vIndex => $variation): ?>
        <?php require __DIR__ . '/variation-card.php'; ?>
      <?php endforeach; ?>
    </div>
  </div>
</div>
