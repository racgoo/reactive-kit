export function shallowCopy<T>(value: T): T {
  if (value instanceof Map) {
    return new Map(value) as T;
  }
  if (value instanceof Set) {
    return new Set(value) as T;
  }
  if (value instanceof Date) {
    return new Date(value) as T;
  }
  if (Array.isArray(value)) {
    return [...value] as T;
  }
  if (value && typeof value === "object") {
    return { ...value } as T;
  }
  return value;
}
