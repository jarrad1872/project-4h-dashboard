"use client";

import { useMemo, useRef, useState } from "react";
import type { MouseEvent } from "react";

interface DemoCallButtonProps {
  phoneLabel: string;
  telHref: string;
}

function nextTrackingUrl() {
  const params = new URLSearchParams(window.location.search);
  params.set("event_type", "demo_call");
  params.set("format", "json");
  params.set("session_id", crypto.randomUUID());

  return `/api/sales/track?${params.toString()}`;
}

export function DemoCallButton({ phoneLabel, telHref }: DemoCallButtonProps) {
  const [logged, setLogged] = useState(false);
  const inFlight = useRef(false);
  const callText = useMemo(() => (logged ? `Calling ${phoneLabel}` : `Call ${phoneLabel}`), [logged, phoneLabel]);

  function logAndCall(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (inFlight.current) return;

    inFlight.current = true;
    const trackingUrl = nextTrackingUrl();
    const fullTrackingUrl = new URL(trackingUrl, window.location.origin).toString();

    if (navigator.sendBeacon) {
      navigator.sendBeacon(fullTrackingUrl);
      setLogged(true);
      window.setTimeout(() => {
        window.location.href = telHref;
      }, 60);
      return;
    }

    fetch(fullTrackingUrl, { keepalive: true }).finally(() => {
      setLogged(true);
      window.location.href = telHref;
    });
  }

  return (
    <a
      href={telHref}
      onClick={logAndCall}
      className="mt-5 inline-flex rounded-lg bg-amber-300 px-5 py-3 text-lg font-black text-slate-950 hover:bg-amber-200"
      data-testid="dustin-demo-call-button"
    >
      {callText}
    </a>
  );
}
