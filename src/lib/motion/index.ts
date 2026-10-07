export function staggerDelay(index: number, stepMs = 60, maxMs = 480): string {
  return `${Math.min(index * stepMs, maxMs)}ms`;
}
