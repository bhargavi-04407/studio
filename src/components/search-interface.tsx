"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MedicalTerm } from "@/lib/medical-terms";
import { Search as SearchIcon } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface SearchInterfaceProps {
  terms: MedicalTerm[];
}

export function SearchInterface({ terms }: SearchInterfaceProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTerms = useMemo(() => {
    if (!searchQuery) {
      return terms;
    }
    return terms.filter(
      (term) =>
        term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        term.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, terms]);

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for a medical term..."
          className="pl-12 py-6 rounded-full text-base shadow-inner"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <ScrollArea className="flex-1 -mx-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-4">
          {filteredTerms.length > 0 ? (
            filteredTerms.map((term) => (
              <Card key={term.id} className="flex flex-col shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-2xl overflow-hidden group">
                <CardHeader className="bg-primary/5">
                  <CardTitle className="font-headline text-primary group-hover:text-primary/90 transition-colors">{term.term}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 p-6">
                  <CardDescription className="text-base text-card-foreground/80">{term.definition}</CardDescription>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-16">
                <p className="text-lg">No results found for &quot;{searchQuery}&quot;.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
