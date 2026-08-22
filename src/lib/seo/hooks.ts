"use client";

import { useEffect, useState } from "react";

export function useFetch<T>(url: string | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(!!url);
  const [error, setError] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null | undefined>(undefined);

  // Adjust state during render when url changes (recommended React pattern:
  // store previous value in state, conditionally update). Avoids setState-in-effect.
  if (prevUrl !== url) {
    setPrevUrl(url);
    setLoading(!!url);
    setError(null);
    if (!url) setData(null);
  }

  useEffect(() => {
    if (!url) return;
    let active = true;
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Request failed: ${r.status}`);
        return r.json();
      })
      .then((json) => {
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (active && e instanceof Error && e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [url]);

  return { data, loading, error };
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return Math.round(n).toString();
}

export function formatFull(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatPercent(n: number, digits = 1): string {
  return (n >= 0 ? "+" : "") + n.toFixed(digits) + "%";
}

export function formatMoney(n: number): string {
  return "$" + n.toFixed(2);
}
