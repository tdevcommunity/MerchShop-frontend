"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPinIcon } from "@/components/ui/icons";
import { env } from "@/lib/config/env";
import { cn } from "@/lib/utils/cn";
import type { ShippingAddress } from "@/types/delivery";

type DeliveryAddressFieldsProps = {
  address: ShippingAddress;
  errors: Record<string, string>;
  onChange: (address: ShippingAddress) => void;
};

type PlaceComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GooglePlace = {
  place_id?: string;
  formatted_address?: string;
  geometry?: { location?: { lat: () => number; lng: () => number } };
  address_components?: PlaceComponent[];
};

type GoogleAutocomplete = {
  addListener: (event: string, handler: () => void) => void;
  getPlace: () => GooglePlace;
};

declare global {
  interface Window {
    google?: {
      maps?: {
        places?: {
          Autocomplete: new (
            input: HTMLInputElement,
            opts?: { types?: string[]; fields?: string[] },
          ) => GoogleAutocomplete;
        };
      };
    };
  }
}

let mapsScriptPromise: Promise<void> | null = null;

function loadGooglePlaces(apiKey: string): Promise<void> {
  if (window.google?.maps?.places) {
    return Promise.resolve();
  }
  if (mapsScriptPromise) {
    return mapsScriptPromise;
  }
  mapsScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-tdev-google-maps]");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Impossible de charger Google Maps.")),
      );
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&language=fr`;
    script.async = true;
    script.dataset.tdevGoogleMaps = "true";
    script.onload = () => resolve();
    script.onerror = () => {
      mapsScriptPromise = null;
      reject(new Error("Impossible de charger Google Maps."));
    };
    document.head.appendChild(script);
  });
  return mapsScriptPromise;
}

function componentOf(place: GooglePlace, type: string): string | undefined {
  return place.address_components?.find((part) => part.types.includes(type))
    ?.long_name;
}

function emptyMapsAddress(): ShippingAddress {
  return {
    source: "maps",
    line1: "",
    city: "",
    country: "Togo",
    line2: "",
    lat: undefined,
    lng: undefined,
    placeId: undefined,
  };
}

function emptyManualAddress(): ShippingAddress {
  return {
    source: "manual",
    line1: "",
    city: "",
    country: "Togo",
    line2: "",
    lat: undefined,
    lng: undefined,
    placeId: undefined,
  };
}

export function DeliveryAddressFields({
  address,
  errors,
  onChange,
}: DeliveryAddressFieldsProps) {
  const mode: "maps" | "manual" =
    address.source ??
    (address.lat != null || address.line2 ? "maps" : "manual");
  const searchRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const [search, setSearch] = useState(address.line2 ?? "");
  const [locateError, setLocateError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const mapsKey = env.googleMapsApiKey;

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (mode !== "maps" || !mapsKey || !searchRef.current) {
      return;
    }
    let cancelled = false;

    void loadGooglePlaces(mapsKey)
      .then(() => {
        if (cancelled || !searchRef.current || !window.google?.maps?.places) {
          return;
        }
        const autocomplete = new window.google.maps.places.Autocomplete(
          searchRef.current,
          {
            types: ["geocode"],
            fields: ["address_components", "formatted_address", "geometry", "place_id"],
          },
        );
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const lat = place.geometry?.location?.lat();
          const lng = place.geometry?.location?.lng();
          const formatted = place.formatted_address ?? "";
          setSearch(formatted);
          onChangeRef.current({
            source: "maps",
            country: componentOf(place, "country") ?? "Togo",
            city:
              componentOf(place, "locality") ??
              componentOf(place, "administrative_area_level_2") ??
              componentOf(place, "administrative_area_level_1") ??
              "",
            line1:
              componentOf(place, "neighborhood") ??
              componentOf(place, "sublocality_level_1") ??
              componentOf(place, "sublocality") ??
              componentOf(place, "route") ??
              "",
            line2: formatted,
            placeId: place.place_id,
            lat,
            lng,
          });
        });
      })
      .catch(() => {
        setLocateError(
          "Google Maps n'a pas pu se charger. Passe en saisie manuelle.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [mapsKey, mode]);

  const mapQuery =
    address.lat != null && address.lng != null
      ? `${address.lat},${address.lng}`
      : search.trim();
  const showMap = mode === "maps" && Boolean(mapQuery);

  async function locateMe() {
    if (!navigator.geolocation) {
      setLocateError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocateError(null);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        try {
          const resolved = await reverseGeocode(lat, lng);
          const formatted = [resolved.line1, resolved.city, resolved.country]
            .filter(Boolean)
            .join(", ");
          setSearch(formatted);
          onChange({
            source: "maps",
            ...resolved,
            lat,
            lng,
            line2: formatted,
            placeId: undefined,
          });
        } catch {
          const label = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          setSearch(label);
          onChange({
            ...emptyMapsAddress(),
            lat,
            lng,
            line2: label,
          });
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        setLocateError(
          "Impossible d'obtenir ta position. Autorise la localisation ou passe en saisie manuelle.",
        );
      },
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[1.8px]">
          Adresse de livraison
        </p>
        <p className="mt-1 text-sm text-tdev-muted">
          Localise le lieu, ou saisis l’adresse. Un seul des deux.
        </p>
      </div>

      <div className="flex gap-2">
        <ModeChip
          label="Localisation"
          selected={mode === "maps"}
          onClick={() => {
            setSearch("");
            setLocateError(null);
            onChange(emptyMapsAddress());
          }}
        />
        <ModeChip
          label="Saisie manuelle"
          selected={mode === "manual"}
          onClick={() => {
            setSearch("");
            setLocateError(null);
            onChange(emptyManualAddress());
          }}
        />
      </div>

      {mode === "maps" ? (
        <div className="flex flex-col gap-4 lg:grid lg:min-h-[380px] lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:items-stretch lg:gap-8">
          <div className="flex flex-col gap-3.5">
            <Input
              ref={searchRef}
              name="mapsSearch"
              label="Lieu"
              placeholder="Quartier, ville…"
              autoComplete="off"
              value={search}
              error={errors.shipping}
              hint="Recherche un lieu ou utilise ta position."
              onChange={(event) => {
                const value = event.target.value;
                setSearch(value);
                onChange({
                  ...emptyMapsAddress(),
                  line2: value,
                });
              }}
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void locateMe()}
              disabled={locating}
            >
              <MapPinIcon className="size-4" />
              {locating ? "Localisation…" : "Utiliser ma position"}
            </Button>
            {locateError ? (
              <p role="alert" className="text-xs text-tdev-orange">
                {locateError}
              </p>
            ) : null}
          </div>

          {showMap ? (
            <iframe
              title="Carte Google Maps de l'adresse de livraison"
              src={`https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=15&output=embed`}
              className="h-44 w-full border border-tdev-anthracite lg:h-full lg:min-h-[380px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex min-h-44 items-center justify-center border border-dashed border-tdev-border bg-tdev-surface px-4 text-center text-sm text-tdev-muted lg:min-h-[380px]">
              La carte s’affiche dès qu’un lieu est indiqué.
            </div>
          )}
        </div>
      ) : (
        <div className="grid max-w-xl gap-3.5 sm:grid-cols-2">
          <Input
            name="country"
            label="Pays"
            autoComplete="country-name"
            value={address.country}
            error={errors.country}
            onChange={(event) =>
              onChange({
                ...address,
                source: "manual",
                country: event.target.value,
              })
            }
          />
          <Input
            name="city"
            label="Ville"
            autoComplete="address-level2"
            value={address.city}
            error={errors.city}
            onChange={(event) =>
              onChange({
                ...address,
                source: "manual",
                city: event.target.value,
              })
            }
          />
          <div className="sm:col-span-2">
            <Input
              name="line1"
              label="Quartier"
              autoComplete="address-line1"
              value={address.line1}
              error={errors.line1}
              onChange={(event) =>
                onChange({
                  ...address,
                  source: "manual",
                  line1: event.target.value,
                })
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ModeChip({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "min-h-11 flex-1 border px-3 text-xs font-bold uppercase sm:flex-none sm:px-5",
        selected
          ? "border-tdev-anthracite bg-tdev-anthracite text-tdev-white"
          : "border-tdev-anthracite bg-tdev-white",
      )}
    >
      {label}
    </button>
  );
}

async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<Pick<ShippingAddress, "country" | "city" | "line1">> {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=fr`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("reverse_geocode_failed");
  }
  const payload = (await response.json()) as {
    countryName?: string;
    city?: string;
    locality?: string;
    principalSubdivision?: string;
    localityInfo?: {
      administrative?: Array<{ name?: string; description?: string }>;
    };
  };
  const quartier =
    payload.localityInfo?.administrative?.find((part) =>
      /quartier|neighbourhood|neighborhood|suburb/i.test(part.description ?? ""),
    )?.name ??
    payload.locality ??
    "";
  return {
    country: payload.countryName ?? "Togo",
    city: payload.city || payload.principalSubdivision || "",
    line1: quartier,
  };
}
