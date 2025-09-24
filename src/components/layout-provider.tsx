"use client";

import { cn } from "@/lib/utils";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <div className={cn("bg-background transition-all duration-300 ease-in-out")}>
      <div className="h-screen w-full">{children}</div>
    </div>
  );
}
