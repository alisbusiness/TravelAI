export function paginate(page?: number, pageSize?: number) {
  const safePage = Math.max(1, page ?? 1);
  const safeSize = Math.min(100, Math.max(1, pageSize ?? 20));
  return { skip: (safePage - 1) * safeSize, take: safeSize };
}

