"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { Share2, DownloadCloud } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform?: string }>;
};

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 30; // não mostrar por X dias após recusar
const NAV_TRIGGER = 3; // número de navegações para acionar
const TIME_TRIGGER_MS = 10000; // ou após 10s

export default function PwaInstallPopup() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [timed, setTimed] = useState(false);
  const navCountRef = useRef<number>(
    typeof window !== "undefined"
      ? Number(sessionStorage.getItem("pwa-nav-count") || 0)
      : 0,
  );

  // Check if app is already installed / standalone
  const isInstalled =
    typeof window !== "undefined" &&
    ((window.matchMedia &&
      window.matchMedia("(display-mode: standalone)").matches) ||
      ((navigator as Navigator & { standalone?: boolean }).standalone ??
        false) === true);

  useEffect(() => {
    // iOS Safari detection
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
    const isIOS = /iP(ad|hone|od)/.test(ua);
    const isSafari =
      /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|Chrome|Chromium/.test(ua);
    setIsIosSafari(isIOS && isSafari);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const ev = e as BeforeInstallPromptEvent;
      e.preventDefault();
      setDeferredPrompt(ev);
    };
    window.addEventListener("beforeinstallprompt", handler as EventListener);
    const timer = window.setTimeout(() => setTimed(true), TIME_TRIGGER_MS);
    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler as EventListener,
      );
      clearTimeout(timer);
    };
  }, []);

  // track navigations using pathname (Next.js app router)
  useEffect(() => {
    // increment nav count on pathname changes
    if (typeof window === "undefined") return;
    const cur = sessionStorage.getItem("pwa-nav-count");
    const count = cur ? Number(cur) + 1 : 1;
    sessionStorage.setItem("pwa-nav-count", String(count));
    navCountRef.current = count;
  }, [pathname]);

  // decide whether we should show the popup
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isInstalled) return;

    const dismissed = (() => {
      const raw = localStorage.getItem(DISMISS_KEY);
      if (!raw) return false;
      try {
        const ts = Number(raw);
        const diffDays = (Date.now() - ts) / (1000 * 60 * 60 * 24);
        return diffDays < DISMISS_DAYS;
      } catch {
        return false;
      }
    })();
    if (dismissed) return;

    const navOk = navCountRef.current >= NAV_TRIGGER;
    const timeOk = timed;

    // If iOS Safari, show based on triggers (no deferredPrompt)
    if (isIosSafari) {
      if ((navOk || timeOk) && !show) setShow(true);
      return;
    }

    // normal browsers with beforeinstallprompt
    if (deferredPrompt && (navOk || timeOk) && !show) setShow(true);
  }, [deferredPrompt, timed, isIosSafari, isInstalled, show]);

  function handleDismiss() {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setShow(false);
  }

  async function handleInstall() {
    if (isIosSafari) {
      // nothing programmatic possible for iOS
      handleDismiss();
      return;
    }
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        // user accepted installation
        setShow(false);
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      } else {
        // user dismissed the install prompt
        handleDismiss();
      }
    } catch (err) {
      console.error("PWA install prompt error", err);
      handleDismiss();
    }
  }

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        zIndex: 10000,
        padding: 16,
      }}
    >
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div
          style={{
            background: "var(--color-card)",
            color: "var(--color-card-foreground)",
            borderRadius: "var(--radius-card)",
            boxShadow: "var(--shadow-card)",
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "stretch",
          }}
        >
          <div>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 16 }}>
              Adicione o Colalá à tela inicial
            </div>
            {isIosSafari ? (
              <div
                style={{
                  fontSize: 14,
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                <span>Toque em</span>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "6px 10px",
                    borderRadius: 8,
                    background: "var(--color-muted)",
                  }}
                >
                  <Share2
                    size={16}
                    style={{ color: "var(--color-foreground)" }}
                  />
                  <span style={{ fontWeight: 600 }}>Compartilhar</span>
                </div>
                <span>→</span>
                <span style={{ fontWeight: 600 }}>
                  Adicionar à Tela de Início
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 14 }}>
                Instale o aplicativo para acesso mais rápido e offline.
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleDismiss}
              style={{
                background: "transparent",
                border: "1px solid var(--color-border)",
                padding: "8px 12px",
                borderRadius: 8,
                color: "var(--color-foreground)",
              }}
            >
              Agora não
            </button>
            <button
              onClick={handleInstall}
              style={{
                background: "var(--color-primary)",
                color: "var(--color-primary-foreground)",
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                display: "inline-flex",
                gap: 8,
                alignItems: "center",
              }}
            >
              <DownloadCloud size={16} />
              <span>Instalar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
