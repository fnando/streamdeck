export function die(message: string): never {
  console.error(message);
  process.exit(1);
}
