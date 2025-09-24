import { SearchInterface } from "@/components/search-interface";
import { medicalTerms } from "@/lib/medical-terms";

export default function SearchPage() {
  return (
    <div className="flex flex-col h-full">
      <header className="p-4 border-b">
        <h1 className="text-2xl font-bold font-headline">Medical Terminology Search</h1>
        <p className="text-muted-foreground">Search for medical terms and definitions from the Gale Encyclopedia.</p>
      </header>
      <main className="flex-1 p-4">
        <SearchInterface terms={medicalTerms} />
      </main>
    </div>
  );
}
