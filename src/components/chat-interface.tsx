
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Send, ThumbsUp, ThumbsDown, Book, Search, Mic, LogOut, Volume2, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { askQuestion, getSpeech } from "@/app/actions";
import { getChatHistory } from "@/app/history/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";


const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  isTyping?: boolean;
};

type ChatSession = Awaited<ReturnType<typeof getChatHistory>>['history'][0];

interface ChatInterfaceProps {
  selectedLanguage: string;
  chatSession: ChatSession | null;
  onHistoryUpdate: (chatId?: string) => void;
}

function UserAvatar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      toast({ title: "Signed out successfully!" });
      router.push('/welcome');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed",
        description: error.message,
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="w-10 h-10 border-2 border-primary/50 shadow-lg bg-background cursor-pointer">
          {user?.photoURL ? (
            <Image src={user.photoURL} alt={user.displayName || "user"} width={40} height={40} />
          ) : (
            <AvatarFallback className="bg-transparent text-2xl">
              <span>👤</span>
            </AvatarFallback>
          )}
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const AssistantMessage = ({ content, languageCode }: { content: string, languageCode: string }) => {
  const { toast } = useToast();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const parts = content.split(/\n\n/);
  const summary = parts.find(p => p.startsWith('**Summary:**'))?.replace('**Summary:**', '').trim();
  const details = parts.find(p => p.startsWith('**Details:**'))?.replace('**Details:**', '').trim();
  
  const handleSpeak = async (text: string) => {
    if (isSpeaking) {
        audioRef.current?.pause();
        audioRef.current = null;
        setIsSpeaking(false);
        return;
    }
    
    setIsSpeaking(true);
    const result = await getSpeech({ text, languageCode });
    if (result.success && result.audio) {
      const audio = new Audio(result.audio);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };
    } else {
      toast({
        variant: 'destructive',
        title: 'Text-to-Speech Failed',
        description: result.error,
      });
      setIsSpeaking(false);
    }
  };
  
  const contentToSpeak = [summary, details].filter(Boolean).join('\n\n');

  if (summary && details) {
    return (
      <>
        <p className="whitespace-pre-wrap leading-relaxed font-medium">{summary}</p>
        <div className="flex flex-col gap-2">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-b-0">
                <AccordionTrigger className="text-sm py-2 hover:no-underline justify-start gap-1">Show Details</AccordionTrigger>
                <AccordionContent>
                  <p className="whitespace-pre-wrap leading-relaxed">{details}</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="flex items-center gap-2">
               <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleSpeak(contentToSpeak)}
                      className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    >
                      {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isSpeaking ? "Stop speaking" : "Read aloud"}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
        <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
        <div className="flex items-center gap-2">
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSpeak(content)}
                  className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                >
                  {isSpeaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isSpeaking ? "Stop speaking" : "Read aloud"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
    </div>
  );
};

export function ChatInterface({ selectedLanguage, chatSession, onHistoryUpdate }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(undefined);

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  
  useEffect(() => {
    if (chatSession) {
        setCurrentChatId(chatSession.id);
        setMessages(chatSession.messages.map((m, i) => ({ ...m, id: `${chatSession.id}-${i}` })));
    } else {
        setCurrentChatId(undefined);
        setMessages([{
            id: "1",
            role: "assistant" as const,
            content: "Welcome to MediLexica. How can I help you with your medical questions today?",
        }]);
    }
  }, [chatSession]);


  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
  }, [messages]);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.lang = selectedLanguage;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        form.setValue("message", transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        toast({
            variant: "destructive",
            title: "Voice Recognition Error",
            description: event.error,
        });
        setIsListening(false);
      };
       recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [selectedLanguage, form, toast]);

  const handleVoiceSearch = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.start();
      setIsListening(true);
    } else {
        toast({
            variant: "destructive",
            title: "Voice Recognition Not Supported",
            description: "Your browser does not support voice recognition.",
        });
    }
  };

  async function onSubmit(values: z.infer<typeof chatFormSchema>) {
    setIsSubmitting(true);
    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content: values.message,
    };
    
    const typingMessage: Message = {
      id: String(Date.now() + 1),
      role: 'assistant',
      content: '...',
      isTyping: true
    };
    
    const currentMessages = messages.filter(m => m.role !== 'system' && !m.isTyping);
    setMessages((prev) => [...prev, userMessage, typingMessage]);
    form.reset();

    const result = await askQuestion({
      question: values.message,
      language: selectedLanguage,
      messages: currentMessages, // Pass only the history before the new user message
      chatId: currentChatId
    });
    
    setMessages((prev) => prev.filter(m => m.id !== typingMessage.id));

    if (result.success && result.answer) {
      const assistantMessage: Message = {
        id: String(Date.now() + 2),
        role: "assistant",
        content: result.answer,
      };
      setMessages((prev) => [...prev.filter(m => m.id !== userMessage.id), userMessage, assistantMessage]);
      
      if (result.chatId && result.chatId !== currentChatId) {
        setCurrentChatId(result.chatId);
      }
      onHistoryUpdate(result.chatId);

    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
       setMessages((prev) => prev.filter(m => m.id !== typingMessage.id && m.id !== userMessage.id));
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-hidden p-6">
        <ScrollArea className="h-full" ref={scrollAreaRef}>
          <div className="space-y-8 max-w-4xl mx-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-4 animate-in fade-in duration-500",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className={cn("w-10 h-10 border-2 border-primary/50 shadow-lg bg-background", message.isTyping && "animate-pulse")}>
                    <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                      <span>🤖</span>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("flex flex-col gap-2 max-w-2xl", message.role === 'user' && 'items-end')}>
                  <div
                    className={cn(
                      "rounded-2xl p-4 text-base shadow-lg space-y-2 transition-all duration-300",
                       message.isTyping && "animate-pulse",
                      message.role === "user"
                        ? "bg-[hsl(var(--user-bubble))] text-[hsl(var(--user-bubble-foreground))] rounded-br-none"
                        : "bg-[hsl(var(--assistant-bubble))] text-[hsl(var(--assistant-bubble-foreground))] rounded-bl-none border border-black/5 dark:border-white/5"
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <AssistantMessage content={message.content} languageCode={selectedLanguage} />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  {message.role === 'assistant' && !message.isTyping && (
                    <div className="flex items-center gap-2">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-green-100 dark:hover:bg-green-900/50 hover:text-green-600 dark:hover:text-green-400">
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Good response</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400">
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bad response</TooltipContent>
                        </Tooltip>
                         <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                                <Book className="w-4 h-4" />
                              </Button>                          
                          </TooltipTrigger>
                          <TooltipContent>View in glossary</TooltipContent>
                        </Tooltip>
                         <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                                <Search className="w-4 h-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>View sources</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  )}
                </div>
                {message.role === "user" && (
                  <UserAvatar />
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t bg-transparent max-w-4xl mx-auto w-full">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
             <UserAvatar />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Ask a medical question..."
                        autoComplete="off"
                        {...field}
                        disabled={isSubmitting}
                        className="text-base py-6 rounded-full px-14 shadow-inner bg-background/80 dark:bg-black/20 focus-visible:ring-primary/50"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button type="button" size="icon" onClick={handleVoiceSearch} disabled={isSubmitting} className={cn("rounded-full w-10 h-10 shadow-md hover:shadow-lg transition-all absolute left-2 top-1/2 -translate-y-1/2 bg-[hsl(var(--navy-blue))] hover:bg-[hsl(var(--navy-blue))]/90 text-[hsl(var(--navy-blue-foreground))]", isListening && "bg-red-500 hover:bg-red-600")}>
                                <Mic className="w-5 h-5" />
                                <span className="sr-only">Voice Search</span>
                              </Button>
                          </TooltipTrigger>
                           <TooltipContent>{isListening ? "Stop listening" : "Start listening"}</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <Button type="submit" size="icon" disabled={isSubmitting} className="rounded-full w-10 h-10 shadow-md hover:shadow-lg transition-all absolute right-2 top-1/2 -translate-y-1/2 bg-[hsl(var(--navy-blue))] hover:bg-[hsl(var(--navy-blue))]/90 text-[hsl(var(--navy-blue-foreground))]">
                        <Send className="w-5 h-5" />
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </div>
  );
}
