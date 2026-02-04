"use client";

import Image from "next/image";
import { useState } from "react";

type ClickProLogoProps = {
  size?: number;
  className?: string;
  textClassName?: string;
  priority?: boolean;
};

export default function ClickProLogo({
  size = 32,
  className = "",
  textClassName = "",
  priority = false,
}: ClickProLogoProps) {
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className={`flex items-center justify-center ${className}`.trim()}
      style={{ width: size, height: size }}
    >
      {hasError ? (
        <span
          className={`text-sm font-semibold leading-none ${textClassName}`.trim()}
        >
          CP
        </span>
      ) : (
        <Image
          src="/brand/clickpro-logo.svg"
          alt="ClickPro"
          width={size}
          height={size}
          className="h-full w-full object-contain"
          onError={() => setHasError(true)}
          priority={priority}
        />
      )}
    </div>
  );
}
