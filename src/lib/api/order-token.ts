const TOKEN_PREFIX = "tdev-merch-order-token:";

const memoryTokens = new Map<string, string>();

export function saveOrderGuestToken(orderUuid: string, token: string): void {
  if (!orderUuid || !token) {
    return;
  }
  memoryTokens.set(orderUuid, token);
  if (typeof window !== "undefined") {
    try {
      window.sessionStorage.setItem(`${TOKEN_PREFIX}${orderUuid}`, token);
      window.localStorage.setItem(`${TOKEN_PREFIX}${orderUuid}`, token);
    } catch {
      // storage unavailable
    }
  }
}

export function getOrderGuestToken(orderUuid: string): string | null {
  if (!orderUuid) {
    return null;
  }
  const inMemory = memoryTokens.get(orderUuid);
  if (inMemory) {
    return inMemory;
  }
  if (typeof window !== "undefined") {
    try {
      const fromSession = window.sessionStorage.getItem(`${TOKEN_PREFIX}${orderUuid}`);
      if (fromSession) {
        memoryTokens.set(orderUuid, fromSession);
        return fromSession;
      }
      const fromLocal = window.localStorage.getItem(`${TOKEN_PREFIX}${orderUuid}`);
      if (fromLocal) {
        memoryTokens.set(orderUuid, fromLocal);
        return fromLocal;
      }
    } catch {
      // storage unavailable
    }
  }
  return null;
}
