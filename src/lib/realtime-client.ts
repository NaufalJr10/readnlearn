"use client";

import { io, type Socket } from "socket.io-client";
import type { MessageDTO } from "./messaging-types";

export type RealtimeEvents = {
  "message:new": MessageDTO;
  "message:read": { readerId: string; readAt: string };
  "typing": { userId: string; typing: boolean };
};

let socket: Socket | null = null;

function connection() {
  if (!socket) socket = io({ path: "/socket.io", withCredentials: true, transports: ["websocket", "polling"] });
  return socket;
}

/** Subscribes to a server-pushed event and returns an unsubscribe function. */
type Listener = (payload: never) => void;
type LooseSocket = { on(event: string, listener: Listener): void; off(event: string, listener: Listener): void };

export function subscribeToRealtime<E extends keyof RealtimeEvents>(event: E, handler: (payload: RealtimeEvents[E]) => void) {
  const s = connection() as unknown as LooseSocket;
  const listener = handler as Listener;
  s.on(event, listener);
  return () => {
    s.off(event, listener);
  };
}

export function emitTyping(recipientId: string, typing: boolean) {
  connection().emit("typing", { recipientId, typing });
}
