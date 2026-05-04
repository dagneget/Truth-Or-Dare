"use client";

export function NeonBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="neon-bg relative min-h-dvh w-full overflow-x-hidden">{children}</div>
  );
}
