function isPrimitive(value: unknown): boolean {
  return typeof value !== "object";
}

export { isPrimitive };
