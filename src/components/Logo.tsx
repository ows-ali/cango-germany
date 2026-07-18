"use client";

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/icons/icon-192x192.png"
      width={size}
      height={size}
      alt="CanGo"
      className={className}
    />
  );
}
