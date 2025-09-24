
"use client";

import { ChatInterface } from "@/components/chat-interface";
import { InfoPanel } from "@/components/info-panel";
import { HistorySidebar } from "@/components/history-sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";
import { medicalTerms } from "@/lib/medical-terms";
import { getChatHistory } from "./history/actions";

type ChatSession = Awaited<ReturnType<typeof getChatHistory>>['history'][0];

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [history, setHistory] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [historyKey, setHistoryKey] = useState(Date.now()); // Used to force re-fetch

  const fetchHistory = useCallback(async () => {
    if (user) {
      setIsHistoryLoading(true);
      const { history: chatHistory } = await getChatHistory(user.uid);
      setHistory(chatHistory);
      setIsHistoryLoading(false);
      return chatHistory;
    }
    return [];
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/welcome');
    } else if (user) {
      fetchHistory();
    }
  }, [user, loading, router, fetchHistory, historyKey]);
  
  const handleHistoryUpdate = useCallback(async (newChatId?: string) => {
    const updatedHistory = await fetchHistory();
    if (newChatId) {
      const newChat = updatedHistory.find(c => c.id === newChatId);
      if (newChat) {
        setSelectedChat(newChat);
      }
    }
  }, [fetchHistory]);

  const handleSelectChat = (chat: ChatSession) => {
    setSelectedChat(chat);
  };
  
  const handleNewChat = () => {
    setSelectedChat(null);
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-[rgb(var(--background-start-rgb))] to-[rgb(var(--background-end-rgb))]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-[rgb(var(--background-start-rgb))] to-[rgb(var(--background-end-rgb))]">
      <HistorySidebar 
        history={history}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        isLoading={isHistoryLoading}
      />
      <div className="flex-1 md:w-3/5 lg:w-2/3 h-full overflow-y-auto">
        <ChatInterface 
          key={selectedChat?.id || 'new-chat'}
          selectedLanguage={selectedLanguage}
          chatSession={selectedChat}
          onHistoryUpdate={handleHistoryUpdate}
        />
      </div>
      <div className="hidden md:block md:w-2/5 lg:w-1/3 h-full border-l border-gray-200/50 dark:border-gray-800/50">
        <InfoPanel 
          terms={medicalTerms} 
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>
    </div>
  );
}
