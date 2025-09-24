"use client";

import { ChatInterface } from "@/components/chat-interface";
import { InfoPanel } from "@/components/info-panel";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[rgb(var(--background-start-rgb))] to-[rgb(var(--background-end-rgb))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[rgb(var(--background-start-rgb))] to-[rgb(var(--background-end-rgb))]">
      <div className="w-full md:w-3/5 lg:w-2/3 h-full overflow-y-auto">
        <ChatInterface />
      </div>
      <div className="hidden md:block md:w-2/5 lg:w-1/3 h-full border-l border-gray-200/50 dark:border-gray-800/50">
        <InfoPanel terms={medicalTerms} />
      </div>
    </div>
  );
}

import { medicalTerms } from "@/lib/medical-terms";
