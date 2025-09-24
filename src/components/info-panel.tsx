"use client";

import {
  Book,
  Globe,
  Languages,
  Library,
  Search as SearchIcon,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useMemo } from "react";
import type { MedicalTerm } from "@/lib/medical-terms";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "ja", label: "Japanese" },
  { value: "hi", label: "Hindi" },
  { value: "kn", label: "Kannada" },
  { value: "mr", label: "Marathi" },
  { value: "ml", label: "Malayalam" },
  { value: "ta", label: "Tamil" },
  { value: "te", label: "Telugu" },
];

interface InfoPanelProps {
  terms: MedicalTerm[];
}

export function InfoPanel({ terms }: InfoPanelProps) {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
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
    <div className="flex flex-col h-full bg-card/50 p-6 space-y-6">
      <header>
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-7 h-7 text-primary" />
          <h2 className="text-2xl font-bold text-foreground text-shadow-sm">
            Language & Glossary
          </h2>
        </div>
        <p className="text-muted-foreground">
          Select a language and search the medical glossary.
        </p>
      </header>

      {/* Language Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
          <Languages className="w-4 h-4" />
          Chat Language
        </label>
        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
          <SelectTrigger className="w-full shadow-md bg-white dark:bg-black/20">
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

      {/* Glossary */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="space-y-2 mb-4">
          <label className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
            <Book className="w-4 h-4" />
            Gale Encyclopedia Glossary
          </label>
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search medical terms..."
              className="pl-10 py-5 rounded-full text-sm shadow-inner bg-white dark:bg-black/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-1 -mx-4 rounded-lg">
          <div className="space-y-3 px-4 pb-4">
            {filteredTerms.length > 0 ? (
              filteredTerms.map((term) => (
                <div key={term.id} className="p-4 bg-background/50 rounded-lg border shadow-sm animate-in fade-in duration-300">
                  <h4 className="font-bold text-primary">{term.term}</h4>
                  <p className="text-sm text-foreground/80 mt-1">{term.definition}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-muted-foreground py-10">
                <p className="text-sm">No results for &quot;{searchQuery}&quot;.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Source Info */}
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-xl shadow-inner">
        <div className="flex items-center gap-3">
          <Library className="w-6 h-6 text-amber-600 dark:text-accent" />
          <h3 className="font-bold text-amber-800 dark:text-amber-200">
            Powered by the Gale Encyclopedia
          </h3>
        </div>
        <p className="text-sm text-amber-700 dark:text-amber-400/80 mt-2">
          All medical information and terminology are sourced from the
          comprehensive volumes of the Gale Encyclopedia of Medicine.
        </p>
      </div>
    </div>
  );
}
