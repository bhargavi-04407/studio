"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Search } from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 p-2">
            <Logo className="w-8 h-8 text-primary" />
            <span className="text-lg font-bold font-headline group-data-[collapsible=icon]:hidden">
              MediLexica
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/"}
                tooltip="Chat"
              >
                <Link href="/">
                  <MessageSquare />
                  <span>Chat</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === "/search"}
                tooltip="Search"
              >
                <Link href="/search">
                  <Search />
                  <span>Search</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset
        className={cn(
          "bg-background transition-all duration-300 ease-in-out"
        )}
      >
        <div className="h-full w-full">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
