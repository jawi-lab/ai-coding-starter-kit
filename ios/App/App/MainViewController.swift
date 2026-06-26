import Foundation
import Capacitor

/// Custom router for ZUSAMMEN (PROJ-9).
///
/// The app ships a **Next.js static export** (`output: 'export'`, `trailingSlash: true`),
/// which is a multi-page app: every route is a real file on disk
/// (`/login/index.html`, `/groups/view/index.html`, …).
///
/// Capacitor's default `CapacitorRouter` is built for single-page apps — it maps
/// **every extensionless path** (e.g. `/login`) to the *root* `index.html`. With a
/// static export that breaks all hard navigations (`window.location.href = '/login'`,
/// cold-start deep-link targets): the WebView keeps re-serving the root shell, which
/// renders blank for unauthenticated users → white screen.
///
/// `NextStaticRouter` instead resolves an extensionless/directory path to that route's
/// own `index.html` when it exists on disk, and only falls back to the root shell
/// otherwise. Files with an extension (`.js`, `.css`, `.png`, `.html`) are served as-is.
struct NextStaticRouter: Router {
    var basePath: String = ""

    func route(for path: String) -> String {
        let pathUrl = URL(fileURLWithPath: path)

        // Assets with a real file extension are served directly.
        if !pathUrl.pathExtension.isEmpty {
            return basePath + path
        }

        // Normalize: strip a single trailing slash so "/login/" and "/login" behave the same.
        var routePath = path
        if routePath.count > 1 && routePath.hasSuffix("/") {
            routePath.removeLast()
        }

        // Map "/login" → "/login/index.html" when that static file exists.
        let candidate = basePath + routePath + "/index.html"
        if FileManager.default.fileExists(atPath: candidate) {
            return candidate
        }

        // Fallback: root shell (covers "/" and any unknown route).
        return basePath + "/index.html"
    }
}

/// Bridge view controller that swaps in `NextStaticRouter`.
/// Wired up via `Main.storyboard` (customClass = MainViewController).
class MainViewController: CAPBridgeViewController {
    override open func router() -> Router {
        return NextStaticRouter()
    }
}
