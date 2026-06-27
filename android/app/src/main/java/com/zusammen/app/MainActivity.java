package com.zusammen.app;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Serve the Next.js static export as a multi-page app: resolve
        // extensionless routes to their own index.html instead of the SPA root
        // shell (PROJ-9). See NextStaticWebViewClient — the Android counterpart
        // to the iOS NextStaticRouter.
        getBridge().setWebViewClient(new NextStaticWebViewClient(getBridge()));
    }
}
