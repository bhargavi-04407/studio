import { InfoPanel } from "@/components/info-panel";
import { medicalTerms } from "@/lib/medical-terms";

export default function SearchPage() {
  return (
    <div className="flex flex-col h-full bg-card">
      <main className="flex-1">
        <InfoPanel terms={medicalTerms} />
      </main>
    </div>
  );
}
