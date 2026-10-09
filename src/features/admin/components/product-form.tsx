"use client";

import { FormEvent, useId, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, buttonClassName } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminRequest } from "@/features/admin/services/admin-client";
import {
  colorSwatchClass,
  isPaletteColor,
  PRODUCT_COLOR_OPTIONS,
} from "@/features/catalog/utils";
import { cn } from "@/lib/utils/cn";
import { TEXTILE_SIZES } from "@/types/catalog";
import type { AdminCategory, AdminProduct, AdminVariant, ProductStatus } from "@/types/admin";

/** Aligné sur `max:5120` (Ko) côté API Laravel. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_MESSAGE = "L’image ne doit pas dépasser 5 Mo.";

type VariantDraft = {
  id?: string;
  size: (typeof TEXTILE_SIZES)[number] | null;
  color: string;
  colorHex: string;
  imageUrl: string;
  sku: string;
  stockQuantity: number;
  unitPrice: number;
};

type ProductFormProps = {
  categories: AdminCategory[];
  product?: AdminProduct;
};

type ImageFilePickerProps = {
  label: string;
  onFile: (file: File) => void;
  className?: string;
};

function ImageFilePicker({ label, onFile, className }: ImageFilePickerProps) {
  const id = useId();

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <input
        id={id}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            onFile(file);
          }
          event.target.value = "";
        }}
      />
      <label
        htmlFor={id}
        className={buttonClassName(
          "secondary",
          "md",
          "w-full cursor-pointer border-2 border-dashed border-tdev-anthracite bg-tdev-surface hover:bg-tdev-white sm:w-auto",
        )}
      >
        {label}
      </label>
    </div>
  );
}

function uniqueColors(values: Array<string | null | undefined>): string[] {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean))] as string[];
}

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function makeSku(name: string, size: string | null, color: string, index: number): string {
  const parts = [name, size, color, String(index + 1)]
    .filter(Boolean)
    .map((part) => slugify(String(part)).replace(/-/g, "").toUpperCase());
  return parts.join("-").slice(0, 100) || `PRODUCT-${index + 1}`;
}

function initialColorImages(product?: AdminProduct): Record<string, string> {
  const map: Record<string, string> = {};
  for (const variant of product?.variants ?? []) {
    if (variant.color && variant.imageUrl && !map[variant.color]) {
      map[variant.color] = variant.imageUrl;
    }
  }
  return map;
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Lecture image impossible."));
      }
    };
    reader.onerror = () => reject(new Error("Lecture image impossible."));
    reader.readAsDataURL(file);
  });
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const routeProductId =
    typeof params.id === "string" && params.id.length > 0 ? params.id : null;
  const productId = routeProductId || product?.id || null;
  const [name, setName] = useState(product?.name ?? "");
  const slug = product?.slug ?? "";
  const [description, setDescription] = useState(product?.description ?? "");
  const [category, setCategory] = useState(
    categories.find((item) => item.slug === product?.category)?.id ??
      categories[0]?.id ??
      "",
  );
  const [status, setStatus] = useState<ProductStatus>(product?.status ?? "draft");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [colorImages, setColorImages] = useState<Record<string, string>>(() =>
    initialColorImages(product),
  );
  const [colorFiles, setColorFiles] = useState<Map<string, File>>(new Map());
  const [variants, setVariants] = useState<VariantDraft[]>(
    product?.variants.map((variant) => ({
      id: variant.id,
      size: variant.size,
      color: variant.color ?? "",
      colorHex: variant.colorHex ?? "#c8b4a0",
      imageUrl: variant.imageUrl ?? "",
      sku: variant.sku,
      stockQuantity: variant.stockQuantity,
      unitPrice: variant.unitPrice,
    })) ?? [
      {
        size: "M",
        color: "Noir",
        colorHex: "",
        imageUrl: "",
        sku: "",
        stockQuantity: 0,
        unitPrice: 0,
      },
    ],
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [customColorFor, setCustomColorFor] = useState<number | null>(null);
  const [extraColors, setExtraColors] = useState<string[]>(() =>
    uniqueColors(product?.variants.map((variant) => variant.color) ?? []),
  );

  const colorOptions = uniqueColors([...PRODUCT_COLOR_OPTIONS, ...extraColors]);
  const variantColors = useMemo(
    () => uniqueColors(variants.map((variant) => variant.color)),
    [variants],
  );
  const generatedSlug = slugify(name);

  async function onProductFile(file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      setError(MAX_IMAGE_MESSAGE);
      return;
    }
    setError(null);
    const dataUrl = await readAsDataUrl(file);
    setImageFile(file);
    setImages((current) => [...current, dataUrl]);
  }

  function setColorImage(color: string, src: string) {
    setColorImages((current) => ({ ...current, [color]: src }));
    setVariants((current) =>
      current.map((variant) =>
        variant.color === color ? { ...variant, imageUrl: src } : variant,
      ),
    );
  }

  function clearColorImage(color: string) {
    setColorImages((current) => {
      const next = { ...current };
      delete next[color];
      return next;
    });
    setColorFiles((current) => {
      const next = new Map(current);
      next.delete(color);
      return next;
    });
    setVariants((current) =>
      current.map((variant) =>
        variant.color === color ? { ...variant, imageUrl: "" } : variant,
      ),
    );
  }

  async function onColorFile(color: string, file: File) {
    if (file.size > MAX_IMAGE_BYTES) {
      setError(MAX_IMAGE_MESSAGE);
      return;
    }
    setError(null);
    const dataUrl = await readAsDataUrl(file);
    setColorImage(color, dataUrl);
    setColorFiles((current) => {
      const next = new Map(current);
      next.set(color, file);
      return next;
    });
  }

  function applyColorToVariant(
    index: number,
    color: string,
    colorHex = "",
  ) {
    setVariants((current) =>
      current.map((item, i) =>
        i === index
          ? {
              ...item,
              color,
              colorHex: isPaletteColor(color) ? "" : colorHex || item.colorHex || "#c8b4a0",
              imageUrl: colorImages[color] ?? item.imageUrl,
            }
          : item,
      ),
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name,
        slug: generatedSlug,
        description,
        category,
        status,
        featured,
        images: images.filter((src) => /^https?:\/\//i.test(src)),
        variants: variants.map((variant, index) => {
          const sku =
            variant.sku.trim() ||
            makeSku(name || slug, variant.size, variant.color, index);
          const color = variant.color || null;
          return {
            ...variant,
            sku,
            color,
            colorHex: color && isPaletteColor(color) ? null : variant.colorHex || null,
            imageUrl:
              color && colorFiles.has(color)
                ? null  // will be set by the controller after Cloudinary upload
                : color && /^https?:\/\//i.test(colorImages[color] || variant.imageUrl || "")
                  ? colorImages[color] || variant.imageUrl
                  : null,
          };
        }),
      };

      // Build map of variant index → File for new color image uploads
      const variantFileMap = new Map<number, File>();
      payload.variants.forEach((variant, index) => {
        if (variant.color && colorFiles.has(variant.color)) {
          variantFileMap.set(index, colorFiles.get(variant.color)!);
        }
      });

      if (product || productId) {
        if (!productId) {
          throw new Error("Identifiant produit manquant.");
        }
        const nextVariants: AdminVariant[] = payload.variants.map((variant, index) => {
          const current =
            product?.variants.find((item) => item.id === variant.id) ??
            product?.variants[index];
          return {
            id: variant.id ?? current?.id ?? `var_new_${index}`,
            productId,
            size: variant.size,
            color: variant.color,
            colorHex:
              variant.color && isPaletteColor(variant.color)
                ? null
                : variant.colorHex || null,
            imageUrl: variant.imageUrl || null,
            sku: variant.sku,
            stockQuantity: variant.stockQuantity,
            unitPrice: variant.unitPrice,
            reservedQuantity: current?.reservedQuantity ?? 0,
            soldQuantity: current?.soldQuantity ?? 0,
            lowStockThreshold: current?.lowStockThreshold ?? 5,
            active: current?.active ?? true,
          };
        });
        const body = { ...payload, variants: nextVariants };
        if (imageFile || variantFileMap.size > 0) {
          const form = new FormData();
          form.append("payload", JSON.stringify(body));
          if (imageFile) form.append("image", imageFile, imageFile.name);
          for (const [index, file] of variantFileMap) {
            form.append(`variantImage[${index}]`, file, file.name);
          }
          await adminRequest(`/api/admin/products/${productId}`, { method: "PATCH", body: form });
        } else {
          await adminRequest(`/api/admin/products/${productId}`, { method: "PATCH", body });
        }
      } else {
        if (imageFile || variantFileMap.size > 0) {
          const form = new FormData();
          form.append("payload", JSON.stringify(payload));
          if (imageFile) form.append("image", imageFile, imageFile.name);
          for (const [index, file] of variantFileMap) {
            form.append(`variantImage[${index}]`, file, file.name);
          }
          await adminRequest("/api/admin/products", { method: "POST", body: form });
        } else {
          await adminRequest("/api/admin/products", { method: "POST", body: payload });
        }
      }
      setColorFiles(new Map());
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
          <Input
            name="slug"
            label="Slug automatique"
            value={generatedSlug}
            readOnly
            hint="Généré à partir du nom du produit."
          />
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
                <option key={item.id} value={item.id}>
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
        <h2 className="font-headline text-lg font-extrabold uppercase">Images produit</h2>
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
        <ImageFilePicker
          className="mt-3"
          label="Importer depuis l'appareil"
          onFile={(file) => void onProductFile(file)}
        />
        <p className="mt-2 text-xs text-tdev-muted">
          L&apos;image est prévisualisée immédiatement puis envoyée au serveur pour son
          téléversement sécurisé vers Cloudinary.
        </p>
      </section>

      <section className="border border-tdev-anthracite bg-tdev-white p-5">
        <h2 className="font-headline text-lg font-extrabold uppercase">
          Photos par couleur
        </h2>
        <p className="mt-2 text-sm text-tdev-muted">
          Sur le Shop, changer de couleur affiche la photo correspondante. Une photo sert
          pour toutes les tailles de cette couleur.
        </p>
        {variantColors.length === 0 ? (
          <p className="mt-4 text-sm text-tdev-muted">
            Ajoute d&apos;abord des variantes avec une couleur.
          </p>
        ) : (
          <div className="mt-4 flex flex-col gap-4">
            {variantColors.map((color) => {
              const src = colorImages[color];
              const hex =
                variants.find((variant) => variant.color === color)?.colorHex || null;
              return (
                <div
                  key={color}
                  className="grid gap-3 border border-tdev-border p-3 sm:grid-cols-[96px_1fr]"
                >
                  <div className="relative size-24 border border-tdev-anthracite bg-tdev-surface">
                    {src ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={color} className="size-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-1 top-1 bg-tdev-white px-1 text-xs"
                          onClick={() => clearColorImage(color)}
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <span
                        className={`flex size-full items-center justify-center text-[10px] font-bold uppercase ${colorSwatchClass(color)}`}
                        style={
                          !isPaletteColor(color) && hex
                            ? { backgroundColor: hex }
                            : undefined
                        }
                      >
                        {src ? "" : "Vide"}
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-2">
                    <p className="text-sm font-extrabold uppercase tracking-[0.08em]">
                      {color}
                    </p>
                    <ImageFilePicker
                      label={`Importer photo ${color}`}
                      onFile={(file) => void onColorFile(color, file)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
                {
                  size: null,
                  color: "",
                  colorHex: "",
                  imageUrl: "",
                  sku: "",
                  stockQuantity: 0,
                  unitPrice: 0,
                },
              ])
            }
          >
            Ajouter
          </Button>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          {variants.map((variant, index) => (
            <div key={index} className="grid gap-2 border border-tdev-border p-3 sm:grid-cols-2 lg:grid-cols-5">
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
                      applyColorToVariant(index, value);
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
                        applyColorToVariant(index, next, variant.colorHex || "#c8b4a0");
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
                  value={variant.sku || makeSku(name || slug, variant.size, variant.color, index)}
                  readOnly
                  aria-describedby={`sku-help-${index}`}
                />
                <span id={`sku-help-${index}`} className="text-xs font-normal text-tdev-muted">
                  Généré automatiquement.
                </span>
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
