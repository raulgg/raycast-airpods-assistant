export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parsePercent(s: string | undefined): number {
  if (!s) return 0;
  const match = s.match(/(\d{1,3})%/);
  if (match) {
    const value = Number(match[1]);
    if (!Number.isNaN(value)) return Math.max(0, Math.min(100, value));
  }
  const num = Number(s);
  if (!Number.isNaN(num)) return Math.max(0, Math.min(100, num));
  return 0;
}
