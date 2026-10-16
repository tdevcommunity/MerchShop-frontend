export type CartNotice = {
  id: number;
  key: string;
  title: string;
  detail?: string;
  hint?: string;
  href?: string;
  actionLabel?: string;
};

const serverSnapshot: CartNotice[] = [];

let notices: CartNotice[] = serverSnapshot;
let nextId = 1;
const listeners = new Set<() => void>();

function publish(next: CartNotice[]): void {
  notices = next;
  listeners.forEach((listener) => listener());
}

export const cartNoticeStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): CartNotice[] {
    return notices;
  },
  getServerSnapshot(): CartNotice[] {
    return serverSnapshot;
  },
  push(input: Omit<CartNotice, "id">): number {
    const notice: CartNotice = { ...input, id: nextId };
    nextId += 1;
    const rest = notices.filter((item) => item.key !== input.key);
    publish([...rest, notice].slice(-3));
    return notice.id;
  },
  dismiss(id: number): void {
    publish(notices.filter((item) => item.id !== id));
  },
  reset(): void {
    nextId = 1;
    publish([]);
  },
};
