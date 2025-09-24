"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Send, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { askQuestion } from "@/app/actions";

const chatFormSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
];

export function ChatInterface() {
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
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  async function onSubmit(values: z.infer<typeof chatFormSchema>) {
    setIsSubmitting(true);
    const userMessage: Message = {
      id: String(Date.now()),
      role: "user",
      content: values.message,
    };
    setMessages((prev) => [...prev, userMessage]);
    form.reset();
    
    // Add a temporary "typing" message
    const typingMessageId = String(Date.now() + 1);
    const typingMessage: Message = {
      id: typingMessageId,
      role: 'assistant',
      content: '...'
    };
    setMessages((prev) => [...prev, typingMessage]);

    const result = await askQuestion({
      question: values.message,
      language: selectedLanguage,
    });

    if (result.success) {
      const assistantMessage: Message = {
        id: String(Date.now() + 2),
        role: "assistant",
        content: result.answer,
      };
      setMessages((prev) => prev.map(m => m.id === typingMessageId ? assistantMessage : m));
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
       setMessages((prev) => prev.filter(m => m.id !== typingMessageId));
    }
    setIsSubmitting(false);
  }

  return (
    <div className="flex flex-col h-full">
        <header className="p-4 border-b flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold font-headline">Intelligent Medical Chat</h1>
                <p className="text-muted-foreground">Ask medical questions and get answers from Gale Encyclopedia.</p>
            </div>
            <div className="w-40">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                    <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                    {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                    </SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
        </header>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" && "justify-end"
                )}
              >
                {message.role === "assistant" && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback>
                      <Bot className="w-5 h-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-md rounded-lg p-3 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-card"
                  )}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <Avatar className="w-8 h-8 border">
                    <AvatarFallback>
                      <User className="w-5 h-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>

      <div className="p-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-start gap-3">
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      placeholder="Type your medical question here..."
                      autoComplete="off"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isSubmitting}>
              <Send className="w-5 h-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
