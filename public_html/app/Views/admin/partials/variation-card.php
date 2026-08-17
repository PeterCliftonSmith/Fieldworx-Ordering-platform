<div class="admin-variation-card" data-variation-card>
  <div class="admin-product-card-top">
    <p class="admin-product-index">Variety</p>
    <button type="button" class="text-btn js-remove-variation">Remove</button>
  </div>
  <input type="hidden" name="variation_id[<?= e((string) $pIndex) ?>][<?= e((string) $vIndex) ?>]" value="<?= e($variation['id'] ?? '') ?>">
  <div class="admin-variation-fields">
    <label>Name <input name="variation_name[<?= e((string) $pIndex) ?>][<?= e((string) $vIndex) ?>]" value="<?= e($variation['name'] ?? '') ?>" placeholder="Grated"></label>
    <label>Unit <input name="variation_unit[<?= e((string) $pIndex) ?>][<?= e((string) $vIndex) ?>]" value="<?= e($variation['unit'] ?? '') ?>"></label>
    <label>Price excl. VAT <input type="number" min="0" step="0.01" name="variation_price_ex[<?= e((string) $pIndex) ?>][<?= e((string) $vIndex) ?>]" value="<?= e((string) ($variation['price_ex_vat'] ?? '')) ?>" class="js-price-ex"></label>
    <label>Price incl. VAT <input type="number" min="0" step="0.01" name="variation_price_incl[<?= e((string) $pIndex) ?>][<?= e((string) $vIndex) ?>]" value="<?= e((string) ($variation['price_incl_vat'] ?? '')) ?>" class="js-price-incl"></label>
    <label class="span-2">Image URL <input name="variation_image[<?= e((string) $pIndex) ?>][<?= e((string) $vIndex) ?>]" value="<?= e($variation['image'] ?? '') ?>"></label>
    <label class="span-2">Image description <input name="variation_image_alt[<?= e((string) $pIndex) ?>][<?= e((string) $vIndex) ?>]" value="<?= e($variation['image_alt'] ?? '') ?>"></label>
  </div>
</div>
