export function generateUID(): string {
  const random = crypto.randomUUID().slice(0, 8).toUpperCase();
  return `EDU-${random}`;
}
