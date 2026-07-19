import Image from "next/image";

export function Logo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <Image
      src="/icons/icon-192x192.png"
      width={size}
      height={size}
      alt="CanGo"
      className={className}
      priority
      unoptimized
    />
  );
}
