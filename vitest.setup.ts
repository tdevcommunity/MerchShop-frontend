/**
 * Node >= 22 expose un acces global experimental a `localStorage` / `sessionStorage`
 * qui, sans l'option `--localstorage-file`, renvoie `undefined` et masque
 * l'implementation fournie par jsdom. A l'inverse, sur une origine opaque le
 * getter de jsdom lève une SecurityError. On installe donc un Storage en memoire
 * des qu'il est absent ou inutilisable, pour que les tests restent deterministes
 * quel que soit Node.
 */
function createMemoryStorage(): Storage {
  const entries = new Map<string, string>();

  return {
    get length() {
      return entries.size;
    },
    clear() {
      entries.clear();
    },
    getItem(key: string) {
      return entries.has(key) ? (entries.get(key) as string) : null;
    },
    key(index: number) {
      return Array.from(entries.keys())[index] ?? null;
    },
    removeItem(key: string) {
      entries.delete(key);
    },
    setItem(key: string, value: string) {
      entries.set(key, String(value));
    },
  };
}

/** `true` si le nom n'a pas de Storage fonctionnel sur `target`. */
function isMissing(target: Window, name: "localStorage" | "sessionStorage") {
  try {
    return !target[name];
  } catch {
    // Le getter de jsdom a lève une SecurityError (origine opaque).
    return true;
  }
}

function ensureStorage(name: "localStorage" | "sessionStorage") {
  if (typeof window === "undefined" || !isMissing(window, name)) {
    return;
  }
  try {
    Object.defineProperty(window, name, {
      configurable: true,
      value: createMemoryStorage(),
    });
  } catch {
    // Echec de redefinition (propriete verrouillee) : on laisse tel quel.
  }
}

if (typeof window !== "undefined") {
  ensureStorage("localStorage");
  ensureStorage("sessionStorage");
}

export {};
