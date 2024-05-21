type DeepMapFunction<Value> = (value: Value) => unknown;

export function mapValuesDeep<Value>(currentValue: Value, mapFunction: DeepMapFunction<Value>): unknown {
  type Key = keyof Value;
  if (typeof currentValue !== 'object' || currentValue === null) {
    return mapFunction(currentValue);
  }

  if (Array.isArray(currentValue)) {
    return currentValue.map(item => mapValuesDeep(item, mapFunction)) as Value;
  }

  // @ts-expect-error @merlin probably this function can be improved
  const mappedObject: Record<Key, unknown> = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(currentValue)) {
    const key1 = key as Key;
    mappedObject[key1] = mapValuesDeep(currentValue[key1] as Value, mapFunction);
  }
  return mappedObject as Value;
}
