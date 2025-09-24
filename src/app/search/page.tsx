import { SearchInterface } from "@/components/search-interface";
import { medicalTerms } from "@/lib/medical-terms";

export default function SearchPage() {
  return (
    <div className="flex flex-col h-full bg-card">
      <header className="p-6 border-b shadow-sm">
        <h1 className="text-3xl font-bold font-headline text-primary">Medical Terminology Search</h1>
        <p className="text-muted-foreground mt-1 text-lg">Search for medical terms and definitions from the Gale Encyclopedia.</p>
      </header>
      <main className="flex-1 p-6">
        <SearchInterface terms={medicalTerms} />
      </main>
    </div>
  );
}
