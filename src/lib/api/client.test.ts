import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiRequestAll } from "@/lib/api/client";

/**
 * `apiRequestAll` existe parce que lire une seule page tronque les listes
 * paginees de l'API : c'est ce qui faisait apparaitre des categories vides
 * des que le catalogue depassait la premiere page. Ces tests verrouillent le
 * parcours complet des pages.
 */
function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiRequestAll()", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("parcourt toutes les pages jusqu'a lastPage", async () => {
    fetchMock
      .mockResolvedValueOnce(
        jsonResponse({ data: [{ id: 1 }], meta: { lastPage: 2 } }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ data: [{ id: 2 }], meta: { lastPage: 2 } }),
      );

    const items = await apiRequestAll<{ id: number }>("/api/v1/products");

    expect(items).toEqual([{ id: 1 }, { id: 2 }]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://localhost:8000/api/v1/products?page=1",
    );
    expect(fetchMock.mock.calls[1]?.[0]).toBe(
      "http://localhost:8000/api/v1/products?page=2",
    );
  });

  it("ajoute la pagination a une query deja presente", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ data: [{ id: 1 }], meta: { lastPage: 1 } }),
    );

    await apiRequestAll("/api/v1/products?category=textile");

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "http://localhost:8000/api/v1/products?category=textile&page=1",
    );
  });

  it("s'arrete a la premiere page quand la meta est absente", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ data: [{ id: 1 }] }));

    const items = await apiRequestAll<{ id: number }>("/api/v1/products");

    expect(items).toEqual([{ id: 1 }]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
