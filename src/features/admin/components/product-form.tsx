"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminRequest } from "@/features/admin/services/admin-client";
import {
  colorSwatchClass,
  isPaletteColor,
  PRODUCT_COLOR_OPTIONS,
} from "@/features/catalog/utils";
import { TEXTILE_SIZES } from "@/types/catalog";
import type { AdminCategory, AdminProduct, AdminVariant, ProductStatus } from "@/types/admin";

type VariantDraft = {
  id?: string;
  size: (typeof TEXTILE_SIZES)[number] | null;
  color: string;
  colorHex: string;
  sku: string;
  stockQuantity: number;
  unitPrice: number;
};

type ProductFormProps = {
  categories: AdminCategory[];
  product?: AdminProduct;
};

function uniqueColors(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))] as string[];
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(
    product?.category ?? categories[0]?.slug ?? "textile",
  );
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageUrl, setImageUrl] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color ?? "",
      colorHex: variant.colorHex ?? "#c8b4a0",
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      unitPrice: variant.unitPrice,
    })) ?? [
      { size: "M", color: "Noir", colorHex: "", sku: "", stockQuantity: 0, unitPrice: 0 },
    ],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customColorFor, setCustomColorFor] = useState<number | null>(null);
  const [extraColors, setExtraColors] = useState<string[]>(() =>
    uniqueColors(product?.variants.map((variant) => variant.color) ?? []),
  );

  const colorOptions = uniqueColors([...PRODUCT_COLOR_OPTIONS, ...extraColors]);

  function addImage() {
    if (!imageUrl.trim()) {
      return;
    }
    setImages((current) => [...current, imageUrl.trim()]);
    setImageUrl("");
  }

  async function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImages((current) => [...current, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        slug,
        description,
        category,
        status,
        featured,
        images,
        variants: variants.map((variant, index) => {
          const sku =
            variant.sku.trim() ||
            [slug || name, variant.size, variant.color, index + 1]
              .filter(Boolean)
              .join("-")
              .toUpperCase();
          return {
            ...variant,
            sku,
            color: variant.color || null,
            colorHex: isPaletteColor(variant.color) ? null : variant.colorHex || null,
          };
        }),
      };
      if (product) {
        const nextVariants: AdminVariant[] = payload.variants.map((variant, index) => {
          const current =
            product.variants.find((item) => item.id === variant.id) ??
            product.variants[index];
          return {
            id: variant.id ?? current?.id ?? `var_new_${index}`,
            productId: product.id,
            size: variant.size,
            color: variant.color,
            colorHex: variant.color && isPaletteColor(variant.color) ? null : variant.colorHex || null,
            sku: variant.sku,
            stockQuantity: variant.stockQuantity,
            unitPrice: variant.unitPrice,
            reservedQuantity: current?.reservedQuantity ?? 0,
            soldQuantity: current?.soldQuantity ?? 0,
            lowStockThreshold: current?.lowStockThreshold ?? 5,
            active: current?.active ?? true,
          };
        });
        await adminRequest(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          body: { ...payload, variants: nextVariants },
        });
      } else {
        await adminRequest("/api/admin/products", {
          method: "POST",
          body: payload,
        });
      }
      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Impossible d'enregistrer le produit.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex max-w-3xl flex-col gap-8">
      <section className="border border-tdev-anthracite bg-tdev-white p-5">
        <h2 className="font-headline text-lg font-extrabold uppercase">Général</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Input name="name" label="Nom" value={name} onChange={(e) => setName(e.target.value)} />
          <Input name="slug" label="Slug" value={slug} onChange={(e) => setSlug(e.target.value)} />
        </div>
        <label className="mt-4 block text-sm font-medium">
          Description
          <textarea
            className="mt-1.5 min-h-28 w-full border border-tdev-anthracite p-3"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label className="text-sm font-medium">
            Catégorie
            <select
              className="mt-1.5 h-[50px] w-full border border-tdev-anthracite px-3"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              {categories.filter((item) => item.active).map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Statut
            <select
              className="mt-1.5 h-[50px] w-full border border-tdev-anthracite px-3"
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-7 text-sm font-medium">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
            />
            Mis en avant
          </label>
        </div>
      </section>

      <section className="border border-tdev-anthracite bg-tdev-white p-5">
        <h2 className="font-headline text-lg font-extrabold uppercase">Images</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((src, index) => (
            <div key={`${src}-${index}`} className="relative size-24 border border-tdev-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="size-full object-cover" />
              <button
                type="button"
                className="absolute right-1 top-1 bg-tdev-white px-1 text-xs"
                onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <Input
            name="imageUrl"
            label="URL image"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
          />
          <Button type="button" className="self-end" onClick={addImage}>
            Ajouter
          </Button>
        </div>
        <input
          type="file"
          accept="image/*"
          className="mt-3 text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
        <p className="mt-2 text-xs text-tdev-muted">
          La première image devient l&apos;image principale. Stockage Cloudinary/S3 à brancher
          quand le backend le fournit.
        </p>
      </section>

      <section className="border border-tdev-anthracite bg-tdev-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-lg font-extrabold uppercase">Variantes</h2>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setVariants((current) => [
                ...current,
                { size: null, color: "", colorHex: "", sku: "", stockQuantity: 0, unitPrice: 0 },
              ])
            }
          >
            Ajouter
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div key={index} className="grid gap-2 border border-tdev-border p-3 sm:grid-cols-5">
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Taille
                <select
                  className="h-11 border border-tdev-anthracite px-2 text-sm font-normal"
                  value={variant.size ?? ""}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? {
                              ...item,
                              size: (event.target.value || null) as VariantDraft["size"],
                            }
                          : item,
                      ),
                    )
                  }
                >
                  <option value="">Sans taille</option>
                  {TEXTILE_SIZES.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Couleur
                <span className="flex items-center gap-2">
                  {variant.color && isPaletteColor(variant.color) ? (
                    <span
                      aria-hidden
                      className={`size-7 shrink-0 border border-tdev-anthracite ${colorSwatchClass(variant.color)}`}
                    />
                  ) : null}
                  {variant.color && !isPaletteColor(variant.color) ? (
                    <input
                      type="color"
                      aria-label={`Teinte ${variant.color}`}
                      className="size-9 shrink-0 cursor-pointer border border-tdev-anthracite bg-tdev-white p-0"
                      value={variant.colorHex || "#c8b4a0"}
                      onChange={(event) =>
                        setVariants((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, colorHex: event.target.value } : item,
                          ),
                        )
                      }
                    />
                  ) : null}
                  <select
                    className="h-11 min-w-0 flex-1 border border-tdev-anthracite px-2 text-sm font-normal"
                    value={customColorFor === index ? "__custom" : variant.color}
                    onChange={(event) => {
                      const value = event.target.value;
                      if (value === "__custom") {
                        setCustomColorFor(index);
                        return;
                      }
                      setCustomColorFor(null);
                      setVariants((current) =>
                        current.map((item, i) =>
                          i === index
                            ? {
                                ...item,
                                color: value,
                                colorHex: isPaletteColor(value) ? "" : item.colorHex || "#c8b4a0",
                              }
                            : item,
                        ),
                      );
                    }}
                  >
                    <option value="">Sans couleur</option>
                    {colorOptions.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                    <option value="__custom">Autre…</option>
                  </select>
                </span>
                {customColorFor === index ? (
                  <span className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="Choisir une teinte"
                      className="size-9 shrink-0 cursor-pointer border border-tdev-anthracite bg-tdev-white p-0"
                      defaultValue={variant.colorHex || "#c8b4a0"}
                      onChange={(event) =>
                        setVariants((current) =>
                          current.map((item, i) =>
                            i === index ? { ...item, colorHex: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="h-11 min-w-0 flex-1 border border-tdev-anthracite px-2 text-sm font-normal"
                      placeholder="Nom de la couleur"
                      autoFocus
                      onBlur={(event) => {
                        const next = event.target.value.trim();
                        if (!next) {
                          setCustomColorFor(null);
                          return;
                        }
                        setExtraColors((current) => uniqueColors([...current, next]));
                        setVariants((current) =>
                          current.map((item, i) =>
                            i === index
                              ? {
                                  ...item,
                                  color: next,
                                  colorHex: item.colorHex || "#c8b4a0",
                                }
                              : item,
                          ),
                        );
                        setCustomColorFor(null);
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                    />
                  </span>
                ) : null}
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                SKU
                <input
                  className="h-11 border border-tdev-anthracite px-2 text-sm font-normal"
                  placeholder="TEE-CORE-M-BLK"
                  value={variant.sku}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, sku: event.target.value } : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Stock
                <input
                  type="number"
                  min={0}
                  className="h-11 border border-tdev-anthracite px-2 text-sm font-normal"
                  placeholder="0"
                  value={variant.stockQuantity}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, stockQuantity: Number(event.target.value) }
                          : item,
                      ),
                    )
                  }
                />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-medium">
                Prix
                <input
                  type="number"
                  min={1}
                  className="h-11 border border-tdev-anthracite px-2 text-sm font-normal"
                  placeholder="8000"
                  value={variant.unitPrice}
                  onChange={(event) =>
                    setVariants((current) =>
                      current.map((item, i) =>
                        i === index
                          ? { ...item, unitPrice: Number(event.target.value) }
                          : item,
                      ),
                    )
                  }
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      {error ? (
        <p role="alert" className="text-sm text-tdev-orange">
          {error}
        </p>
      ) : null}
      <Button type="submit" variant="brand" size="lg" disabled={saving}>
        {saving ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
