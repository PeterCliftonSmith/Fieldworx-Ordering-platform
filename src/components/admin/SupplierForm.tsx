"use client";

import { useMemo, useState, type FormEvent } from "react";
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

function emptyVariation(): VariationDraft {
  return {
    key: `var-${Math.random().toString(36).slice(2, 9)}`,
    name: "",
    unit: "",
    image: "",
    imageAlt: "",
    priceExVat: "",
    priceInclVat: "",
  };
}

function emptyProduct(): ProductDraft {
  return {
    key: `new-${Math.random().toString(36).slice(2, 9)}`,
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

export function SupplierForm({ mode, initial }: SupplierFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [specialty, setSpecialty] = useState(initial?.specialty ?? "");
  const [leadTime, setLeadTime] = useState(initial?.leadTime ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.imageAlt ?? "");
  const [blurb, setBlurb] = useState(initial?.blurb ?? "");
  const [products, setProducts] = useState<ProductDraft[]>(
    toDrafts(initial?.products).length
      ? toDrafts(initial?.products)
      : [emptyProduct()],
  );
  const [error, setError] = useState<string | null>(null);
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
              variations: [...product.variations, emptyVariation()],
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      name,
      region,
      specialty,
      leadTime,
      image,
      imageAlt,
      blurb,
      products: products
        .filter((product) => product.name.trim())
        .map((product) => ({
          id: product.id,
          name: product.name,
          unit: product.unit,
          category: product.category,
          image: product.image,
          imageAlt: product.imageAlt || product.name,
          priceExVat: Number(product.priceExVat),
          priceInclVat: Number(product.priceInclVat),
          variations: product.variations
            .filter((variation) => variation.name.trim())
            .map((variation) => ({
              id: variation.id,
              name: variation.name,
              unit: variation.unit,
              image: variation.image,
              imageAlt: variation.imageAlt || variation.name,
              priceExVat: Number(variation.priceExVat),
              priceInclVat: Number(variation.priceInclVat),
            })),
        })),
    };

    try {
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
      if (!response.ok) {
        throw new Error(data.error || "Could not save supplier.");
      }
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save supplier.");
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
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
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
              vs grated cheese).
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
                      Optional. When added, customers choose one before ordering.
                      Each variety can have its own unit, price, and image.
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
                  <p className="muted small">No varieties — sold as a single item.</p>
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
