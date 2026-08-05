import { motion, useReducedMotion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const easeOut = [0.22, 1, 0.36, 1] as const;

export function useMotionOk() {
  return !useReducedMotion();
}

/** Fade + rise on scroll into view. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  as?: "div" | "section" | "li" | "span";
}) {
  const ok = useMotionOk();
  const Comp = motion[as];
  return (
    <Comp
      className={className}
      initial={ok ? { opacity: 0, y } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: easeOut }}
    >
      {children}
    </Comp>
  );
}

/** Container that staggers direct <Stagger.Item> children. */
export const staggerParent: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const staggerChild: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: easeOut } },
};

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ok = useMotionOk();
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      initial={ok ? "hidden" : false}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div className={className} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/** Soft idle floating wrapper — pauses under prefers-reduced-motion via CSS. */
export function Float({
  children,
  className,
  distance = -12,
  duration = 6,
  delay = 0,
  tilt = 0,
}: {
  children: ReactNode;
  className?: string;
  distance?: number;
  duration?: number;
  delay?: number;
  tilt?: number;
}) {
  return (
    <div
      className={cn("animate-float", className)}
      style={
        {
          "--msn-float-distance": `${distance}px`,
          "--msn-tilt": `${tilt}deg`,
          animationDuration: `${duration}s`,
          animationDelay: `${delay}s`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
