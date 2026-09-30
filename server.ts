// Runs Next.js and Socket.io in one process. Start with `npm run dev` / `npm start`.
// Plain `next dev` / `next start` still work; live chat updates then fall back to polling.
import { createServer } from "node:http";

const dev = process.argv.includes("--dev");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SESSION_COOKIES = ["__Secure-next-auth.session-token", "next-auth.session-token"];

function parseCookies(header: string) {
  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    try {
      cookies[part.slice(0, index).trim()] = decodeURIComponent(part.slice(index + 1).trim());
    } catch {
      // ignore malformed cookie values
    }
  }
  return cookies;
}

async function main() {
  (process.env as Record<string, string | undefined>).NODE_ENV = dev ? "development" : "production";

  const { loadEnvConfig } = await import("@next/env");
  loadEnvConfig(process.cwd(), dev);

  const nextModule = await import("next");
  const createNext = (nextModule.default ?? nextModule) as typeof nextModule.default;
  const { Server } = await import("socket.io");
  const { decode } = await import("next-auth/jwt");

  const port = Number(process.env.PORT ?? 3000);
  const hostname = process.env.HOSTNAME_BIND ?? "0.0.0.0";

  const httpServer = createServer();
  const app = createNext({ dev, hostname, port, httpServer });
  const handle = app.getRequestHandler();
  await app.prepare();
  httpServer.on("request", (req, res) => {
    if (req.url?.startsWith("/socket.io")) return;
    void handle(req, res);
  });

  const io = new Server(httpServer, { path: "/socket.io", serveClient: false, cors: { origin: false } });
  (globalThis as { __io?: unknown }).__io = io;

  io.use(async (socket, proceed) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie ?? "");
      const raw = SESSION_COOKIES.map((name) => cookies[name]).find(Boolean);
      const secret = process.env.NEXTAUTH_SECRET;
      if (!raw || !secret) return proceed(new Error("unauthorized"));
      const token = await decode({ token: raw, secret });
      if (!token?.id) return proceed(new Error("unauthorized"));
      socket.data.userId = token.id as string;
      proceed();
    } catch {
      proceed(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    void socket.join(`user:${userId}`);

    socket.on("typing", (payload: { recipientId?: unknown; typing?: unknown }) => {
      if (typeof payload?.recipientId !== "string" || !UUID.test(payload.recipientId) || payload.recipientId === userId) return;
      io.to(`user:${payload.recipientId}`).emit("typing", { userId, typing: payload.typing === true });
    });
  });

  httpServer.listen(port, hostname, () => {
    console.log(`> ReadnLearn ready on http://localhost:${port} (${dev ? "development" : "production"}, realtime on)`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
