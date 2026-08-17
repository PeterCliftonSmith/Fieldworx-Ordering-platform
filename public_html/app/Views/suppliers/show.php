<?php
/** @var array $supplier */
/** @var array $products */
/** @var bool $showPrices */
?>
<div class="page-shell">
  <div class="page-intro">
    <p class="section-kicker"><a href="<?= e(url('/suppliers')) ?>">Suppliers</a> / <?= e($supplier['region']) ?></p>
  </div>

  <div class="catalog-layout">
    <div class="catalog-hero">
      <img src="<?= e($supplier['image']) ?>" alt="<?= e($supplier['image_alt']) ?>">
    </div>
    <div class="catalog-details">
      <h1><?= e($supplier['name']) ?></h1>
      <p class="muted"><?= e($supplier['specialty']) ?> · <?= e($supplier['lead_time']) ?></p>
      <p><?= e($supplier['blurb']) ?></p>

      <?php if (!$showPrices && $products): ?>
        <p class="price-gate-note">
          <a href="<?= e(url('/login?next=' . rawurlencode('/suppliers/' . $supplier['id']))) ?>">Sign in</a>
          to view trade prices and place an order.
        </p>
      <?php endif; ?>

      <?php if (!$products): ?>
        <p class="muted" style="margin-top:1.5rem">No products listed yet.</p>
      <?php else: ?>
        <div class="product-list">
          <?php foreach ($products as $product): ?>
            <?php
              $hasVariations = !empty($product['variations']);
              $first = $hasVariations ? $product['variations'][0] : null;
              $displayUnit = $first['unit'] ?? $product['unit'];
              $displayImage = ($first['image'] ?? '') ?: $product['image'];
              $displayAlt = ($first['image_alt'] ?? '') ?: ($product['image_alt'] ?: $product['name']);
              $displayEx = $showPrices ? ($first['price_ex_vat'] ?? $product['price_ex_vat']) : null;
              $displayIncl = $showPrices ? ($first['price_incl_vat'] ?? $product['price_incl_vat']) : null;
            ?>
            <article class="product-row" data-product-row
              data-product-id="<?= e($product['id']) ?>"
              data-product-name="<?= e($product['name']) ?>"
              data-supplier-id="<?= e($supplier['id']) ?>"
              data-supplier-name="<?= e($supplier['name']) ?>"
              data-base-unit="<?= e($product['unit']) ?>"
              data-base-image="<?= e($product['image']) ?>"
              data-base-image-alt="<?= e($product['image_alt']) ?>"
              data-base-ex="<?= e((string) ($product['price_ex_vat'] ?? '')) ?>"
              data-base-incl="<?= e((string) ($product['price_incl_vat'] ?? '')) ?>"
              data-show-prices="<?= $showPrices ? '1' : '0' ?>"
            >
              <div class="product-media">
                <?php if ($displayImage): ?>
                  <img class="js-product-image" src="<?= e($displayImage) ?>" alt="<?= e($displayAlt) ?>">
                <?php else: ?>
                  <div class="product-media-empty" aria-hidden="true"></div>
                <?php endif; ?>
              </div>
              <div class="product-copy">
                <p class="product-name"><?= e($product['name']) ?></p>
                <p class="muted small">
                  <?= e($product['category']) ?>
                  <?= $hasVariations ? ' · ' . count($product['variations']) . ' varieties' : ' · ' . e($product['unit']) ?>
                </p>
                <div class="product-prices">
                  <?php if ($showPrices && $displayEx !== null): ?>
                    <p><strong class="js-price-ex"><?= e(format_zar((float) $displayEx)) ?></strong> <span class="muted">excl. VAT</span></p>
                    <p class="muted small"><span class="js-price-incl"><?= e(format_zar((float) $displayIncl)) ?></span> incl. VAT · <span class="js-unit"><?= e($displayUnit) ?></span></p>
                  <?php else: ?>
                    <p class="muted small product-price-hidden">Sign in to view price<?= $hasVariations ? '' : ' · ' . e($displayUnit) ?></p>
                  <?php endif; ?>
                </div>
              </div>

              <?php if ($showPrices): ?>
                <div class="add-to-order">
                  <?php if ($hasVariations): ?>
                    <label class="variation-label">
                      Variety
                      <select class="variation-select js-variation">
                        <?php foreach ($product['variations'] as $variation): ?>
                          <option
                            value="<?= e($variation['id']) ?>"
                            data-name="<?= e($variation['name']) ?>"
                            data-unit="<?= e($variation['unit']) ?>"
                            data-image="<?= e($variation['image']) ?>"
                            data-image-alt="<?= e($variation['image_alt']) ?>"
                            data-ex="<?= e((string) $variation['price_ex_vat']) ?>"
                            data-incl="<?= e((string) $variation['price_incl_vat']) ?>"
                          >
                            <?= e($variation['name']) ?> · <?= e($variation['unit']) ?> · <?= e(format_zar((float) $variation['price_ex_vat'])) ?> excl
                          </option>
                        <?php endforeach; ?>
                      </select>
                    </label>
                  <?php endif; ?>
                  <label class="qty-label">
                    Qty
                    <input class="qty-input js-qty" type="number" min="1" value="1">
                  </label>
                  <button type="button" class="btn btn-primary js-add">Add to order</button>
                </div>
              <?php else: ?>
                <div class="add-to-order-locked">
                  <a class="btn btn-primary" href="<?= e(url('/login?next=' . rawurlencode('/suppliers/' . $supplier['id']))) ?>">Sign in to order</a>
                </div>
              <?php endif; ?>
            </article>
          <?php endforeach; ?>
        </div>
      <?php endif; ?>

      <p style="margin-top:1.5rem">
        <?php if ($showPrices): ?>
          <a class="btn btn-primary" href="<?= e(url('/order')) ?>">Review order</a>
        <?php else: ?>
          <a class="btn btn-primary" href="<?= e(url('/login?next=' . rawurlencode('/suppliers/' . $supplier['id']))) ?>">Sign in to view prices</a>
        <?php endif; ?>
      </p>
    </div>
  </div>
</div>
