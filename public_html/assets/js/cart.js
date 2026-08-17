(() => {
  const STORAGE_KEY = "fieldworx-order-draft-v4";
  const VAT = 0.15;

  function money(n) {
    return Math.round((Number(n) + Number.EPSILON) * 100) / 100;
  }

  function formatZar(n) {
    return "R" + money(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function readCart() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function writeCart(lines) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    updateBadge(lines);
  }

  function lineKey(line) {
    return line.variation_id
      ? `${line.supplier_id}:${line.product_id}:${line.variation_id}`
      : `${line.supplier_id}:${line.product_id}`;
  }

  function updateBadge(lines = readCart()) {
    const el = document.getElementById("cart-count");
    if (!el) return;
    const count = lines.reduce((sum, line) => sum + Number(line.quantity || 0), 0);
    if (count > 0) {
      el.hidden = false;
      el.textContent = String(count);
    } else {
      el.hidden = true;
      el.textContent = "";
    }
  }

  function addItem(item) {
    const lines = readCart();
    const key = lineKey(item);
    const existing = lines.find((line) => lineKey(line) === key);
    if (existing) {
      existing.quantity += item.quantity;
      Object.assign(existing, item, { quantity: existing.quantity });
    } else {
      lines.push(item);
    }
    writeCart(lines);
  }

  function bindCatalogue() {
    document.querySelectorAll("[data-product-row]").forEach((row) => {
      const variation = row.querySelector(".js-variation");
      const qty = row.querySelector(".js-qty");
      const addBtn = row.querySelector(".js-add");
      if (!addBtn) return;

      const syncVariation = () => {
        if (!variation) return;
        const opt = variation.selectedOptions[0];
        if (!opt) return;
        const img = row.querySelector(".js-product-image");
        const ex = row.querySelector(".js-price-ex");
        const incl = row.querySelector(".js-price-incl");
        const unit = row.querySelector(".js-unit");
        if (img && opt.dataset.image) {
          img.src = opt.dataset.image;
          img.alt = opt.dataset.imageAlt || opt.dataset.name || "";
        }
        if (ex) ex.textContent = formatZar(opt.dataset.ex);
        if (incl) incl.textContent = formatZar(opt.dataset.incl);
        if (unit) unit.textContent = opt.dataset.unit || "";
      };

      variation?.addEventListener("change", syncVariation);

      addBtn.addEventListener("click", () => {
        const opt = variation?.selectedOptions?.[0];
        const quantity = Math.max(1, Number(qty?.value || 1));
        const item = {
          supplier_id: row.dataset.supplierId,
          supplier_name: row.dataset.supplierName,
          product_id: row.dataset.productId,
          name: row.dataset.productName,
          variation_id: opt?.value || undefined,
          variation_name: opt?.dataset.name || undefined,
          unit: opt?.dataset.unit || row.dataset.baseUnit,
          image: opt?.dataset.image || row.dataset.baseImage || "",
          image_alt: opt?.dataset.imageAlt || row.dataset.baseImageAlt || row.dataset.productName,
          price_ex_vat: Number(opt?.dataset.ex || row.dataset.baseEx || 0),
          price_incl_vat: Number(opt?.dataset.incl || row.dataset.baseIncl || 0),
          quantity,
        };
        addItem(item);
        addBtn.textContent = "Added";
        window.setTimeout(() => {
          addBtn.textContent = "Add to order";
        }, 1200);
      });
    });
  }

  function renderOrderPage() {
    const root = document.getElementById("order-root");
    if (!root || !window.FIELDWORX_ORDER_PAGE) return;

    const submitUrl = root.dataset.submitUrl;

    const render = () => {
      const lines = readCart();
      if (!lines.length) {
        root.innerHTML = `
          <div class="order-empty">
            <h2>Your order is empty</h2>
            <p>Browse suppliers and add the lines your kitchen needs.</p>
            <a class="btn btn-primary" href="/suppliers">Browse suppliers</a>
          </div>`;
        return;
      }

      const groups = new Map();
      for (const line of lines) {
        if (!groups.has(line.supplier_id)) {
          groups.set(line.supplier_id, { name: line.supplier_name, lines: [] });
        }
        groups.get(line.supplier_id).lines.push(line);
      }

      let subtotalEx = 0;
      let totalIncl = 0;
      let html = "";
      for (const [supplierId, group] of groups.entries()) {
        html += `<section class="order-supplier-group"><h2><a href="/suppliers/${supplierId}">${escapeHtml(group.name)}</a></h2><ul class="order-lines">`;
        for (const line of group.lines) {
          subtotalEx += line.price_ex_vat * line.quantity;
          totalIncl += line.price_incl_vat * line.quantity;
          const key = lineKey(line);
          html += `<li data-key="${escapeHtml(key)}">
            <div class="order-line-main"><div class="order-line-media">
              ${line.image ? `<img src="${escapeHtml(line.image)}" alt="">` : ""}
              <div>
                <p class="order-line-name">${escapeHtml(line.name)}</p>
                ${line.variation_name ? `<p class="order-line-variation">${escapeHtml(line.variation_name)}</p>` : ""}
                <p class="muted">${formatZar(line.price_ex_vat)} excl / ${formatZar(line.price_incl_vat)} incl · ${escapeHtml(line.unit)}</p>
              </div>
            </div></div>
            <div class="order-line-actions">
              <input class="qty-input js-line-qty" type="number" min="1" value="${line.quantity}">
              <div class="order-line-total">
                <p>${formatZar(line.price_ex_vat * line.quantity)} excl</p>
                <p class="muted small">${formatZar(line.price_incl_vat * line.quantity)} incl</p>
              </div>
              <button type="button" class="text-btn js-remove-line">Remove</button>
            </div>
          </li>`;
        }
        html += `</ul></section>`;
      }

      subtotalEx = money(subtotalEx);
      totalIncl = money(totalIncl);
      const vat = money(totalIncl - subtotalEx);

      html += `<div class="order-summary">
        <div class="order-summary-row"><span>Subtotal excl. VAT</span><strong>${formatZar(subtotalEx)}</strong></div>
        <div class="order-summary-row muted"><span>VAT</span><span>${formatZar(vat)}</span></div>
        <div class="order-summary-row order-summary-total"><span>Total incl. VAT</span><strong>${formatZar(totalIncl)}</strong></div>
        <p class="admin-error" id="order-error" hidden></p>
        <div class="order-summary-actions">
          <button type="button" class="btn btn-primary" id="submit-order">Submit order</button>
          <button type="button" class="btn btn-ghost" id="clear-order">Clear draft</button>
          <a class="btn btn-ghost" href="/orders">Order history</a>
        </div>
      </div>`;

      root.innerHTML = html;

      root.querySelectorAll(".js-line-qty").forEach((input) => {
        input.addEventListener("change", () => {
          const key = input.closest("li").dataset.key;
          const next = readCart().map((line) =>
            lineKey(line) === key
              ? { ...line, quantity: Math.max(1, Number(input.value) || 1) }
              : line,
          );
          writeCart(next);
          render();
        });
      });

      root.querySelectorAll(".js-remove-line").forEach((btn) => {
        btn.addEventListener("click", () => {
          const key = btn.closest("li").dataset.key;
          writeCart(readCart().filter((line) => lineKey(line) !== key));
          render();
        });
      });

      root.querySelector("#clear-order")?.addEventListener("click", () => {
        writeCart([]);
        render();
      });

      root.querySelector("#submit-order")?.addEventListener("click", async () => {
        const errorEl = root.querySelector("#order-error");
        errorEl.hidden = true;
        try {
          const response = await fetch(submitUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ lines: readCart() }),
          });
          const data = await response.json();
          if (!response.ok || !data.order) {
            throw new Error(data.error || "Could not submit order.");
          }
          writeCart([]);
          window.location.assign(`/orders/${encodeURIComponent(data.order.id)}`);
        } catch (err) {
          errorEl.textContent = err.message || "Could not submit order.";
          errorEl.hidden = false;
        }
      });
    };

    render();
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateBadge();
    bindCatalogue();
    renderOrderPage();
  });
})();
