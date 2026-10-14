type SharedVeltoRedirect = {
  orderId: string;
  checkoutUrl: string;
  navigationStarted: boolean;
};

let sharedVeltoRedirect: SharedVeltoRedirect | null = null;

const veltoRedirectListeners = new Set<() => void>();

export function stageVeltoRedirect(orderId: string, checkoutUrl: string): void {
  if (
    sharedVeltoRedirect?.orderId === orderId &&
    sharedVeltoRedirect.checkoutUrl === checkoutUrl &&
    sharedVeltoRedirect.navigationStarted
  ) {
    return;
  }

  sharedVeltoRedirect = { orderId, checkoutUrl, navigationStarted: false };
  for (const listener of veltoRedirectListeners) {
    listener();
  }
}

export function subscribeVeltoRedirectReady(listener: () => void): () => void {
  veltoRedirectListeners.add(listener);
  return () => {
    veltoRedirectListeners.delete(listener);
  };
}

export function completeVeltoRedirectIfReady(
  onBeforeNavigate: (orderId: string, checkoutUrl: string) => void,
): boolean {
  if (
    typeof window === "undefined" ||
    !sharedVeltoRedirect ||
    sharedVeltoRedirect.navigationStarted
  ) {
    return false;
  }

  const { orderId, checkoutUrl } = sharedVeltoRedirect;
  sharedVeltoRedirect.navigationStarted = true;
  onBeforeNavigate(orderId, checkoutUrl);
  window.location.replace(checkoutUrl);
  return true;
}

export function resumeVeltoRedirectIfNeeded(
  onBeforeNavigate: (orderId: string, checkoutUrl: string) => void,
): boolean {
  return completeVeltoRedirectIfReady(onBeforeNavigate);
}

export function markVeltoRedirectStarted(): void {
  if (sharedVeltoRedirect) {
    sharedVeltoRedirect.navigationStarted = true;
  }
}

export function resetVeltoRedirectSession(): void {
  sharedVeltoRedirect = null;
}
