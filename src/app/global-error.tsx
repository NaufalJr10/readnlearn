"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, background: "#f7f7fb", color: "#0f172a" }}>
        <main style={{ textAlign: "center", padding: 24 }}>
          <h1 style={{ fontSize: 28 }}>ReadnLearn is having trouble loading</h1>
          <p style={{ color: "#475569" }}>Please try again in a moment.</p>
          <button
            onClick={reset}
            style={{ marginTop: 16, minHeight: 48, padding: "0 20px", borderRadius: 12, border: 0, background: "#4f46e5", color: "#fff", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
