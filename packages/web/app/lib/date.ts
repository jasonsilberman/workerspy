export function formatDateTime(date: string | Date): string {
  const utcDate = new Date(date);
  const localDate = new Date(
    utcDate.getTime() - utcDate.getTimezoneOffset() * 60000,
  );
  return localDate.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export function getDaysRemaining(
  createdAt: string | Date,
  expiryDays: number,
): number {
  const utcDate = new Date(createdAt);
  const localCreatedDate = new Date(
    utcDate.getTime() - utcDate.getTimezoneOffset() * 60000,
  );
  const expiryDate = new Date(
    localCreatedDate.getTime() + expiryDays * 24 * 60 * 60 * 1000,
  );
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60000);

  return Math.ceil(
    (expiryDate.getTime() - localNow.getTime()) / (1000 * 60 * 60 * 24),
  );
}
