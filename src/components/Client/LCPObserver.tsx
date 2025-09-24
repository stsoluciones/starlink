"use client";
import { useEffect } from "react";

// Lightweight LCP observer for local analysis. Enable with NEXT_PUBLIC_DEBUG_LCP=1
export default function LCPObserver() {
  const enabled = process.env.NEXT_PUBLIC_DEBUG_LCP === "1";

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("PerformanceObserver" in window)) return;

    let lcpEntry: any = null;
    const po = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) lcpEntry = last as any;
    });

    try {
      po.observe({ type: "largest-contentful-paint", buffered: true as any });
    } catch {
      // older browsers may not support LCP
      return;
    }

    const finalize = () => {
      if (!lcpEntry) return;
      const el = (lcpEntry.element ?? null) as HTMLElement | null;
      const info = {
        value: lcpEntry.startTime, // ms since nav start
        size: lcpEntry.size,
        id: el?.id || null,
        tag: el?.tagName || null,
        url: (lcpEntry.url as string) || null,
        width: lcpEntry?.width,
        height: lcpEntry?.height,
      };

      // Expose for quick inspection and log
      // @ts-ignore
      window.__LCP = info;
      // eslint-disable-next-line no-console
      console.log("[LCP]", info);

      if (el) {
        try {
          el.setAttribute("data-lcp", "true");
          el.style.outline = "3px dashed #ff5252";
          el.style.outlineOffset = "2px";
        } catch {}
      }
    };

    const onHidden = () => {
      finalize();
      po.disconnect();
      document.removeEventListener("visibilitychange", onHidden, true);
      window.removeEventListener("pagehide", onHidden, true);
    };

    document.addEventListener("visibilitychange", onHidden, true);
    window.addEventListener("pagehide", onHidden, true);

    return () => onHidden();
  }, [enabled]);

  return null;
}
