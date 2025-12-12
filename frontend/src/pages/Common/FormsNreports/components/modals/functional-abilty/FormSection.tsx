import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  sectionId?: string;
  variant?: "a" | "b" | "c" | "d" | "e" | "f";
  children: ReactNode;
  className?: string;
}

const sectionColors: Record<string, string> = {
  a: "bg-primary text-white",
  b: "bg-success text-white",
  c: "bg-info text-dark",
  d: "bg-warning text-dark",
  e: "bg-danger text-white",
  f: "bg-secondary text-white",
};

export function FormSection({
  title,
  sectionId,
  variant = "a",
  children,
  className,
}: FormSectionProps) {
  return (
    <section className={className}>
      {/* Header */}
      <div
        className={`d-flex flex-row  align-items-center gap-2 p-8 rounded-top ${sectionColors[variant]}`}
      >
        {sectionId && (
          <span
            className="d-flex align-items-center justify-content-center rounded bg-light bg-opacity-25 text-dark fw-bold"
            style={{ width: "24px", height: "24px", fontSize: "0.75rem" }}
          >
            {sectionId}
          </span>
        )}

        <span className="fw-semibold">{title}</span>
      </div>

      {/* Body */}
      <div className="border border-top-0 rounded-bottom p-12  shadow-sm" style={{background:"var(--street-card)"}}>
        {children}
      </div>
    </section>
  );
}
