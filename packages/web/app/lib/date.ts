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
  const utcCreatedDate = new Date(createdAt);
  utcCreatedDate.setUTCHours(0, 0, 0, 0);

  const expiryDate = new Date(utcCreatedDate);
  expiryDate.setUTCDate(expiryDate.getUTCDate() + expiryDays);

  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  return Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );
}
