import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/Motion";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <Reveal
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <span className="inline-flex items-center gap-2 rounded-full bg-secondary/40 px-4 py-1.5 text-xs font-bold tracking-widest text-foreground uppercase">
          <span className="size-2 rounded-full bg-accent" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-4 text-3xl font-semibold text-balance sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-pretty text-muted-foreground sm:text-lg">{description}</p>
      )}
    </Reveal>
  );
}
