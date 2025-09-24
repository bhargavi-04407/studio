
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function WelcomePage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[rgb(var(--background-start-rgb))] to-[rgb(var(--background-end-rgb))] p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-2xl text-center overflow-hidden">
        <div className="bg-primary/10 p-8">
            <BookOpen className="mx-auto h-24 w-24 text-primary animate-pulse" />
        </div>
        <CardHeader className="px-8 pt-8">
          <CardTitle className="text-4xl font-bold text-foreground">
            The Gale Encyclopedia of Medicine
          </CardTitle>
          <CardDescription className="text-xl pt-2">
            Your Trusted Source for Medical Information
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <p className="text-lg text-muted-foreground mb-8">
            Welcome to MediLexica, an intelligent medical assistant powered by the comprehensive knowledge of the Gale Encyclopedia. Ask questions, get clear answers, and explore medical terms in multiple languages.
          </p>
          <Link href="/login" passHref>
            <Button size="lg" className="text-lg">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
