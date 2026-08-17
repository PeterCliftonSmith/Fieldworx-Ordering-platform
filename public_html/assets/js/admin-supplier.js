(() => {
  const VAT = 0.15;
  const productList = document.getElementById("product-list");
  const productTemplate = document.getElementById("product-template");
  const variationTemplate = document.getElementById("variation-template");
  if (!productList || !productTemplate || !variationTemplate) return;

  function money(n) {
    return (Math.round(n * 100) / 100).toFixed(2);
  }

  function nextProductIndex() {
    return productList.querySelectorAll("[data-product-card]").length;
  }

  function reindex() {
    productList.querySelectorAll("[data-product-card]").forEach((card, pIndex) => {
      card.querySelectorAll("[name]").forEach((input) => {
        input.name = input.name
          .replace(/product_([a-z_]+)\[\d+]/, `product_$1[${pIndex}]`)
          .replace(/variation_([a-z_]+)\[\d+\]/, `variation_$1[${pIndex}]`);
      });
      card.querySelectorAll("[data-variation-card]").forEach((vCard, vIndex) => {
        vCard.querySelectorAll("[name]").forEach((input) => {
          input.name = input.name.replace(
            /variation_([a-z_]+)\[(\d+)\]\[\d+\]/,
            `variation_$1[${pIndex}][${vIndex}]`,
          );
        });
      });
    });
  }

  function bindPrice(scope) {
    scope.querySelectorAll(".js-price-ex").forEach((input) => {
      input.addEventListener("input", () => {
        const card = input.closest(".admin-product-fields, .admin-variation-fields");
        const incl = card?.querySelector(".js-price-incl");
        const amount = Number(input.value);
        if (!incl || !Number.isFinite(amount) || input.value.trim() === "") return;
        incl.value = money(amount * (1 + VAT));
      });
    });
    scope.querySelectorAll(".js-price-incl").forEach((input) => {
      input.addEventListener("input", () => {
        const card = input.closest(".admin-product-fields, .admin-variation-fields");
        const ex = card?.querySelector(".js-price-ex");
        const amount = Number(input.value);
        if (!ex || !Number.isFinite(amount) || input.value.trim() === "") return;
        ex.value = money(amount / (1 + VAT));
      });
    });
  }

  document.getElementById("add-product")?.addEventListener("click", () => {
    const html = productTemplate.innerHTML.replaceAll("__INDEX__", String(nextProductIndex()));
    productList.insertAdjacentHTML("beforeend", html);
    bindPrice(productList.lastElementChild);
    reindex();
  });

  productList.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    if (target.classList.contains("js-remove-product")) {
      const cards = productList.querySelectorAll("[data-product-card]");
      if (cards.length <= 1) {
        target.closest("[data-product-card]")?.querySelectorAll("input, textarea").forEach((el) => {
          if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.value = "";
        });
        return;
      }
      target.closest("[data-product-card]")?.remove();
      reindex();
      return;
    }

    if (target.classList.contains("js-add-variation")) {
      const card = target.closest("[data-product-card]");
      const list = card?.querySelector("[data-variation-list]");
      if (!card || !list) return;
      const pIndex = [...productList.querySelectorAll("[data-product-card]")].indexOf(card);
      const unit = card.querySelector('input[name^="product_unit"]')?.value || "";
      const ex = card.querySelector('input[name^="product_price_ex"]')?.value || "";
      const incl = card.querySelector('input[name^="product_price_incl"]')?.value || "";
      const vIndex = list.querySelectorAll("[data-variation-card]").length;
      let html = variationTemplate.innerHTML
        .replaceAll("__PINDEX__", String(pIndex))
        .replaceAll("__VINDEX__", String(vIndex));
      list.insertAdjacentHTML("beforeend", html);
      const created = list.lastElementChild;
      const unitInput = created.querySelector('input[name*="variation_unit"]');
      const exInput = created.querySelector('input[name*="variation_price_ex"]');
      const inclInput = created.querySelector('input[name*="variation_price_incl"]');
      if (unitInput) unitInput.value = unit;
      if (exInput) exInput.value = ex;
      if (inclInput) inclInput.value = incl;
      bindPrice(created);
      return;
    }

    if (target.classList.contains("js-remove-variation")) {
      target.closest("[data-variation-card]")?.remove();
      reindex();
    }
  });

  // Prevent Enter from submitting while editing fields.
  document.getElementById("supplier-form")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const tag = event.target instanceof HTMLElement ? event.target.tagName : "";
    if (tag === "TEXTAREA" || tag === "BUTTON") return;
    event.preventDefault();
  });

  bindPrice(productList);
})();
