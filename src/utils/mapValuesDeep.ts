export function mapStringValuesDeep<Value>(currentValue: Value, mapFunction: (value: string) => string): Value {
  if (typeof currentValue === 'string') {
    return mapFunction(currentValue) as Value;
  }
  if (Array.isArray(currentValue)) {
    return currentValue.map(item => mapStringValuesDeep(item, mapFunction)) as Value;
  }
  if (typeof currentValue === 'object' && currentValue !== null) {
    return Object.fromEntries(
      Object.entries(currentValue).map(([key, value]) => [key, mapStringValuesDeep(value, mapFunction)]),
    ) as Value;
  }
  return currentValue;
}
