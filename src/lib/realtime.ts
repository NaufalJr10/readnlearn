import "server-only";

type IoLike = { to(room: string): { emit(event: string, payload: unknown): void } };

export const userRoom = (userId: string) => `user:${userId}`;

/** Pushes to a user's open tabs when the custom server (server.ts) has published its Socket.io instance; otherwise a no-op. */
export function emitToUser(userId: string, event: string, payload: unknown) {
  const io = (globalThis as { __io?: IoLike }).__io;
  io?.to(userRoom(userId)).emit(event, payload);
}
