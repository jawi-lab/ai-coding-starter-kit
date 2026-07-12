import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static Export (PROJ-9): erzeugt einen statischen out/-Ordner für die
  // Capacitor-Hülle. Mellon läuft komplett client-seitig (keine API-Routes,
  // keine Server-Logik) → Export ist machbar. Web-Version auf Vercel bleibt
  // unverändert lauffähig.
  output: "export",
  // Kein Next Image-Server im Static Export verfügbar.
  images: { unoptimized: true },
  // Sorgt für saubere Ordner-/index.html-Struktur, die die WebView zuverlässig
  // ausliefert.
  trailingSlash: true,
};

export default nextConfig;
