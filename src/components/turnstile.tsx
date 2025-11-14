"use client";

import { useEffect, useRef, useState, useCallback } from "react";

declare global {
  interface Window {
    turnstile: {
      render: (
        element: HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onError?: () => void;
  onExpire?: () => void;
}

export function Turnstile({ onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Use refs for callbacks to prevent re-renders
  const onVerifyRef = useRef(onVerify);
  const onErrorRef = useRef(onError);
  const onExpireRef = useRef(onExpire);

  // Update refs when callbacks change
  useEffect(() => {
    onVerifyRef.current = onVerify;
    onErrorRef.current = onError;
    onExpireRef.current = onExpire;
  }, [onVerify, onError, onExpire]);

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

    if (!siteKey) {
      console.error("NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set");
      return;
    }

    // Check if script is already loaded
    if (window.turnstile) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in the DOM
    const existingScript = document.querySelector(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
    );

    if (existingScript) {
      // Script exists, wait for it to load
      if (scriptLoadedRef.current) {
        setIsLoaded(true);
      } else {
        existingScript.addEventListener("load", () => {
          setIsLoaded(true);
          scriptLoadedRef.current = true;
        });
      }
      return;
    }

    // Load Turnstile script
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setIsLoaded(true);
      scriptLoadedRef.current = true;
    };

    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current) return;

    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!siteKey || !window.turnstile) return;

    // Don't render if widget already exists
    if (widgetIdRef.current) {
      return;
    }

    // Check if container already has a widget (from previous render)
    if (containerRef.current.children.length > 0) {
      return;
    }

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onVerifyRef.current(token);
        },
        "error-callback": () => {
          if (onErrorRef.current) onErrorRef.current();
        },
        "expired-callback": () => {
          if (onExpireRef.current) onExpireRef.current();
        },
      });

      widgetIdRef.current = widgetId;
    } catch (error) {
      console.error("Failed to render Turnstile widget:", error);
    }

    // Cleanup function
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    };
  }, [isLoaded]);

  return <div ref={containerRef} />;
}

