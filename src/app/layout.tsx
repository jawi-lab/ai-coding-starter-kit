import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { NativeAuthListener } from "@/components/native/NativeAuthListener";
import { NativeStatusBar } from "@/components/native/NativeStatusBar";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-archivo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ZUSAMMEN",
  description: "Gemeinsam planen, abstimmen und Erinnerungen teilen.",
};

// `viewport-fit=cover` lets the WebView extend under the iOS notch / status bar
// and home indicator, which is what makes the `env(safe-area-inset-*)` values
// non-zero so the native shell (PROJ-9) can inset headers/FAB into the safe area.
// Harmless on the web — the insets resolve to 0 in a normal browser.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className={archivo.variable} suppressHydrationWarning>
      <head>
        {/* Apply the persisted/system theme before paint to avoid a flash. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('zusammen-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased font-sans">
        <AuthProvider>
          <NativeAuthListener />
          <NativeStatusBar />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
