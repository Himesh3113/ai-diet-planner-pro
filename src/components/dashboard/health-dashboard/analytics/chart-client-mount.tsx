"use client";

import { useSyncExternalStore, type ReactNode } from "react";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

type Props = {
  children: ReactNode;
  className?: string;
};

/** Renders Recharts only on the client to avoid SSR/hydration mismatches. */
export function ChartClientMount({ children, className = "h-full w-full" }: Props) {
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div
        className={`${className} animate-pulse rounded-lg bg-white/[0.04]`}
        aria-hidden
      />
    );
  }

  return <>{children}</>;
}
