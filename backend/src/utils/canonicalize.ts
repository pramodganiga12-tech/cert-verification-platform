export function sortObjectKeys<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys) as unknown as T;
  }

  const sortedObj: Record<string, unknown> = {};
  const keys = Object.keys(obj as Record<string, unknown>).sort();

  for (const key of keys) {
    const val = (obj as Record<string, unknown>)[key];
    sortedObj[key] = val !== null && typeof val === 'object' ? sortObjectKeys(val) : val;
  }

  return sortedObj as T;
}

export function canonicalizeJSON(data: unknown): string {
  const sorted = sortObjectKeys(data);
  return JSON.stringify(sorted);
}
