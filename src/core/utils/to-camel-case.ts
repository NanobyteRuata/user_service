export function toCamelCase(obj: object): object {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item: object) => toCamelCase(item));
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  return Object.keys(obj).reduce(
    (acc, key) => {
      // Convert snake_case to camelCase
      const camelKey = key.replace(/_([a-z])/g, (_, letter: string) =>
        letter.toUpperCase(),
      );
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    },
    {} as Record<string, object>,
  );
}
