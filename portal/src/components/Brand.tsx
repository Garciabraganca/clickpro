import Image from "next/image";

interface BrandProps {
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

const sizeMap = {
  sm: { image: 32, title: "text-base", subtitle: "text-[11px]" },
  md: { image: 40, title: "text-lg", subtitle: "text-xs" },
  lg: { image: 48, title: "text-2xl", subtitle: "text-sm" },
} as const;

export default function Brand({
  size = "md",
  subtitle,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
}: BrandProps) {
  const selected = sizeMap[size];

  return (
    <div className={`flex items-center gap-3 ${className}`.trim()}>
      <Image
        src="/logomarca-click-pro.png"
        alt="ClickPro"
        width={selected.image}
        height={selected.image}
        sizes="(max-width: 768px) 32px, 48px"
        className="rounded-xl object-contain shadow-lg shadow-violet-500/25"
        priority
      />
      <div className="leading-tight">
        <p className={`font-bold text-slate-900 dark:text-slate-100 ${selected.title} ${titleClassName}`.trim()}>
          ClickPro
        </p>
        {subtitle ? (
          <p
            className={`text-slate-500 dark:text-slate-400 ${selected.subtitle} ${subtitleClassName}`.trim()}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
