
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { ChevronsLeft, History, Loader2, Plus, MessageSquare } from "lucide-react";
import { useState } from "react";
import { getChatHistory } from "@/app/history/actions";
import { formatDistanceToNow } from 'date-fns';

type ChatSession = Awaited<ReturnType<typeof getChatHistory>>['history'][0];

interface HistorySidebarProps {
  history: ChatSession[];
  onSelectChat: (chat: ChatSession) => void;
  onNewChat: () => void;
  isLoading: boolean;
}

export function HistorySidebar({ history, onSelectChat, onNewChat, isLoading }: HistorySidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectChat = (chat: ChatSession) => {
    onSelectChat(chat);
    setIsOpen(false);
  }
  
  const handleNewChat = () => {
    onNewChat();
    setIsOpen(false);
  }

  const sidebarContent = (
    <>
      <Button onClick={handleNewChat} className="mb-4 w-full" variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        New Chat
      </Button>
      <ScrollArea className="flex-1 -mx-4">
         <div className="px-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : history.length > 0 ? (
            history.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectChat(session)}
                className="w-full text-left p-3 rounded-lg hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <p className="font-semibold truncate text-foreground">{session.title}</p>
                <p className="text-xs text-muted-foreground">
                    {session.updatedAt ? formatDistanceToNow(new Date(session.updatedAt), { addSuffix: true }) : 'Just now'}
                </p>
              </button>
            ))
          ) : (
            <div className="text-center text-muted-foreground p-4 flex flex-col items-center">
              <MessageSquare className="w-10 h-10 mb-2"/>
              <p className="text-sm">No chat history yet.</p>
              <p className="text-xs">Your conversations will appear here.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-col w-72 border-r border-gray-200/30 dark:border-gray-800/30 bg-card/80 backdrop-blur-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Chat History</h2>
          </div>
        </div>
        {sidebarContent}
      </div>

      {/* Mobile Sheet */}
      <div className="lg:hidden absolute top-4 left-4 z-10">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <History className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[340px] p-0 border-none">
             <div className="flex flex-col h-full bg-card/80 backdrop-blur-sm p-4">
                <SheetHeader className="mb-4">
                    <SheetTitle className="flex items-center gap-2">
                        <History className="w-6 h-6 text-primary" />
                        <span>Chat History</span>
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                    A list of your past chat sessions. You can select a session to view it or start a new chat.
                    </SheetDescription>
                </SheetHeader>
                {sidebarContent}
             </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

