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
import { Bot, Send, User, ThumbsUp, ThumbsDown, Book, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { askQuestion } from "@/app/actions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";


const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  isTyping?: boolean;
};

interface ChatInterfaceProps {
  selectedLanguage: string;
}

export function ChatInterface({ selectedLanguage }: ChatInterfaceProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Welcome to MediLexica. How can I help you with your medical questions today?",
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof chatFormSchema>>({
    resolver: zodResolver(chatFormSchema),
    defaultValues: {
      message: "",
    },
  });

  useEffect(() => {
    setTimeout(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: scrollAreaRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 100)
  }, [messages]);

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

    setMessages((prev) => [...prev, userMessage, typingMessage]);
    form.reset();
    
    const result = await askQuestion({
      question: values.message,
      language: selectedLanguage,
    });

    if (result.success && result.answer) {
      const assistantMessage: Message = {
        id: typingMessage.id, // Replace typing message
        role: "assistant",
        content: result.answer,
      };
      setMessages((prev) => prev.map(m => m.id === typingMessage.id ? assistantMessage : m));
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
       setMessages((prev) => prev.filter(m => m.id !== typingMessage.id));
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col h-full bg-transparent text-foreground">
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
                  <Avatar className="w-10 h-10 border-2 border-primary/50 shadow-lg bg-background">
                    <AvatarFallback className="bg-primary/20 text-primary">
                      <Bot className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("flex flex-col gap-2 max-w-2xl", message.role === 'user' && 'items-end')}>
                  <div
                    className={cn(
                      "rounded-2xl p-4 text-base shadow-lg space-y-2 transition-all duration-300",
                       message.isTyping && "animate-pulse",
                      message.role === "user"
                        ? "bg-[--user-bubble] text-[--user-bubble-foreground] rounded-br-none"
                        : "bg-[--assistant-bubble] text-[--assistant-bubble-foreground] rounded-bl-none border border-black/5"
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  {message.role === 'assistant' && !message.isTyping && (
                    <div className="flex items-center gap-2">
                       <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:bg-green-100 hover:text-green-600">
                              <ThumbsUp className="w-4 h-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Good response</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:bg-red-100 hover:text-red-600">
                                <ThumbsDown className="w-4 h-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>Bad response</TooltipContent>
                        </Tooltip>
                         <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:bg-blue-100 hover:text-blue-600">
                                <Book className="w-4 h-4" />
                              </Button>
                          </TooltipTrigger>
                          <TooltipContent>View in glossary</TooltipContent>
                        </Tooltip>
                         <Tooltip>
                          <TooltipTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-600 hover:bg-yellow-100 hover:text-yellow-600">
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-4">
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
                        className="text-base py-6 rounded-full px-6 shadow-inner bg-white dark:bg-black/20 focus-visible:ring-primary/50"
                      />
                      <Button type="submit" size="icon" disabled={isSubmitting} className="rounded-full w-10 h-10 shadow-md hover:shadow-lg transition-all absolute right-2 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary/90">
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


import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

function UserAvatar() {
  const { user } = useAuth();
  return (
    <Avatar className="w-10 h-10 border-2 border-primary/50 shadow-lg bg-background">
      {user?.photoURL ? (
        <Image src={user.photoURL} alt={user.displayName || "user"} width={40} height={40} />
      ) : (
        <AvatarFallback className="bg-primary/20 text-primary">
          <User className="w-6 h-6" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
