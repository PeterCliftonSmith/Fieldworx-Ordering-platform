"use client";

import { useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { Product, ProductVariation, Supplier } from "@/data/types";
import { priceExFromIncl, priceInclFromEx } from "@/lib/format";

type VariationDraft = {
  key: string;
  id?: string;
  name: string;
  unit: string;
  image: string;
  imageAlt: string;
  priceExVat: string;
  priceInclVat: string;
};

type ProductDraft = {
  key: string;
  id?: string;
  name: string;
  unit: string;
  category: string;
  image: string;
  imageAlt: string;
  priceExVat: string;
  priceInclVat: string;
  variations: VariationDraft[];
};

type SupplierFormProps = {
  mode: "create" | "edit";
  initial?: Supplier;
};

function toVariationDrafts(
  variations: ProductVariation[] = [],
): VariationDraft[] {
  return variations.map((variation, index) => ({
    key: `${variation.id}-${index}`,
    id: variation.id,
    name: variation.name,
    unit: variation.unit,
    image: variation.image,
    imageAlt: variation.imageAlt,
    priceExVat: String(variation.priceExVat),
    priceInclVat: String(variation.priceInclVat),
  }));
}

function toDrafts(products: Product[] = []): ProductDraft[] {
  return products.map((product, index) => ({
    key: `${product.id}-${index}`,
    id: product.id,
    name: product.name,
    unit: product.unit,
    category: product.category,
    image: product.image,
    imageAlt: product.imageAlt,
    priceExVat: String(product.priceExVat),
    priceInclVat: String(product.priceInclVat),
    variations: toVariationDrafts(product.variations),
  }));
}

function newDraftKey(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

function emptyVariation(defaults?: {
  unit?: string;
  priceExVat?: string;
  priceInclVat?: string;
}): VariationDraft {
  return {
    key: newDraftKey("var"),
    name: "",
    unit: defaults?.unit ?? "",
    image: "",
    imageAlt: "",
    priceExVat: defaults?.priceExVat ?? "",
    priceInclVat: defaults?.priceInclVat ?? "",
  };
}

function emptyProduct(): ProductDraft {
  return {
    key: newDraftKey("new"),
    name: "",
    unit: "",
    category: "",
    image: "",
    imageAlt: "",
    priceExVat: "",
    priceInclVat: "",
    variations: [],
  };
}

function variationHasAnyContent(variation: VariationDraft) {
  return Boolean(
    variation.name.trim() ||
      variation.unit.trim() ||
      variation.image.trim() ||
      variation.imageAlt.trim() ||
      variation.priceExVat.trim() ||
      variation.priceInclVat.trim(),
  );
}

function buildProductsPayload(products: ProductDraft[]) {
  const namedProducts = products.filter((product) => product.name.trim());
  if (namedProducts.length === 0) {
    throw new Error("Add at least one product before saving.");
  }

  return namedProducts.map((product, productIndex) => {
    const label = product.name.trim() || `Product #${productIndex + 1}`;
    if (!product.unit.trim()) {
      throw new Error(`Unit is required for ${label}.`);
    }
    if (
      product.priceExVat.trim() === "" ||
      product.priceInclVat.trim() === "" ||
      !Number.isFinite(Number(product.priceExVat)) ||
      !Number.isFinite(Number(product.priceInclVat))
    ) {
      throw new Error(
        `Valid excl. and incl. VAT prices are required for ${label}.`,
      );
    }

    const startedVariations = product.variations.filter(variationHasAnyContent);
    const variations = startedVariations.map((variation, variationIndex) => {
      const variationLabel =
        variation.name.trim() || `variety #${variationIndex + 1}`;
      const unit = variation.unit.trim() || product.unit.trim();
      const priceExRaw =
        variation.priceExVat.trim() === ""
          ? product.priceExVat
          : variation.priceExVat;
      const priceInclRaw =
        variation.priceInclVat.trim() === ""
          ? product.priceInclVat
          : variation.priceInclVat;

      if (!variation.name.trim()) {
        throw new Error(
          `${label}: give variety #${variationIndex + 1} a name, or remove it.`,
        );
      }
      if (!unit) {
        throw new Error(`${label}: unit is required for ${variationLabel}.`);
      }
      if (
        !Number.isFinite(Number(priceExRaw)) ||
        !Number.isFinite(Number(priceInclRaw))
      ) {
        throw new Error(
          `${label}: valid prices are required for ${variationLabel}.`,
        );
      }

      return {
        id: variation.id,
        name: variation.name.trim(),
        unit,
        image: variation.image.trim(),
        imageAlt: variation.imageAlt.trim() || variation.name.trim(),
        priceExVat: Number(priceExRaw),
        priceInclVat: Number(priceInclRaw),
      };
    });

    return {
      id: product.id,
      name: product.name.trim(),
      unit: product.unit.trim(),
      category: product.category.trim(),
      image: product.image.trim(),
      imageAlt: product.imageAlt.trim() || product.name.trim(),
      priceExVat: Number(product.priceExVat),
      priceInclVat: Number(product.priceInclVat),
      variations,
    };
  });
}

export function SupplierForm({ mode, initial }: SupplierFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [specialty, setSpecialty] = useState(initial?.specialty ?? "");
  const [leadTime, setLeadTime] = useState(initial?.leadTime ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt ?? "");
  const [blurb, setBlurb] = useState(initial?.blurb ?? "");
  const [products, setProducts] = useState<ProductDraft[]>(() => {
    const drafts = toDrafts(initial?.products);
    return drafts.length ? drafts : [emptyProduct()];
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const title = useMemo(
    () =>
      mode === "create" ? "Add supplier" : `Edit ${initial?.name ?? "supplier"}`,
    [mode, initial?.name],
  );

  function updateProduct(key: string, patch: Partial<ProductDraft>) {
    setProducts((current) =>
      current.map((product) =>
        product.key === key ? { ...product, ...patch } : product,
      ),
    );
  }

  function updatePrice(
    key: string,
    field: "priceExVat" | "priceInclVat",
    value: string,
  ) {
    setProducts((current) =>
      current.map((product) => {
        if (product.key !== key) return product;
        const next = { ...product, [field]: value };
        const amount = Number(value);
        if (!Number.isFinite(amount) || value.trim() === "") return next;
        if (field === "priceExVat") {
          next.priceInclVat = String(priceInclFromEx(amount));
        } else {
          next.priceExVat = String(priceExFromIncl(amount));
        }
        return next;
      }),
    );
  }

  function updateVariation(
    productKey: string,
    variationKey: string,
    patch: Partial<VariationDraft>,
  ) {
    setProducts((current) =>
      current.map((product) => {
        if (product.key !== productKey) return product;
        return {
          ...product,
          variations: product.variations.map((variation) =>
            variation.key === variationKey
              ? { ...variation, ...patch }
              : variation,
          ),
        };
      }),
    );
  }

  function updateVariationPrice(
    productKey: string,
    variationKey: string,
    field: "priceExVat" | "priceInclVat",
    value: string,
  ) {
    setProducts((current) =>
      current.map((product) => {
        if (product.key !== productKey) return product;
        return {
          ...product,
          variations: product.variations.map((variation) => {
            if (variation.key !== variationKey) return variation;
            const next = { ...variation, [field]: value };
            const amount = Number(value);
            if (!Number.isFinite(amount) || value.trim() === "") return next;
            if (field === "priceExVat") {
              next.priceInclVat = String(priceInclFromEx(amount));
            } else {
              next.priceExVat = String(priceExFromIncl(amount));
            }
            return next;
          }),
        };
      }),
    );
  }

  function addVariation(productKey: string) {
    setProducts((current) =>
      current.map((product) =>
        product.key === productKey
          ? {
              ...product,
              variations: [
                ...product.variations,
                emptyVariation({
                  unit: product.unit,
                  priceExVat: product.priceExVat,
                  priceInclVat: product.priceInclVat,
                }),
              ],
            }
          : product,
      ),
    );
  }

  function removeVariation(productKey: string, variationKey: string) {
    setProducts((current) =>
      current.map((product) =>
        product.key === productKey
          ? {
              ...product,
              variations: product.variations.filter(
                (variation) => variation.key !== variationKey,
              ),
            }
          : product,
      ),
    );
  }

  function removeProduct(key: string) {
    setProducts((current) => {
      const next = current.filter((product) => product.key !== key);
      return next.length ? next : [emptyProduct()];
    });
  }

  function preventAccidentalSubmit(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    const target = event.target as HTMLElement;
    if (target.tagName === "TEXTAREA") return;
    if (target.tagName === "BUTTON") return;
    // Enter inside inputs used to submit early and drop unfinished varieties.
    event.preventDefault();
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);

    try {
      const productPayload = buildProductsPayload(products);
      const varietyCount = productPayload.reduce(
        (total, product) => total + product.variations.length,
        0,
      );

      const payload = {
        name,
        region,
        specialty,
        leadTime,
        image,
        imageAlt,
        blurb,
        products: productPayload,
      };

      const response = await fetch(
        mode === "create"
          ? "/api/admin/suppliers"
          : `/api/admin/suppliers/${initial!.id}`,
        {
          method: mode === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = (await response.json()) as {
        error?: string;
        supplier?: Supplier;
      };
      if (!response.ok || !data.supplier) {
        throw new Error(data.error || "Could not save supplier.");
      }

      // Keep the editor open and reload from disk so saved varieties are visible.
      setProducts(toDrafts(data.supplier.products));
      setName(data.supplier.name);
      setRegion(data.supplier.region);
      setSpecialty(data.supplier.specialty);
      setLeadTime(data.supplier.leadTime);
      setImage(data.supplier.image);
      setImageAlt(data.supplier.imageAlt);
      setBlurb(data.supplier.blurb);
      setSuccess(
        varietyCount > 0
          ? `Saved ${data.supplier.name} with ${varietyCount} ${varietyCount === 1 ? "variety" : "varieties"}.`
          : `Saved ${data.supplier.name}.`,
      );
      window.scrollTo({ top: 0, behavior: "smooth" });

      if (mode === "create") {
        router.replace(`/admin/suppliers/${data.supplier.id}`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save supplier.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!initial || mode !== "edit") return;
    const confirmed = window.confirm(
      `Remove ${initial.name} and all of its products from Fieldworx?`,
    );
    if (!confirmed) return;

    setDeleting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/suppliers/${initial.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not delete supplier.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete supplier.",
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form
      className="admin-form"
      onSubmit={handleSubmit}
      onKeyDown={preventAccidentalSubmit}
    >
      <div className="admin-form-header">
        <div>
          <p className="section-kicker">Catalogue admin</p>
          <h1>{title}</h1>
        </div>
        <div className="admin-form-actions">
          {mode === "edit" ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={deleting || saving}
            >
              {deleting ? "Removing…" : "Remove supplier"}
            </button>
          ) : null}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || deleting}
          >
            {saving ? "Saving…" : "Save supplier"}
          </button>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {success ? <p className="admin-success">{success}</p> : null}

      <section className="admin-panel">
        <h2>Supplier details</h2>
        <div className="admin-grid">
          <label>
            Name
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label>
            Region
            <input
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            />
          </label>
          <label>
            Specialty
            <input
              required
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          </label>
          <label>
            Lead time
            <input
              required
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              placeholder="Next-day delivery"
            />
          </label>
          <label className="span-2">
            Image URL
            <input
              required
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://..."
            />
          </label>
          <label className="span-2">
            Image description
            <input
              required
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
            />
          </label>
          <label className="span-2">
            Short description
            <textarea
              required
              rows={3}
              value={blurb}
              onChange={(e) => setBlurb(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <h2>Products</h2>
            <p className="muted small">
              Enter either VAT price and the other fills in at 15%. Add varieties
              when the same product is sold in different forms (for example loaf
              vs grated cheese). Use Save supplier when all varieties are filled
              in — Enter in a field will not submit.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() =>
              setProducts((current) => [...current, emptyProduct()])
            }
          >
            Add product
          </button>
        </div>

        <div className="admin-product-list">
          {products.map((product, index) => (
            <div className="admin-product-card" key={product.key}>
              <div className="admin-product-card-top">
                <p className="admin-product-index">Product #{index + 1}</p>
                <button
                  type="button"
                  className="text-btn"
                  onClick={() => removeProduct(product.key)}
                >
                  Remove
                </button>
              </div>

              <div className="admin-product-layout">
                <div className="admin-product-preview">
                  {product.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.image}
                      alt={product.imageAlt || product.name || "Product"}
                    />
                  ) : (
                    <div className="admin-product-preview-empty">No image</div>
                  )}
                </div>

                <div className="admin-product-fields">
                  <label>
                    Name
                    <input
                      value={product.name}
                      onChange={(e) =>
                        updateProduct(product.key, { name: e.target.value })
                      }
                      placeholder="Roma tomatoes"
                    />
                  </label>
                  <label>
                    Category
                    <input
                      value={product.category}
                      onChange={(e) =>
                        updateProduct(product.key, {
                          category: e.target.value,
                        })
                      }
                      placeholder="Vegetables"
                    />
                  </label>
                  <label>
                    Default unit
                    <input
                      value={product.unit}
                      onChange={(e) =>
                        updateProduct(product.key, { unit: e.target.value })
                      }
                      placeholder="kg"
                    />
                  </label>
                  <label>
                    Price excl. VAT (ZAR)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.priceExVat}
                      onChange={(e) =>
                        updatePrice(product.key, "priceExVat", e.target.value)
                      }
                      placeholder="28.50"
                    />
                  </label>
                  <label>
                    Price incl. VAT (ZAR)
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.priceInclVat}
                      onChange={(e) =>
                        updatePrice(
                          product.key,
                          "priceInclVat",
                          e.target.value,
                        )
                      }
                      placeholder="32.78"
                    />
                  </label>
                  <label className="span-2">
                    Product image URL
                    <input
                      value={product.image}
                      onChange={(e) =>
                        updateProduct(product.key, { image: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </label>
                  <label className="span-2">
                    Image description
                    <input
                      value={product.imageAlt}
                      onChange={(e) =>
                        updateProduct(product.key, {
                          imageAlt: e.target.value,
                        })
                      }
                      placeholder="Roma tomatoes in a crate"
                    />
                  </label>
                </div>
              </div>

              <div className="admin-variations">
                <div className="admin-variations-heading">
                  <div>
                    <h3>Varieties</h3>
                    <p className="muted small">
                      Optional. New varieties start with this product&apos;s unit
                      and prices — change any that differ. Each named variety is
                      saved.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => addVariation(product.key)}
                  >
                    Add variety
                  </button>
                </div>

                {product.variations.length === 0 ? (
                  <p className="muted small">
                    No varieties — sold as a single item.
                  </p>
                ) : (
                  <div className="admin-variation-list">
                    {product.variations.map((variation, variationIndex) => (
                      <div
                        className="admin-variation-card"
                        key={variation.key}
                      >
                        <div className="admin-product-card-top">
                          <p className="admin-product-index">
                            Variety #{variationIndex + 1}
                          </p>
                          <button
                            type="button"
                            className="text-btn"
                            onClick={() =>
                              removeVariation(product.key, variation.key)
                            }
                          >
                            Remove
                          </button>
                        </div>
                        <div className="admin-variation-fields">
                          <label>
                            Name
                            <input
                              value={variation.name}
                              onChange={(e) =>
                                updateVariation(product.key, variation.key, {
                                  name: e.target.value,
                                })
                              }
                              placeholder="Grated"
                            />
                          </label>
                          <label>
                            Unit
                            <input
                              value={variation.unit}
                              onChange={(e) =>
                                updateVariation(product.key, variation.key, {
                                  unit: e.target.value,
                                })
                              }
                              placeholder="kg"
                            />
                          </label>
                          <label>
                            Price excl. VAT
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={variation.priceExVat}
                              onChange={(e) =>
                                updateVariationPrice(
                                  product.key,
                                  variation.key,
                                  "priceExVat",
                                  e.target.value,
                                )
                              }
                            />
                          </label>
                          <label>
                            Price incl. VAT
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={variation.priceInclVat}
                              onChange={(e) =>
                                updateVariationPrice(
                                  product.key,
                                  variation.key,
                                  "priceInclVat",
                                  e.target.value,
                                )
                              }
                            />
                          </label>
                          <label className="span-2">
                            Image URL (optional)
                            <input
                              value={variation.image}
                              onChange={(e) =>
                                updateVariation(product.key, variation.key, {
                                  image: e.target.value,
                                })
                              }
                              placeholder="Leave blank to use product image"
                            />
                          </label>
                          <label className="span-2">
                            Image description
                            <input
                              value={variation.imageAlt}
                              onChange={(e) =>
                                updateVariation(product.key, variation.key, {
                                  imageAlt: e.target.value,
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </form>
  );
}
