<div class="page-shell">
  <header class="page-intro">
    <h1>Current order</h1>
    <p>Review lines from your draft, then submit to Fieldworx.</p>
  </header>
  <div id="order-root" data-submit-url="<?= e(url('/api/orders')) ?>">
    <p class="muted">Loading your draft order…</p>
  </div>
</div>
<script>
  window.FIELDWORX_ORDER_PAGE = true;
</script>
