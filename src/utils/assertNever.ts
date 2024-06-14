export function assertNever(value: never): never {
  const message = `Unhandled discriminated union member: ${JSON.stringify(value)}`;
  throw new Error(message);
}
