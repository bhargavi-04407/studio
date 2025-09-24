import { ChatInterface } from "@/components/chat-interface";
import { InfoPanel } from "@/components/info-panel";
import { medicalTerms } from "@/lib/medical-terms";

export default function Home() {
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
