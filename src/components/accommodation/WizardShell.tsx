import type { ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i + 1 <= step ? "bg-accent" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

export function WizardStep({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-6 space-y-5">{children}</div>
    </div>
  );
}

export function WizardNav({
  onBack,
  onNext,
  nextLabel = "Next",
  submitting = false,
  showBack = true,
}: {
  onBack: () => void;
  onNext: () => void;
  nextLabel?: string;
  submitting?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3">
      {showBack ? (
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          <ArrowLeft className="size-4" /> Back
        </Button>
      ) : (
        <span />
      )}
      <Button type="button" variant="coral" onClick={onNext} disabled={submitting}>
        {submitting ? "Submitting…" : nextLabel} {!submitting && <ArrowRight className="size-4" />}
      </Button>
    </div>
  );
}

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1 text-xs text-destructive">
      {message}
    </p>
  );
}
