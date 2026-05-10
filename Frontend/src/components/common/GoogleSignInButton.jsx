import { useEffect, useRef, useState } from "react";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

let gisLoadPromise = null;
const loadGIS = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return gisLoadPromise;
};

/**
 * Renders Google's OFFICIAL sign-in button via google.accounts.id.renderButton.
 *
 * Why renderButton (not One Tap):
 *  - One Tap requires third-party cookies for accounts.google.com,
 *    which most modern browsers now block by default.
 *  - renderButton works without those cookies because the click
 *    happens inside Google's own iframe.
 *  - It also satisfies Google's branding requirements out of the box.
 *
 * Props:
 *  - onSuccess(idToken)
 *  - onError(err)
 *  - text: "signin_with" | "signup_with" | "continue_with" | "signin"  (default "continue_with")
 *  - theme: "outline" | "filled_blue" | "filled_black"                  (default "outline")
 *  - size: "large" | "medium" | "small"                                 (default "large")
 *  - shape: "rectangular" | "pill"                                      (default "rectangular")
 *  - width: number — pixel width of the rendered button (default 320)
 */
const GoogleSignInButton = ({
  onSuccess,
  onError,
  text = "continue_with",
  theme = "outline",
  size = "large",
  shape = "rectangular",
  width = 320,
}) => {
  const containerRef = useRef(null);
  const [loadError, setLoadError] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGIS()
      .then(() => {
        if (cancelled || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: (response) => {
            if (response?.credential) {
              onSuccess?.(response.credential);
            } else {
              onError?.(new Error("No credential returned from Google"));
            }
          },
          ux_mode: "popup",
          auto_select: false,
        });

        // Clear in case React re-runs the effect (e.g. StrictMode)
        containerRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme,
          size,
          text,
          shape,
          logo_alignment: "left",
          width,
        });

        setReady(true);
      })
      .catch((err) => {
        setLoadError(err);
        onError?.(err);
      });

    return () => {
      cancelled = true;
    };
  }, [onSuccess, onError, text, theme, size, shape, width]);

  if (!CLIENT_ID) {
    return (
      <div className="text-xs text-red-500 text-center py-2">
        Google sign-in disabled — set <code>VITE_GOOGLE_CLIENT_ID</code> in
        <code> Frontend/.env</code>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-xs text-red-500 text-center py-2">
        Couldn't load Google sign-in. Check your internet connection.
      </div>
    );
  }

  return (
    <div className="flex justify-center" style={{ minHeight: 44 }}>
      <div ref={containerRef}></div>
      {!ready && (
        <div className="text-xs text-gray-400 py-2">Loading Google…</div>
      )}
    </div>
  );
};

export default GoogleSignInButton;
