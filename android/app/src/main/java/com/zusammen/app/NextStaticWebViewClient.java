package com.zusammen.app;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;

/**
 * Android counterpart to the iOS {@code NextStaticRouter} (PROJ-9).
 *
 * The app ships a Next.js static export ({@code output: 'export'},
 * {@code trailingSlash: true}) — a multi-page app where every route is a real
 * file on disk ({@code /login/index.html}, {@code /groups/view/index.html}, …).
 *
 * Capacitor's local server is built for single-page apps: with {@code html5mode}
 * (the default) it maps every extensionless path (e.g. {@code /login}) to the
 * <em>root</em> {@code index.html}. With a static export that breaks all hard
 * navigations ({@code window.location.href = '/login'}, cold-start deep-link
 * targets) — the WebView keeps re-serving the root shell, which renders blank for
 * unauthenticated users → white screen.
 *
 * This client rewrites an extensionless/directory request to that route's own
 * {@code index.html} before Capacitor serves it, then delegates to the normal
 * asset pipeline (correct mime types, JS injection). Files with an extension and
 * the root path ({@code /}) are passed through untouched. This is purely native —
 * the web/JS layer is unchanged, keeping one codebase.
 */
public class NextStaticWebViewClient extends BridgeWebViewClient {

    /** Bundled web assets live under this directory in the APK's assets/. */
    private static final String ASSET_BASE = "public";

    private final Bridge bridge;

    public NextStaticWebViewClient(Bridge bridge) {
        super(bridge);
        this.bridge = bridge;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        String path = url.getPath();

        if (path != null && !path.equals("/") && "GET".equalsIgnoreCase(request.getMethod())) {
            String last = url.getLastPathSegment();
            boolean extensionless = last == null || !last.contains(".");
            if (extensionless) {
                String candidate = (path.endsWith("/") ? path + "index.html" : path + "/index.html");
                // Resolve to the route's own index.html when it exists, otherwise fall
                // back to the root shell — mirroring the iOS NextStaticRouter so an
                // unknown route degrades gracefully instead of showing a blank page.
                String newPath = assetExists(candidate) ? candidate : "/index.html";
                Uri rewrittenUrl = url.buildUpon().path(newPath).build();
                return super.shouldInterceptRequest(view, new RewrittenRequest(request, rewrittenUrl));
            }
        }

        return super.shouldInterceptRequest(view, request);
    }

    /** True if {@code <ASSET_BASE><pathFromRoot>} exists as a bundled asset. */
    private boolean assetExists(String pathFromRoot) {
        try (InputStream is = bridge.getContext().getAssets().open(ASSET_BASE + pathFromRoot)) {
            return true;
        } catch (IOException e) {
            return false;
        }
    }

    /** Wraps a {@link WebResourceRequest}, overriding only the resolved URL. */
    private static final class RewrittenRequest implements WebResourceRequest {
        private final WebResourceRequest original;
        private final Uri url;

        RewrittenRequest(WebResourceRequest original, Uri url) {
            this.original = original;
            this.url = url;
        }

        @Override
        public Uri getUrl() {
            return url;
        }

        @Override
        public boolean isForMainFrame() {
            return original.isForMainFrame();
        }

        @Override
        public boolean isRedirect() {
            return original.isRedirect();
        }

        @Override
        public boolean hasGesture() {
            return original.hasGesture();
        }

        @Override
        public String getMethod() {
            return original.getMethod();
        }

        @Override
        public Map<String, String> getRequestHeaders() {
            return original.getRequestHeaders();
        }
    }
}
