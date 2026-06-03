/**
 * Client-generated entity id. With PowerSync the client generates the final id
 * (a UUID), so there is no server-side remapping - the id written locally is the
 * same id stored in Postgres.
 */
export function generateId(): string {
  return crypto.randomUUID()
}
