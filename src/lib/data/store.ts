import { buildDatabase, Database } from "./seed";

// Module-level singleton so mutations persist across API calls in dev/prod runtime.
const globalStore = globalThis as unknown as { __jibblemDb?: Database };

export function db(): Database {
  if (!globalStore.__jibblemDb) {
    globalStore.__jibblemDb = buildDatabase();
  }
  return globalStore.__jibblemDb;
}

let counter = 1000;
export function nextId(prefix: string): string {
  counter += 1;
  return `${prefix}${Date.now().toString(36)}${counter}`;
}
